from pydantic import BaseModel, Field
from typing import Optional, TYPE_CHECKING
from datetime import datetime

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role_id: int
    role_name: Optional[str] = None
    employee_number: Optional[str] = None
    contact_number: Optional[str] = None
    company: Optional[str] = None
    is_active: bool
    is_priority: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserCreate(BaseModel):
    full_name: str
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str
    role_id: int
    employee_number: Optional[str] = None
    contact_number: Optional[str] = None
    company: Optional[str] = None
    is_priority: bool = False

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = Field(None, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    role_id: Optional[int] = None
    employee_number: Optional[str] = None
    contact_number: Optional[str] = None
    company: Optional[str] = None
    is_priority: Optional[bool] = None
    is_active: Optional[bool] = None
