from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import users, vehicles, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Strong Haul API", swagger_ui_parameters={"persistAuthorization": True},)

security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Strong Haul API is running"}