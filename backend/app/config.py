import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "splitwiser"
    
    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30
      # Firebase
    firebase_project_id: str = ""
    firebase_service_account_path: str = "./firebase-service-account.json"
      # App
    debug: bool = False
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()
