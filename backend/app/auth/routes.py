from fastapi import APIRouter, HTTPException, status, Depends
from app.auth.schemas import (
    EmailSignupRequest, EmailLoginRequest, GoogleLoginRequest,
    RefreshTokenRequest, PasswordResetRequest, PasswordResetConfirm,
    TokenVerifyRequest, AuthResponse, TokenResponse, SuccessResponse,
    UserResponse, ErrorResponse
)
from app.auth.service import auth_service
from app.auth.security import create_access_token
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup/email", response_model=AuthResponse)
async def signup_with_email(request: EmailSignupRequest):
    """Register a new user with email and password"""
    try:
        result = await auth_service.create_user_with_email(
            email=request.email,
            password=request.password,
            name=request.name
        )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(result["user"]["_id"])},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        
        # Convert ObjectId to string for response
        result["user"]["_id"] = str(result["user"]["_id"])
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=result["refresh_token"],
            user=UserResponse(**result["user"])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login/email", response_model=AuthResponse)
async def login_with_email(request: EmailLoginRequest):
    """Login with email and password"""
    try:
        result = await auth_service.authenticate_user_with_email(
            email=request.email,
            password=request.password
        )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(result["user"]["_id"])},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        
        # Convert ObjectId to string for response
        result["user"]["_id"] = str(result["user"]["_id"])
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=result["refresh_token"],
            user=UserResponse(**result["user"])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/login/google", response_model=AuthResponse)
async def login_with_google(request: GoogleLoginRequest):
    """Login or signup via Google OAuth token"""
    try:
        result = await auth_service.authenticate_with_google(request.id_token)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(result["user"]["_id"])},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        
        # Convert ObjectId to string for response
        result["user"]["_id"] = str(result["user"]["_id"])
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=result["refresh_token"],
            user=UserResponse(**result["user"])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh JWT when access token expires"""
    try:
        new_refresh_token = await auth_service.refresh_access_token(request.refresh_token)
        
        # Get user from the new refresh token to create access token
        from app.database import get_database
        db = get_database()
        token_record = await db.refresh_tokens.find_one({
            "token": new_refresh_token,
            "revoked": False
        })
        
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to create new tokens"
            )
        
        # Create new access token
        access_token = create_access_token(
            data={"sub": token_record["user_id"]},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.post("/token/verify", response_model=UserResponse)
async def verify_token(request: TokenVerifyRequest):
    """Verify access token and auto-login"""
    try:
        user = await auth_service.verify_access_token(request.access_token)
        
        # Convert ObjectId to string for response
        user["_id"] = str(user["_id"])
        
        return UserResponse(**user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

@router.post("/password/reset/request", response_model=SuccessResponse)
async def request_password_reset(request: PasswordResetRequest):
    """Send password-reset email link"""
    try:
        await auth_service.request_password_reset(request.email)
        return SuccessResponse(
            success=True,
            message="If the email exists, a reset link has been sent"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )

@router.post("/password/reset/confirm", response_model=SuccessResponse)
async def confirm_password_reset(request: PasswordResetConfirm):
    """Set new password via reset token"""
    try:
        await auth_service.confirm_password_reset(
            reset_token=request.reset_token,
            new_password=request.new_password
        )
        return SuccessResponse(
            success=True,
            message="Password has been reset successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )
