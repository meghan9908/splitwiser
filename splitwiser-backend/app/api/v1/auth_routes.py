from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.schemas.user_schemas import UserCreate, UserOut
from app.schemas.token_schemas import Token
from app.services.auth_service import auth_service
from app.core.security import create_access_token, decode_access_token
from typing import Any

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.post("/register", response_model=UserOut)
def register(user: UserCreate):
    created = auth_service.register_user(user.email, user.password, user.full_name)
    if not created:
        raise HTTPException(status_code=400, detail="Email already registered")
    return UserOut(email=created["email"], full_name=created.get("full_name"))

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_me(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = payload.get("sub")
    user = auth_service.authenticate_user(email, None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(email=user["email"], full_name=user.get("full_name"))
