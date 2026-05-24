from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Vehicle
from schemas import VehicleCreate, VehicleUpdate, VehicleOut
from routers.users import get_current_user
from models import User
from typing import List
from typing import Optional
from sqlalchemy import or_

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.get("/", response_model=List[VehicleOut])
def get_all_vehicles(
    skip: int = 0,
    limit: int = 20,
    location: Optional[str] = None,
    truck_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # enforce sensible defaults and caps
    if limit is None:
        limit = 20
    limit = min(max(1, limit), 100)

    query = db.query(Vehicle).filter(Vehicle.online == True)
    if location:
        query = query.filter(Vehicle.location.ilike(f"%{location}%"))
    if truck_type:
        # prefer exact match on truck_type field
        if hasattr(Vehicle, 'truck_type'):
            query = query.filter(Vehicle.truck_type == truck_type)
        else:
            query = query.filter(Vehicle.type == truck_type)

    return query.offset(skip).limit(limit).all()

@router.get("/mine", response_model=List[VehicleOut])
def get_my_vehicles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).all()

@router.post("/", response_model=VehicleOut)
def create_vehicle(vehicle: VehicleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print("User plan:", current_user.plan)
    print("User id:", current_user.id)
    if current_user.plan == "Free Trial":
        count = db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).count()
        print("Vehicle count:", count)
        if count >= 3:
            raise HTTPException(status_code=403, detail="Free Trial plan is limited to 3 listings. Please upgrade to Premium.")
    
    # pydantic v2 compatibility: use model_dump() if available
    try:
        payload_dict = vehicle.model_dump()
    except Exception:
        payload_dict = vehicle.dict()

    db_vehicle = Vehicle(**payload_dict, owner_id=current_user.id)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, updates: VehicleUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print("Update payload received:", updates.dict(exclude_unset=True))
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.owner_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.owner_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted"}