from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import (
    auth_router,
    users_router,
    sites_router,
    spaces_router,
    bookings_router,
    visitor_bookings_router,
    reports_router,
    logs_router,
    guidance_router
)
import os
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartPark API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(sites_router)
app.include_router(spaces_router)
app.include_router(bookings_router)
app.include_router(visitor_bookings_router)
app.include_router(reports_router)
app.include_router(logs_router)
app.include_router(guidance_router)

@app.get("/")
def root():
    return {"message": "SmartPark API - Intelligent Multi-Site Car Park Management System"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
