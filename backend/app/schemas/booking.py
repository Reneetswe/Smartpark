from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class BookingCreate(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_company: Optional[str] = None
    site_id: int
    space_id: int
    booking_date: date
    start_time: time
    end_time: time
    booking_type: str = "standard"

class BookingUpdate(BaseModel):
    space_id: Optional[int] = None
    booking_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class BookingOverride(BaseModel):
    action: str  # "cancel", "reassign", "modify_time"
    reason: str
    new_space_id: Optional[int] = None
    new_start_time: Optional[time] = None
    new_end_time: Optional[time] = None

class BookingResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_company: Optional[str] = None
    site_id: int
    space_id: int
    booking_date: date
    start_time: time
    end_time: time
    status: str
    booking_type: str
    is_priority: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    booking_reference: Optional[str] = None
    site_name: Optional[str] = None
    bay_code: Optional[str] = None
    overridden: Optional[bool] = False
    override_reason: Optional[str] = None
    overridden_by: Optional[int] = None
    overridden_at: Optional[datetime] = None

    class Config:
        from_attributes = True
