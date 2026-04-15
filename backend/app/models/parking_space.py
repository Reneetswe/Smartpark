from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class ParkingSpace(Base):
    __tablename__ = "parking_spaces"
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    bay_code = Column(String(20), nullable=False)
    category = Column(String(30), nullable=False)
    status = Column(String(30), nullable=False, default="available")
    is_priority_only = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    pos_x = Column(Integer)
    pos_y = Column(Integer)
    
    __table_args__ = (UniqueConstraint('site_id', 'bay_code', name='_site_bay_uc'),)
    
    site = relationship("Site", back_populates="parking_spaces")
    bookings = relationship("Booking", back_populates="space")
    visitor_bookings = relationship("VisitorBooking", back_populates="space")
    maintenance_blocks = relationship("MaintenanceBlock", back_populates="space")
