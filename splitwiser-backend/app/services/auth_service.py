from app.db.user_repo import user_repo
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from typing import Optional

class AuthService:
    def register_user(self, email: str, password: str, full_name: Optional[str] = None):
        if user_repo.get_by_email(email):
            return None
        hashed_password = get_password_hash(password)
        user = {
            "email": email,
            "full_name": full_name,
            "hashed_password": hashed_password,
            "is_active": True
        }
        user_repo.create(user)
        return user

    def authenticate_user(self, email: str, password: str):
        user = user_repo.get_by_email(email)
        if not user or not verify_password(password, user["hashed_password"]):
            return None
        return user

auth_service = AuthService()
