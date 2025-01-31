import sqlite3
import os

DB_PATH = "traffic_logs.db"

# Initialize Database
def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT,
                packet_size INTEGER,
                bytes_sent INTEGER,
                bytes_received INTEGER,
                latency INTEGER,
                threat_status TEXT,
                action TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

# Save Log Entry
def save_log(traffic, threat_status, action):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO logs (ip_address, packet_size, bytes_sent, bytes_received, latency, threat_status, action)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (traffic.ip_address, traffic.packet_size, traffic.bytes_sent, traffic.bytes_received, traffic.latency, threat_status, action))
        conn.commit()
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        conn.close()

# Ensure DB is initialized at import
init_db()
