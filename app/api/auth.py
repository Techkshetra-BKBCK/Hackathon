from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.services.auth_service import hash_password, verify_password, create_access_token
from pydantic import BaseModel, EmailStr

router = APIRouter()

class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def sign_up(request: SignUpRequest, db: Session = Depends(get_db)):
    """Registers a new user"""
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(request.password)
    new_user = User(name=request.name, email=request.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully"}

@router.post("/signin")
async def sign_in(request: SignInRequest, db: Session = Depends(get_db)):
    """Logs in an existing user and returns a JWT token"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}
