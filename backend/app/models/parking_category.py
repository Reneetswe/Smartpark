from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class ParkingCategory(Base):
    __tablename__ = "parking_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    color_code = Column(String(7), nullable=False)
    
    parking_spaces = relationship("ParkingSpace", back_populates="category_rel")
