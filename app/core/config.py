import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost/fin_app")
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
