from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.visitor_booking import VisitorBooking
from app.models.booking import Booking
from app.schemas.visitor_booking import VisitorBookingCreate, VisitorBookingUpdate, VisitorBookingResponse
from app.utils.auth import get_current_user, require_role
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/visitor-bookings", tags=["visitor-bookings"])

def check_visitor_space_availability(db: Session, space_id: int, booking_date, start_time, end_time, exclude_booking_id=None):
    conflicting_booking = db.query(Booking).filter(
        Booking.space_id == space_id,
        Booking.booking_date == booking_date,
        Booking.status.in_(["active", "pending"]),
        or_(
            and_(Booking.start_time <= start_time, Booking.end_time > start_time),
            and_(Booking.start_time < end_time, Booking.end_time >= end_time),
            and_(Booking.start_time >= start_time, Booking.end_time <= end_time)
        )
    ).first()
    
    query = db.query(VisitorBooking).filter(
        VisitorBooking.space_id == space_id,
        VisitorBooking.booking_date == booking_date,
        VisitorBooking.status == "active",
        or_(
            and_(VisitorBooking.start_time <= start_time, VisitorBooking.end_time > start_time),
            and_(VisitorBooking.start_time < end_time, VisitorBooking.end_time >= end_time),
            and_(VisitorBooking.start_time >= start_time, VisitorBooking.end_time <= end_time)
        )
    )
    
    if exclude_booking_id:
        query = query.filter(VisitorBooking.id != exclude_booking_id)
    
    conflicting_visitor = query.first()
    
    return not conflicting_booking and not conflicting_visitor

@router.get("", response_model=List[VisitorBookingResponse])
def get_visitor_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["receptionist", "admin", "manager"]))
):
    bookings = db.query(VisitorBooking).all()
    return [
        VisitorBookingResponse(
            id=b.id,
            receptionist_id=b.receptionist_id,
            host_user_id=b.host_user_id,
            visitor_name=b.visitor_name,
            contact_number=b.contact_number,
            company=b.company,
            site_id=b.site_id,
            space_id=b.space_id,
            booking_date=b.booking_date,
            start_time=b.start_time,
            end_time=b.end_time,
            status=b.status,
            created_at=b.created_at,
            receptionist_name=b.receptionist.full_name if b.receptionist else None,
            host_name=b.host_user.full_name if b.host_user else None,
            site_name=b.site.name if b.site else None,
            bay_code=b.space.bay_code if b.space else None
        ) for b in bookings
    ]

@router.post("", response_model=VisitorBookingResponse)
def create_visitor_booking(
    booking_data: VisitorBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["receptionist", "admin"]))
):
    if not check_visitor_space_availability(db, booking_data.space_id, booking_data.booking_date,
                                           booking_data.start_time, booking_data.end_time):
        raise HTTPException(status_code=400, detail="Space is not available for the selected time")
    
    new_booking = VisitorBooking(
        receptionist_id=current_user.id,
        host_user_id=booking_data.host_user_id,
        visitor_name=booking_data.visitor_name,
        contact_number=booking_data.contact_number,
        company=booking_data.company,
        site_id=booking_data.site_id,
        space_id=booking_data.space_id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        status="active"
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    log_activity(db, current_user.id, f"Created visitor booking for {booking_data.visitor_name}", "visitor_booking", new_booking.id)
    
    return VisitorBookingResponse(
        id=new_booking.id,
        receptionist_id=new_booking.receptionist_id,
        host_user_id=new_booking.host_user_id,
        visitor_name=new_booking.visitor_name,
        contact_number=new_booking.contact_number,
        company=new_booking.company,
        site_id=new_booking.site_id,
        space_id=new_booking.space_id,
        booking_date=new_booking.booking_date,
        start_time=new_booking.start_time,
        end_time=new_booking.end_time,
        status=new_booking.status,
        created_at=new_booking.created_at,
        receptionist_name=new_booking.receptionist.full_name if new_booking.receptionist else None,
        host_name=new_booking.host_user.full_name if new_booking.host_user else None,
        site_name=new_booking.site.name if new_booking.site else None,
        bay_code=new_booking.space.bay_code if new_booking.space else None
    )

@router.put("/{booking_id}", response_model=VisitorBookingResponse)
def update_visitor_booking(
    booking_id: int,
    booking_data: VisitorBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["receptionist", "admin"]))
):
    booking = db.query(VisitorBooking).filter(VisitorBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Visitor booking not found")
    
    update_data = booking_data.dict(exclude_unset=True)
    
    if "space_id" in update_data or "booking_date" in update_data or "start_time" in update_data or "end_time" in update_data:
        space_id = update_data.get("space_id", booking.space_id)
        booking_date = update_data.get("booking_date", booking.booking_date)
        start_time = update_data.get("start_time", booking.start_time)
        end_time = update_data.get("end_time", booking.end_time)
        
        if not check_visitor_space_availability(db, space_id, booking_date, start_time, end_time, booking_id):
            raise HTTPException(status_code=400, detail="Space is not available for the selected time")
    
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    
    log_activity(db, current_user.id, f"Updated visitor booking {booking_id}", "visitor_booking", booking.id)
    
    return VisitorBookingResponse(
        id=booking.id,
        receptionist_id=booking.receptionist_id,
        host_user_id=booking.host_user_id,
        visitor_name=booking.visitor_name,
        contact_number=booking.contact_number,
        company=booking.company,
        site_id=booking.site_id,
        space_id=booking.space_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
        created_at=booking.created_at,
        receptionist_name=booking.receptionist.full_name if booking.receptionist else None,
        host_name=booking.host_user.full_name if booking.host_user else None,
        site_name=booking.site.name if booking.site else None,
        bay_code=booking.space.bay_code if booking.space else None
    )

@router.patch("/{booking_id}/cancel")
def cancel_visitor_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["receptionist", "admin"]))
):
    booking = db.query(VisitorBooking).filter(VisitorBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Visitor booking not found")
    
    booking.status = "cancelled"
    db.commit()
    
    log_activity(db, current_user.id, f"Cancelled visitor booking {booking_id}", "visitor_booking", booking.id)
    
    return {"message": "Visitor booking cancelled successfully"}
