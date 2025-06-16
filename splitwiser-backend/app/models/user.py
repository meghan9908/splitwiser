from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    id: Optional[str]
    email: EmailStr
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    created_at: Optional[str] = None
