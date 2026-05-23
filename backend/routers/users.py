from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import httpx
from database import get_db
from models import User
from schemas import TokenOut, UserOut
from auth import create_access_token, decode_token

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
    # Verify Google token and get profile
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload['access_token']}"}
        )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    profile = res.json()
    user = db.query(User).filter(User.google_sub == profile["sub"]).first()
    
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

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user