from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Complaint, User
from schemas import ComplaintCreate, ComplaintOut
from routers.users import get_current_user

router = APIRouter(prefix="/complaints", tags=["complaints"])

@router.post("/", response_model=ComplaintOut)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = Complaint(
        user_id=current_user.id,
        email=current_user.email,
        subject=payload.subject,
        category=payload.category,
        message=payload.message,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint
