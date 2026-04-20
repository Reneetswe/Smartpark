from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.models.parking_space import ParkingSpace
from app.models.visitor_booking import VisitorBooking
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse
from app.utils.auth import get_current_user, require_role
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

def build_booking_reference(booking: Booking) -> str:
    return f"BK-{booking.booking_date.strftime('%Y%m%d')}-{booking.id:05d}"

def serialize_booking(booking: Booking) -> BookingResponse:
    return BookingResponse(
        id=booking.id,
        customer_name=booking.customer_name,
        customer_email=booking.customer_email,
        customer_phone=booking.customer_phone,
        customer_company=booking.customer_company,
        site_id=booking.site_id,
        space_id=booking.space_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
        booking_type=booking.booking_type,
        is_priority=booking.is_priority,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        created_by=booking.created_by,
        booking_reference=build_booking_reference(booking),
        site_name=booking.site.name if booking.site else None,
        bay_code=booking.space.bay_code if booking.space else None
    )

def check_space_availability(db: Session, space_id: int, booking_date, start_time, end_time, exclude_booking_id=None):
    query = db.query(Booking).filter(
        Booking.space_id == space_id,
        Booking.booking_date == booking_date,
        Booking.status.in_(["active", "pending"]),
        or_(
            and_(Booking.start_time <= start_time, Booking.end_time > start_time),
            and_(Booking.start_time < end_time, Booking.end_time >= end_time),
            and_(Booking.start_time >= start_time, Booking.end_time <= end_time)
        )
    )
    
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    
    conflicting_booking = query.first()
    
    conflicting_visitor = db.query(VisitorBooking).filter(
        VisitorBooking.space_id == space_id,
        VisitorBooking.booking_date == booking_date,
        VisitorBooking.status == "active",
        or_(
            and_(VisitorBooking.start_time <= start_time, VisitorBooking.end_time > start_time),
            and_(VisitorBooking.start_time < end_time, VisitorBooking.end_time >= end_time),
            and_(VisitorBooking.start_time >= start_time, VisitorBooking.end_time <= end_time)
        )
    ).first()
    
    return not conflicting_booking and not conflicting_visitor

@router.get("", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager", "receptionist"]))
):
    bookings = db.query(Booking).order_by(Booking.created_at.desc(), Booking.id.desc()).all()
    return [serialize_booking(b) for b in bookings]

@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(Booking.created_by == current_user.id).order_by(Booking.created_at.desc(), Booking.id.desc()).all()
    return [serialize_booking(b) for b in bookings]

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager", "receptionist"]))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return serialize_booking(booking)

@router.post("", response_model=BookingResponse)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["receptionist", "admin"]))
):
    if booking_data.end_time <= booking_data.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    
    space = db.query(ParkingSpace).filter(ParkingSpace.id == booking_data.space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    if space.site_id != booking_data.site_id:
        raise HTTPException(status_code=400, detail="Selected space does not belong to the selected site")
    
    if not check_space_availability(db, booking_data.space_id, booking_data.booking_date, 
                                    booking_data.start_time, booking_data.end_time):
        raise HTTPException(status_code=400, detail="Space is not available for the selected time")
    
    new_booking = Booking(
        customer_name=booking_data.customer_name,
        customer_email=booking_data.customer_email,
        customer_phone=booking_data.customer_phone,
        customer_company=booking_data.customer_company,
        site_id=booking_data.site_id,
        space_id=booking_data.space_id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        booking_type=booking_data.booking_type,
        is_priority=False,
        created_by=current_user.id,
        status="active"
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    log_activity(db, current_user.id, f"Created booking for {booking_data.customer_name} at {space.bay_code}", "booking", new_booking.id)

    return serialize_booking(new_booking)

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "receptionist"]))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = booking_data.dict(exclude_unset=True)
    
    if "space_id" in update_data or "booking_date" in update_data or "start_time" in update_data or "end_time" in update_data:
        space_id = update_data.get("space_id", booking.space_id)
        booking_date = update_data.get("booking_date", booking.booking_date)
        start_time = update_data.get("start_time", booking.start_time)
        end_time = update_data.get("end_time", booking.end_time)
        
        if not check_space_availability(db, space_id, booking_date, start_time, end_time, booking_id):
            raise HTTPException(status_code=400, detail="Space is not available for the selected time")
    
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    
    log_activity(db, current_user.id, f"Updated booking {booking_id}", "booking", booking.id)

    return serialize_booking(booking)

@router.patch("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager", "receptionist"]))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "cancelled"
    db.commit()
    
    log_activity(db, current_user.id, f"Cancelled booking {booking_id}", "booking", booking.id)
    
    return {"message": "Booking cancelled successfully"}

@router.patch("/{booking_id}/approve")
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "active"
    booking.approved_by = current_user.id
    db.commit()
    
    log_activity(db, current_user.id, f"Approved booking {booking_id}", "booking", booking.id)
    
    return {"message": "Booking approved successfully"}

@router.patch("/{booking_id}/reject")
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "rejected"
    db.commit()
    
    log_activity(db, current_user.id, f"Rejected booking {booking_id}", "booking", booking.id)
    
    return {"message": "Booking rejected successfully"}

@router.patch("/{booking_id}/override")
def override_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "cancelled"
    db.commit()
    
    log_activity(db, current_user.id, f"Overrode booking {booking_id}", "booking", booking.id)
    
    return {"message": "Booking overridden successfully"}
