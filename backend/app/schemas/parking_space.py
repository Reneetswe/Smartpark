from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class ParkingSpaceResponse(BaseModel):
    id: int
    site_id: int
    bay_code: str
    category: str
    category_id: Optional[int] = None
    status: str
    is_priority_only: bool
    is_active: bool
    pos_x: Optional[int] = None
    pos_y: Optional[int] = None

    class Config:
        from_attributes = True

class ParkingSpaceUpdate(BaseModel):
    category: Optional[str] = None
    status: Optional[str] = None
    is_priority_only: Optional[bool] = None
    is_active: Optional[bool] = None

class SpaceSearch(BaseModel):
    site_id: Optional[int] = None
    booking_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    category: Optional[str] = None
