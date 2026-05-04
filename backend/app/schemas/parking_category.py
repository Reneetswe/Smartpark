from pydantic import BaseModel
from typing import Optional

class ParkingCategoryBase(BaseModel):
    name: str
    color_code: str

class ParkingCategoryCreate(ParkingCategoryBase):
    pass

class ParkingCategoryUpdate(BaseModel):
    name: Optional[str] = None
    color_code: Optional[str] = None

class ParkingCategoryResponse(ParkingCategoryBase):
    id: int

    class Config:
        from_attributes = True
