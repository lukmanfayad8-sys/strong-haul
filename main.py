import re
import os
from urllib.parse import urlparse
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
import models
from routers import users, vehicles, admin, payments, uploads, complaints, notifications

load_dotenv()

REQUIRED_ENV_VARS = [
    "PAYSTACK_SECRET_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "FRONTEND_URL",
    "SECRET_KEY",
]

missing_vars = [name for name in REQUIRED_ENV_VARS if not os.getenv(name)]
if missing_vars:
    raise RuntimeError(
        "Missing required environment variables: " + ", ".join(missing_vars) + ". "
        "Set them before starting the server."
    )

frontend_url = os.getenv("FRONTEND_URL").strip()
parsed_url = urlparse(frontend_url)
if parsed_url.scheme not in ("http", "https") or not parsed_url.netloc:
    raise RuntimeError("FRONTEND_URL must be a valid http:// or https:// URL.")
frontend_origin = f"{parsed_url.scheme}://{parsed_url.netloc}"

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_email and admin_password:
        from sqlalchemy.orm import Session
        import bcrypt
        with Session(engine) as db:
            existing = db.query(models.User).filter(models.User.email == admin_email).first()
            if not existing:
                hashed = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                admin_user = models.User(
                    name="Admin",
                    email=admin_email,
                    password_hash=hashed,
                    role="admin",
                    is_active=True,
                )
                db.add(admin_user)
                db.commit()
                print(f"Admin user created: {admin_email}")
            else:
                print("Admin user already exists.")
    yield
app = FastAPI(title="Strong Haul API", lifespan=lifespan)

security = HTTPBearer()

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Strong Haul API",
        version="1.0.0",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
  allow_origins=[
    frontend_origin,
    "https://strong-haul.vercel.app",
    "http://localhost:5173",
 ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(uploads.router)
app.include_router(complaints.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {"message": "Strong Haul API is running"}