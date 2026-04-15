from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class VisitorBookingCreate(BaseModel):
    host_user_id: int
    visitor_name: str
    contact_number: Optional[str] = None
    company: Optional[str] = None
    site_id: int
    space_id: int
    booking_date: date
    start_time: time
    end_time: time

class VisitorBookingUpdate(BaseModel):
    visitor_name: Optional[str] = None
    contact_number: Optional[str] = None
    company: Optional[str] = None
    space_id: Optional[int] = None
    booking_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class VisitorBookingResponse(BaseModel):
    id: int
    receptionist_id: int
    host_user_id: int
    visitor_name: str
    contact_number: Optional[str] = None
    company: Optional[str] = None
    site_id: int
    space_id: int
    booking_date: date
    start_time: time
    end_time: time
    status: str
    created_at: datetime
    receptionist_name: Optional[str] = None
    host_name: Optional[str] = None
    site_name: Optional[str] = None
    bay_code: Optional[str] = None

    class Config:
        from_attributes = True
