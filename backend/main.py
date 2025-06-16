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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
