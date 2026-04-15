from pydantic import BaseModel
from typing import Optional

class SiteResponse(BaseModel):
    id: int
    name: str
    total_spaces: int

    class Config:
        from_attributes = True

class SiteStats(BaseModel):
    site_id: int
    site_name: str
    total_spaces: int
    available: int
    occupied: int
    reserved: int
    blocked: int
    maintenance: int
