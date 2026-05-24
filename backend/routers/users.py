from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import httpx
from passlib.context import CryptContext
from database import get_db
from models import User
from schemas import TokenOut, UserOut, UserLogin, UserRegister
from auth import create_access_token, decode_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/users", tags=["users"])

async def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/google-auth", response_model=TokenOut)
async def google_auth(payload: dict, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload['access_token']}"}
        )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    profile = res.json()
    # First try to find by google_sub
    user = db.query(User).filter(User.google_sub == profile["sub"]).first()

    # If not found by google_sub, try to find by email
    if not user:
        user = db.query(User).filter(User.email == profile["email"]).first()
        if user:
            # Link google_sub to existing account
            user.google_sub = profile["sub"]
            user.avatar = profile.get("picture")
            db.commit()
            db.refresh(user)

    # If still not found, create new user
    if not user:
        user = User(
            google_sub=profile["sub"],
            name=profile.get("name"),
            email=profile["email"],
            avatar=profile.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/register", response_model=TokenOut)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_context.hash(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.delete("/me")
def delete_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}
