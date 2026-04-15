from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import datetime, date, time
from app.database import get_db
from app.models.user import User
from app.models.parking_space import ParkingSpace
from app.models.booking import Booking
from app.models.visitor_booking import VisitorBooking
from app.schemas.parking_space import ParkingSpaceResponse, ParkingSpaceUpdate, SpaceSearch
from app.utils.auth import get_current_user, require_role
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/spaces", tags=["spaces"])

@router.get("", response_model=List[ParkingSpaceResponse])
def get_spaces(
    site_id: int = None,
    category: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ParkingSpace).filter(ParkingSpace.is_active == True)
    
    if site_id:
        query = query.filter(ParkingSpace.site_id == site_id)
    if category:
        query = query.filter(ParkingSpace.category == category)
    if status:
        query = query.filter(ParkingSpace.status == status)
    
    spaces = query.all()
    return spaces

@router.post("/search", response_model=List[ParkingSpaceResponse])
def search_spaces(
    search: SpaceSearch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ParkingSpace).filter(
        ParkingSpace.is_active == True,
        ParkingSpace.status == "available"
    )
    
    if search.site_id:
        query = query.filter(ParkingSpace.site_id == search.site_id)
    if search.category:
        query = query.filter(ParkingSpace.category == search.category)
    
    spaces = query.all()
    
    if search.booking_date and search.start_time and search.end_time:
        available_spaces = []
        for space in spaces:
            conflicting_bookings = db.query(Booking).filter(
                Booking.space_id == space.id,
                Booking.booking_date == search.booking_date,
                Booking.status.in_(["active", "pending"]),
                or_(
                    and_(Booking.start_time <= search.start_time, Booking.end_time > search.start_time),
                    and_(Booking.start_time < search.end_time, Booking.end_time >= search.end_time),
                    and_(Booking.start_time >= search.start_time, Booking.end_time <= search.end_time)
                )
            ).first()
            
            conflicting_visitor = db.query(VisitorBooking).filter(
                VisitorBooking.space_id == space.id,
                VisitorBooking.booking_date == search.booking_date,
                VisitorBooking.status == "active",
                or_(
                    and_(VisitorBooking.start_time <= search.start_time, VisitorBooking.end_time > search.start_time),
                    and_(VisitorBooking.start_time < search.end_time, VisitorBooking.end_time >= search.end_time),
                    and_(VisitorBooking.start_time >= search.start_time, VisitorBooking.end_time <= search.end_time)
                )
            ).first()
            
            if not conflicting_bookings and not conflicting_visitor:
                available_spaces.append(space)
        
        return available_spaces
    
    return spaces

@router.put("/{space_id}", response_model=ParkingSpaceResponse)
def update_space(
    space_id: int,
    space_data: ParkingSpaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    space = db.query(ParkingSpace).filter(ParkingSpace.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    update_data = space_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(space, field, value)
    
    db.commit()
    db.refresh(space)
    
    log_activity(db, current_user.id, f"Updated space {space.bay_code}", "space", space.id)
    
    return space

@router.patch("/{space_id}/status")
def update_space_status(
    space_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    space = db.query(ParkingSpace).filter(ParkingSpace.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    space.status = status
    db.commit()
    
    log_activity(db, current_user.id, f"Changed status of space {space.bay_code} to {status}", "space", space.id)
    
    return {"message": "Space status updated successfully"}

@router.patch("/{space_id}/block")
def block_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    space = db.query(ParkingSpace).filter(ParkingSpace.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    space.status = "blocked"
    db.commit()
    
    log_activity(db, current_user.id, f"Blocked space {space.bay_code}", "space", space.id)
    
    return {"message": "Space blocked successfully"}
