from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.auth.routes import router as auth_router
from app.config import settings

app = FastAPI(
    title="Splitwiser API",
    description="Backend API for Splitwiser expense tracking application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - Enhanced configuration for production
allowed_origins = []
if settings.allowed_origins:
    allowed_origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
else:
    # Fallback to allow all origins if not specified (not recommended for production)
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Cache-Control",
        "Pragma",
        "X-CSRFToken"
    ],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight responses for 1 hour
)

# Add an explicit OPTIONS handler for debugging
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests explicitly"""
    return {"message": "OK"}

# Database events
@app.on_event("startup")
async def startup_event():
    """
    Initializes the MongoDB connection when the application starts.
    """
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    """
    Closes the MongoDB connection when the application shuts down.
    """
    await close_mongo_connection()

# Health check
@app.get("/health")
async def health_check():
    """
    Returns the health status of the Splitwiser API service.
    
    This endpoint can be used for health checks and monitoring.
    """
    return {"status": "healthy", "service": "Splitwiser API"}

# Include routers
app.include_router(auth_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
