from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import users, vehicles, admin, payments, uploads, complaints, notifications

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Strong Haul API")

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
    allow_origins=["http://localhost:5173"],
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