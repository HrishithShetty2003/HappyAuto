# backend/app/main.py - CORRECTED VERSION
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router  # <--- THIS LINE WAS MISSING

app = FastAPI(title="HappyAuto Demo", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# <--- THIS LINE WAS MISSING - It maps /api/v1/auth/ routes
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "HappyAuto API is running!"}

@app.get("/api/demo-drivers")
def get_demo_drivers():
    return [
        {"id": "D001", "name": "Ramesh", "status": "available", "location": "MG Road"},
        {"id": "D002", "name": "Suresh", "status": "busy", "location": "Koramangala"},
        {"id": "D003", "name": "Mahesh", "status": "available", "location": "Indiranagar"}
    ]