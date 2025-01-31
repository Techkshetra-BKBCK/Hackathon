from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
from detect_threat import detect_threat

app = FastAPI()

# Define the TrafficData model
class TrafficData(BaseModel):
    ip_address: str
    packet_size: int
    bytes_sent: int
    bytes_received: int
    latency: int

# Function to create the 'threat_logs' table if it doesn't exist
def create_threat_logs_table():
    conn = sqlite3.connect("database/threats.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

# Run the function to create the table at startup
@app.on_event("startup")
async def startup():
    create_threat_logs_table()  # Ensure the table exists when the app starts

# POST endpoint to detect traffic and handle threats
@app.post("/detect/")
def detect_traffic(data: TrafficData):
    result = detect_threat(data)
    return result
