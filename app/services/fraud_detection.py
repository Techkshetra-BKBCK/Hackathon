import numpy as np
from sqlalchemy.orm import Session
from app.models.transaction import Transaction

def detect_fraud(user_id: int, amount: float, db: Session) -> bool:
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    
    if len(transactions) < 3:  # Not enough data, assume safe
        return False

    amounts = np.array([t.amount for t in transactions])
    mean = np.mean(amounts)
    std_dev = np.std(amounts)
    
    if std_dev == 0:  # If no variation, any different amount is suspicious
        return abs(amount - mean) > 0.5 * mean

    return abs(amount - mean) > 2 * std_dev  # Flag as fraud if it's an outlier
