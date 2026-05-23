from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import users, vehicles

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Strong Haul API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(vehicles.router)

@app.get("/")
def root():
    return {"message": "Strong Haul API is running"}