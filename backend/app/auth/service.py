from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database
from app.auth.security import get_password_hash, verify_password, create_refresh_token, generate_reset_token
from app.auth.schemas import UserResponse
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.config import settings
import os

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    if os.path.exists(settings.firebase_service_account_path):
        cred = credentials.Certificate(settings.firebase_service_account_path)
        firebase_admin.initialize_app(cred, {
            'projectId': settings.firebase_project_id,
        })
    else:
        print("Firebase service account file not found. Google auth will not work.")

class AuthService:
    def __init__(self):
        pass
    
    def get_db(self):
        return get_database()

    async def create_user_with_email(self, email: str, password: str, name: str) -> Dict[str, Any]:
        """Create a new user with email and password"""
        db = self.get_db()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user document
        user_doc = {
            "email": email,
            "hashed_password": get_password_hash(password),
            "name": name,
            "avatar": None,
            "currency": "USD",
            "created_at": datetime.utcnow(),
            "auth_provider": "email",
            "firebase_uid": None
        }
        
        try:
            result = await db.users.insert_one(user_doc)
            user_doc["_id"] = str(result.inserted_id)
            
            # Create refresh token
            refresh_token = await self._create_refresh_token_record(str(result.inserted_id))
            
            return {
                "user": user_doc,
                "refresh_token": refresh_token
            }
        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

    async def authenticate_user_with_email(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user with email and password"""
        db = self.get_db()
        
        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create new refresh token
        refresh_token = await self._create_refresh_token_record(str(user["_id"]))
        
        return {
            "user": user,
            "refresh_token": refresh_token
        }

    async def authenticate_with_google(self, id_token: str) -> Dict[str, Any]:
        """Authenticate or create user with Google OAuth"""
        try:
            # Verify the Firebase ID token
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')
            name = decoded_token.get('name', email.split('@')[0] if email else 'User')
            picture = decoded_token.get('picture')
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not provided by Google"
                )
            
            db = self.get_db()
            
            # Check if user exists
            user = await db.users.find_one({"$or": [
                {"email": email},
                {"firebase_uid": firebase_uid}
            ]})
            
            if user:
                # Update user info if needed
                update_data = {}
                if user.get("firebase_uid") != firebase_uid:
                    update_data["firebase_uid"] = firebase_uid
                if user.get("avatar") != picture and picture:
                    update_data["avatar"] = picture
                
                if update_data:
                    await db.users.update_one(
                        {"_id": user["_id"]},
                        {"$set": update_data}
                    )
                    user.update(update_data)
            else:
                # Create new user
                user_doc = {
                    "email": email,
                    "name": name,
                    "avatar": picture,
                    "currency": "USD",
                    "created_at": datetime.utcnow(),
                    "auth_provider": "google",
                    "firebase_uid": firebase_uid,
                    "hashed_password": None
                }
                
                result = await db.users.insert_one(user_doc)
                user_doc["_id"] = result.inserted_id
                user = user_doc
            
            # Create refresh token
            refresh_token = await self._create_refresh_token_record(str(user["_id"]))
            
            return {
                "user": user,
                "refresh_token": refresh_token
            }
            
        except firebase_auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google ID token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google authentication failed: {str(e)}"
            )

    async def refresh_access_token(self, refresh_token: str) -> str:
        """Refresh access token using refresh token"""
        db = self.get_db()
        
        # Find and validate refresh token
        token_record = await db.refresh_tokens.find_one({
            "token": refresh_token,
            "revoked": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Get user
        user = await db.users.find_one({"_id": token_record["user_id"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new refresh token (token rotation)
        new_refresh_token = await self._create_refresh_token_record(str(user["_id"]))
        
        # Revoke old token
        await db.refresh_tokens.update_one(
            {"_id": token_record["_id"]},
            {"$set": {"revoked": True}}
        )
        
        return new_refresh_token    
    async def verify_access_token(self, token: str) -> Dict[str, Any]:
        """Verify access token and return user"""
        from app.auth.security import verify_token
        
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        db = self.get_db()
        user = await db.users.find_one({"_id": user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user

    async def request_password_reset(self, email: str) -> bool:
        """Request password reset (currently just logs the reset token)"""
        db = self.get_db()
        
        user = await db.users.find_one({"email": email})
        if not user:
            # Don't reveal if email exists or not
            return True
        
        # Generate reset token
        reset_token = generate_reset_token()
        reset_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        
        # Store reset token
        await db.password_resets.insert_one({
            "user_id": user["_id"],
            "token": reset_token,
            "expires_at": reset_expires,
            "used": False,
            "created_at": datetime.utcnow()
        })
        
        # For development/free tier: just log the reset token
        # In production, you would send this via email
        print(f"Password reset token for {email}: {reset_token}")
        print(f"Reset link: https://yourapp.com/reset-password?token={reset_token}")
        
        return True

    async def confirm_password_reset(self, reset_token: str, new_password: str) -> bool:
        """Confirm password reset with token"""
        db = self.get_db()
        
        # Find and validate reset token
        reset_record = await db.password_resets.find_one({
            "token": reset_token,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not reset_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update user password
        new_hash = get_password_hash(new_password)
        await db.users.update_one(
            {"_id": reset_record["user_id"]},
            {"$set": {"hashed_password": new_hash}}
        )
        
        # Mark token as used
        await db.password_resets.update_one(
            {"_id": reset_record["_id"]},
            {"$set": {"used": True}}
        )
        
        # Revoke all refresh tokens for this user (force re-login)
        await db.refresh_tokens.update_many(
            {"user_id": reset_record["user_id"]},
            {"$set": {"revoked": True}}
        )
        
        return True    
    async def _create_refresh_token_record(self, user_id: str) -> str:
        """Create and store refresh token"""
        db = self.get_db()
        
        refresh_token = create_refresh_token()
        expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        
        await db.refresh_tokens.insert_one({
            "token": refresh_token,
            "user_id": ObjectId(user_id) if isinstance(user_id, str) else user_id,
            "expires_at": expires_at,
            "revoked": False,
            "created_at": datetime.utcnow()
        })
        
        return refresh_token

# Create service instance
auth_service = AuthService()
