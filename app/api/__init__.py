from fastapi import APIRouter
from app.api.transactions import router as transaction_router
from app.api.users import router as user_router

# Create the main API router
api_router = APIRouter()

# Include user-related routes
api_router.include_router(user_router, prefix="/users", tags=["Users"])

# Include transaction-related routes
api_router.include_router(transaction_router, prefix="/transactions", tags=["Transactions"])

# Export the API router
__all__ = ["api_router"]
