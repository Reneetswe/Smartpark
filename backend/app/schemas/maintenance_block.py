from pydantic import BaseModel
from datetime import datetime

class MaintenanceBlockCreate(BaseModel):
    site_id: int
    space_id: int
    reason: str
    start_datetime: datetime
    end_datetime: datetime

class MaintenanceBlockResponse(BaseModel):
    id: int
    site_id: int
    space_id: int
    reason: str
    start_datetime: datetime
    end_datetime: datetime
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True
