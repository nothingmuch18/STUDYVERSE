"""
Authentication API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from typing import Optional

from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    decode_token,
    get_current_user
)
from app.core.config import settings

router = APIRouter()

# In-memory user storage (replace with MongoDB in production)
users_db: dict = {}


class UserRegister(BaseModel):
    """User registration request schema."""
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserProfile(BaseModel):
    """User profile response schema."""
    id: str
    email: str
    name: str
    role: str


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user."""
    # Check if user exists
    if user_data.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_id = f"user_{len(users_db) + 1}"
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "role": "student",
    }
    users_db[user_data.email] = user
    
    # Generate tokens
    token_data = {"sub": user_id, "email": user_data.email, "role": "student"}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": "student",
        }
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return tokens."""
    # Demo login - accept any credentials for testing
    user = users_db.get(credentials.email)
    
    if not user:
        # Create demo user on first login
        user_id = f"user_{len(users_db) + 1}"
        user = {
            "id": user_id,
            "email": credentials.email,
            "name": "Demo User",
            "password": get_password_hash(credentials.password),
            "role": "student",
        }
        users_db[credentials.email] = user
    else:
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
    
    # Generate tokens
    token_data = {"sub": user["id"], "email": user["email"], "role": user["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
        }
    )


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    user = None
    for u in users_db.values():
        if u["id"] == current_user["id"]:
            user = u
            break
    
    if not user:
        # Return info from token if user not in memory
        return UserProfile(
            id=current_user["id"],
            email=current_user["email"],
            name="User",
            role=current_user["role"],
        )
    
    return UserProfile(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
    )


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token."""
    payload = decode_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    token_data = {
        "sub": payload["sub"],
        "email": payload.get("email"),
        "role": payload.get("role", "student"),
    }
    new_access_token = create_access_token(token_data)
    
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (invalidate tokens on client side)."""
    return {"message": "Logged out successfully"}
