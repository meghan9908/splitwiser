from fastapi import FastAPI
from app.api.v1 import auth_routes

app = FastAPI()

app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["auth"])
