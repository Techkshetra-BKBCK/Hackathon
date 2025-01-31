import numpy as np
import pickle
import os
import subprocess
import sqlite3
import logging
from sklearn.ensemble import IsolationForest
from twilio.rest import Client

MODEL_PATH = "model.pkl"
LOG_FILE = "logs/threats.log"
DB_PATH = "database/threats.db"

# Configure logging
logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format="%(asctime)s - %(message)s")

# Twilio setup (for sending alerts)
account_sid = 'your_account_sid'
auth_token = 'your_auth_token'
twilio_number = 'your_twilio_number'

# Function to send an SMS alert
def send_sms_alert(ip_address):
    try:
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Send the SMS
        message = client.messages.create(
            body=f"Alert: Threat detected from IP {ip_address} and blocked.",
            from_=twilio_number,  # Your Twilio number
            to='+919820101412'    # The recipient's phone number
        )

        print(f"SMS alert sent: {message.sid}")
    except Exception as e:
        print(f"Error sending SMS: {e}")

# Train the model if it does not exist
def train_model():
    data = np.array([
        [500, 1000, 1200, 50],  
        [5000, 15000, 16000, 400],  
        [200, 1000, 1100, 60],
        [300, 1000, 1200, 50]
    ])
    model = IsolationForest(contamination=0.25)
    model.fit(data)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

# Detect threats and block malicious IPs
def detect_threat(traffic_data):
    if not os.path.exists(MODEL_PATH):
        train_model()

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    # Access traffic data attributes
    packet_size = traffic_data.packet_size
    bytes_sent = traffic_data.bytes_sent
    bytes_received = traffic_data.bytes_received
    latency = traffic_data.latency
    ip_address = traffic_data.ip_address

    input_data = np.array([[packet_size, bytes_sent, bytes_received, latency]])
    prediction = model.predict(input_data)

    if prediction[0] == -1:
        block_ip(ip_address)
        log_threat(ip_address)
        send_sms_alert(ip_address)  # Send alert when threat is detected
        return {"status": "Threat Detected", "action": "Blocked IP", "ip": ip_address}
    
    return {"status": "Normal Traffic", "action": "No Action"}

# Block IP using firewall
def block_ip(ip_address):
    try:
        # Using UFW firewall (Linux command)
        subprocess.run(["sudo", "ufw", "deny", "from", ip_address], check=True)
        print(f"✅ IP {ip_address} blocked.")
    except Exception as e:
        print(f"❌ Failed to block {ip_address}: {e}")

# Log threats in SQLite
def log_threat(ip):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO threat_logs (ip, action) VALUES (?, ?)", (ip, "Blocked"))
    conn.commit()
    conn.close()
    logging.info(f"Blocked IP: {ip}")

# Test with mock traffic data
class TrafficData:
    def __init__(self, ip_address, packet_size, bytes_sent, bytes_received, latency):
        self.ip_address = ip_address
        self.packet_size = packet_size
        self.bytes_sent = bytes_sent
        self.bytes_received = bytes_received
        self.latency = latency

# Example usage
traffic_data = TrafficData("192.168.1.100", 5000, 15000, 16000, 400)
detect_threat(traffic_data)  # Call this function with real traffic data in a loop or as required
