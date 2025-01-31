import sqlite3


def create_table():
    conn = sqlite3.connect('Signup.db')
    c = conn.cursor()
    with conn:
        c.execute('''CREATE TABLE Signup
                 (Username text, password text)''')
    conn.close()

def connect():
    conn = sqlite3.connect('Signup.db')
    c = conn.cursor()
    return conn, c
def disconnect(conn):
    conn.close()


def User_signup(name,password,conn,c):
    with conn:
        c.execute(f"INSERT INTO Signup VALUES ({name}, {password})")
def User_login(name,password,conn,c):
    with conn:
        c.execute(f"SELECT * FROM Signup WHERE Username={name} AND password={password}")
        data=c.fetchall()
        name=input("Enter your name:")
        password=input("Enter your password:")
        if name==data[0] and password==data[1]:
            return True
        else:
            return
        
def main():
    create_table()
    
