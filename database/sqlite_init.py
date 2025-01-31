import sqlite3

DB_PATH = "database/threats.db"

def initialize_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create table for logging threats
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
    print("✅ SQLite Database Initialized.")

if __name__ == "__main__":
    initialize_db()
