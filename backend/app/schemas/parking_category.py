from pydantic import BaseModel

class ParkingCategoryBase(BaseModel):
    name: str
    color_code: str

class ParkingCategoryCreate(ParkingCategoryBase):
    pass

class ParkingCategoryUpdate(BaseModel):
    name: str | None = None
    color_code: str | None = None

class ParkingCategoryResponse(ParkingCategoryBase):
    id: int

    class Config:
        from_attributes = True
