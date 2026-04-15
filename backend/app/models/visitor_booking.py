from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class VisitorBooking(Base):
    __tablename__ = "visitor_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    receptionist_id = Column(Integer, ForeignKey("users.id"))
    host_user_id = Column(Integer, ForeignKey("users.id"))
    visitor_name = Column(String(120), nullable=False)
    contact_number = Column(String(30))
    company = Column(String(120))
    site_id = Column(Integer, ForeignKey("sites.id"))
    space_id = Column(Integer, ForeignKey("parking_spaces.id"))
    booking_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(30), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    receptionist = relationship("User", back_populates="visitor_bookings", foreign_keys=[receptionist_id])
    host_user = relationship("User", back_populates="hosted_visitors", foreign_keys=[host_user_id])
    site = relationship("Site", back_populates="visitor_bookings")
    space = relationship("ParkingSpace", back_populates="visitor_bookings")
