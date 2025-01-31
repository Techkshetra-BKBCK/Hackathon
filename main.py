from flask import Flask, request, jsonify
import psycopg2
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from apscheduler.schedulers.background import BackgroundScheduler
import os
from datetime import datetime
from dotenv import load_dotenv
from functions import check_phishing
import ipdb;

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get configuration from environment variables
DB_CONNECTION = os.getenv('DATABASE_URL')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL', SENDER_EMAIL)  # Default to sender email if not specified

def get_db_connection():
    """Create and return a database connection."""
    try:
        return psycopg2.connect(DB_CONNECTION)
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def create_tables():
    """Create necessary database tables if they don't exist."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS email_analysis (
                        id SERIAL PRIMARY KEY,
                        from_email VARCHAR(255),
                        sender_name VARCHAR(255),
                        subject TEXT,
                        body TEXT,
                        phishing_status Text,
                        reason Text,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            conn.commit()
    except Exception as e:
        print(f"Table creation error: {e}")
        raise

def store_email_analysis(from_email, sender_name, subject, body, phishing_status, reason):
    """Store email analysis results in the database."""
    # ipdb.set_trace();
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO email_analysis (from_email, sender_name, subject, body, phishing_status, reason)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (from_email, sender_name, subject, body, phishing_status, reason))
                inserted_id = cur.fetchone()[0]
            conn.commit()
            return inserted_id
    except Exception as e:
        print(f"Storage error: {e}")
        raise

def generate_daily_report():
    """Generate the daily email analysis report."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                yesterday = datetime.now() - timedelta(days=1)
                start_date = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
                
                # Get daily statistics
                cur.execute("""
                    SELECT 
                        COUNT(*) as total_emails,
                        SUM(CASE WHEN phishing_status = 'Phishing' THEN 1 ELSE 0 END) as phishing_emails,
                        SUM(CASE WHEN phishing_status = 'Not Phishing' THEN 1 ELSE 0 END) as safe_emails
                    FROM email_analysis
                    WHERE created_at BETWEEN %s AND %s
                """, (start_date, end_date))
                
                stats = cur.fetchone()
                
                # Get phishing email details
                cur.execute("""
                    SELECT from_email, subject, created_at
                    FROM email_analysis
                    WHERE phishing_status = 'Phishing'
                    AND created_at BETWEEN %s AND %s
                    ORDER BY created_at DESC
                """, (start_date, end_date))
                
                phishing_details = cur.fetchall()
                
                return stats, phishing_details
    except Exception as e:
        print(f"Report generation error: {e}")
        raise

def send_daily_report():
    """Send the daily report via email."""
    try:
        stats, phishing_details = generate_daily_report()
        if not stats:
            print("No data available for report")
            return
            
        total_emails, phishing_count, safe_count = stats
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #2c3e50;">Daily Email Analysis Report</h2>
                <h3 style="color: #34495e;">Summary for {(datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')}</h3>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li>📧 Total emails analyzed: {total_emails}</li>
                        <li>🚨 Phishing emails detected: {phishing_count}</li>
                        <li>✅ Safe emails: {safe_count}</li>
                    </ul>
                </div>
                
                <h3 style="color: #34495e; margin-top: 20px;">Detailed Phishing Emails</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr style="background-color: #2c3e50; color: white;">
                        <th style="padding: 10px; text-align: left;">Sender</th>
                        <th style="padding: 10px; text-align: left;">Subject</th>
                        <th style="padding: 10px; text-align: left;">Time</th>
                    </tr>
        """
        
        for i, email_detail in enumerate(phishing_details):
            background_color = "#f8f9fa" if i % 2 == 0 else "white"
            html_content += f"""
                    <tr style="background-color: {background_color};">
                        <td style="padding: 8px;">{email_detail[0]}</td>
                        <td style="padding: 8px;">{email_detail[1]}</td>
                        <td style="padding: 8px;">{email_detail[2].strftime('%Y-%m-%d %H:%M:%S')}</td>
                    </tr>
            """
        
        html_content += """
                </table>
            </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📊 Daily Email Analysis Report - {(datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')}"
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECIPIENT_EMAIL
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
            
    except Exception as e:
        print(f"Email sending error: {e}")
        raise

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(send_daily_report, 'cron', hour=9, minute=0)
scheduler.start()

@app.route('/email-webhook/', methods=['POST'])
def receive_email():
    """Handle incoming email webhook requests."""
    try:
        from_email = request.form.get("from_email")
        sender_name = request.form.get("sender_name")
        subject = request.form.get("subject")
        body = request.form.get("body")

        if not all([from_email, subject, body]):
            return jsonify({
                "error": "Missing required fields"
            }), 400

        phishing_overview, reason = check_phishing(subject, body, from_email)
        
        # Store in database
        inserted_id = store_email_analysis(from_email, sender_name, subject, body, phishing_overview, str(reason))

        return jsonify({
            "message": "Email received and stored successfully",
            "id": inserted_id,
            "sender": sender_name,
            "email_type": phishing_overview,
            "subject": subject
        }), 200

    except Exception as e:
        print(f"❌ Error in webhook endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # create_tables()
    app.run(debug=True, port=8000)