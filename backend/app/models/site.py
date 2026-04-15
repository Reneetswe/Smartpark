from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    total_spaces = Column(Integer, nullable=False)
    
    parking_spaces = relationship("ParkingSpace", back_populates="site", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="site")
    visitor_bookings = relationship("VisitorBooking", back_populates="site")
    maintenance_blocks = relationship("MaintenanceBlock", back_populates="site")
    guidance_nodes = relationship("GuidanceNode", back_populates="site", cascade="all, delete-orphan")
    guidance_edges = relationship("GuidanceEdge", back_populates="site", cascade="all, delete-orphan")
