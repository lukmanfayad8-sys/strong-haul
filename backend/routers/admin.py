from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Vehicle, Complaint, Notification
from schemas import UserOut, ComplaintOut, ComplaintCreate
from routers.users import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

# ── Guard ─────────────────────────────────────────────────────────────────────
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ── Dashboard ─────────────────────────────────────────────────────────────────
@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_owners = db.query(User).filter(User.role == "owner").count()
    active_owners = db.query(User).filter(User.role == "owner", User.is_active == True).count()
    premium = db.query(User).filter(User.plan == "Premium").count()
    enterprise = db.query(User).filter(User.plan == "Enterprise").count()
    open_complaints = db.query(Complaint).filter(Complaint.status == "open").count()
    total_vehicles = db.query(Vehicle).count()
    return {
        "total_owners": total_owners,
        "active_owners": active_owners,
        "premium_subscribers": premium,
        "enterprise_subscribers": enterprise,
        "open_complaints": open_complaints,
        "total_vehicles": total_vehicles,
    }

# ── Users ─────────────────────────────────────────────────────────────────────
@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(User).filter(User.role == "owner").all()

@router.patch("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}

@router.patch("/users/{user_id}/plan")
def update_user_plan(user_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.plan = payload.get("plan", user.plan)
    db.commit()
    return {"id": user.id, "plan": user.plan}

# ── Complaints ────────────────────────────────────────────────────────────────
@router.get("/complaints", response_model=List[ComplaintOut])
def get_complaints(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()

@router.patch("/complaints/{complaint_id}/resolve")
def resolve_complaint(complaint_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = "resolved"
    db.commit()
    return {"id": complaint.id, "status": complaint.status}

# ── Employees (sub-admins) ────────────────────────────────────────────────────
class EmployeeCreate(BaseModel):
    name: str
    email: str
    section: str

@router.get("/employees")
def get_employees(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(User).filter(User.role == "admin").all()

@router.post("/employees")
def add_employee(payload: EmployeeCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        existing.role = "admin"
        existing.admin_section = payload.section
        db.commit()
        return existing
    raise HTTPException(status_code=404, detail="User must register first before being made a sub-admin")

@router.patch("/employees/{user_id}/toggle")
def toggle_employee(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}

# ── Announcements ─────────────────────────────────────────────────────────────
class AnnouncementPayload(BaseModel):
    title: str
    message: str
    audience: str  # "owners", "employees", "public"

@router.post("/announcements")
def send_announcement(payload: AnnouncementPayload, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if payload.audience == "owners":
        users = db.query(User).filter(User.role == "owner", User.is_active == True).all()
    elif payload.audience == "employees":
        users = db.query(User).filter(User.role == "admin").all()
    else:
        users = db.query(User).filter(User.is_active == True).all()

    title = payload.title.strip()
    message_text = payload.message.strip()
    announcement_text = f"{title} — {message_text}"

    for user in users:
        notif = Notification(
            user_id=user.id,
            type="announcement",
            message=announcement_text,
        )
        db.add(notif)
    db.commit()
    return {"message": f"Announcement sent to {len(users)} users"}

# ── Subscriptions ─────────────────────────────────────────────────────────────
@router.get("/subscriptions")
def get_subscriptions(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).filter(User.plan != "Free Trial").all()
    return [{"id": u.id, "email": u.email, "plan": u.plan, "is_active": u.is_active} for u in users]