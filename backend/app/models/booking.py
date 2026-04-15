from sqlalchemy import Column, Integer, String, Date, Time, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    # Booked for customer details (no user_id since customers don't have accounts)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(100))
    customer_phone = Column(String(20))
    customer_company = Column(String(100))
    
    site_id = Column(Integer, ForeignKey("sites.id"))
    space_id = Column(Integer, ForeignKey("parking_spaces.id"))
    booking_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(30), nullable=False, default="active")
    booking_type = Column(String(30), default="standard")
    is_priority = Column(Boolean, default=False)
    
    # Track who created the booking (receptionist)
    created_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])
    site = relationship("Site", back_populates="bookings")
    space = relationship("ParkingSpace", back_populates="bookings")
