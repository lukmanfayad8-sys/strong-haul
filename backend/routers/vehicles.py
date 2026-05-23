from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Vehicle
from schemas import VehicleCreate, VehicleUpdate, VehicleOut
from routers.users import get_current_user
from models import User
from typing import List

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.get("/", response_model=List[VehicleOut])
def get_all_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).filter(Vehicle.online == True).all()

@router.get("/mine", response_model=List[VehicleOut])
def get_my_vehicles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).all()

@router.post("/", response_model=VehicleOut)
def create_vehicle(vehicle: VehicleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_vehicle = Vehicle(**vehicle.dict(), owner_id=current_user.id)
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