from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.models.transaction import Transaction
from sqlalchemy.orm import Session

client = TestClient(app)

def get_test_db():
    """Create a new database session for testing."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test creating a transaction
def test_create_transaction():
    response = client.post(
        "/transactions/",
        json={"user_id": 1, "amount": 100.50, "currency": "USD", "transaction_type": "deposit"},
    )
    assert response.status_code == 201
    assert response.json()["amount"] == 100.50

# Test fetching all transactions
def test_get_transactions():
    response = client.get("/transactions/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test fetching a transaction by ID
def test_get_transaction_by_id():
    response = client.get("/transactions/1")
    assert response.status_code in [200, 404]  # It should return either transaction details or not found
