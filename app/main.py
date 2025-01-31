from fastapi import FastAPI
from app.api import transactions, users
from app.db.database import engine
from app.models import transaction, user

# Create tables
transaction.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Fraud Detection API")

# Include API routes
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-driven Fraud Detection API"}
