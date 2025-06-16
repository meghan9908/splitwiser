from app.db.client import db
from app.models.user import User
from typing import Optional
from datetime import datetime

class UserRepository:
    def __init__(self):
        self.collection = db["users"]

    def get_by_email(self, email: str) -> Optional[dict]:
        return self.collection.find_one({"email": email})

    def create(self, user: dict) -> str:
        user["created_at"] = datetime.utcnow().isoformat()
        result = self.collection.insert_one(user)
        return str(result.inserted_id)

user_repo = UserRepository()
