from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class MaintenanceBlock(Base):
    __tablename__ = "maintenance_blocks"
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"))
    space_id = Column(Integer, ForeignKey("parking_spaces.id"))
    reason = Column(Text, nullable=False)
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    site = relationship("Site", back_populates="maintenance_blocks")
    space = relationship("ParkingSpace", back_populates="maintenance_blocks")
    creator = relationship("User", back_populates="maintenance_blocks")
