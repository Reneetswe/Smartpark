from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    employee_number = Column(String(50))
    contact_number = Column(String(30))
    company = Column(String(120))
    is_active = Column(Boolean, default=True)
    is_priority = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    role = relationship("Role", back_populates="users")
    visitor_bookings = relationship("VisitorBooking", back_populates="receptionist", foreign_keys="VisitorBooking.receptionist_id")
    hosted_visitors = relationship("VisitorBooking", back_populates="host_user", foreign_keys="VisitorBooking.host_user_id")
    maintenance_blocks = relationship("MaintenanceBlock", back_populates="creator")
    activity_logs = relationship("ActivityLog", back_populates="user")
