from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.transaction import Transaction
from app.services.fraud_detection import detect_fraud
from pydantic import BaseModel, Field
from typing import List

router = APIRouter()

class TransactionCreate(BaseModel):
    user_id: int = Field(..., example=1)
    amount: float = Field(..., example=100.50)

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    status: str

    class Config:
        from_attributes = True

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Creates a new transaction and checks for fraud."""
    
    # Fraud Detection
    fraud_detected = detect_fraud(transaction.user_id, transaction.amount, db)
    status = "fraudulent" if fraud_detected else "approved"

    # Save transaction
    new_transaction = Transaction(user_id=transaction.user_id, amount=transaction.amount, status=status)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction

@router.get("/", response_model=List[TransactionResponse])
async def get_all_transactions(db: Session = Depends(get_db)):
    """Retrieve all transactions."""
    transactions = db.query(Transaction).all()
    return transactions

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Retrieve a single transaction by ID."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction by ID."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}
