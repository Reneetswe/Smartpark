from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.database import Base

class GuidanceNode(Base):
    __tablename__ = "guidance_nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    node_code = Column(String(50), nullable=False)
    node_type = Column(String(30), nullable=False)
    pos_x = Column(Integer, nullable=False)
    pos_y = Column(Integer, nullable=False)
    
    site = relationship("Site", back_populates="guidance_nodes")
    edges_from = relationship("GuidanceEdge", back_populates="from_node", foreign_keys="GuidanceEdge.from_node_id", cascade="all, delete-orphan")
    edges_to = relationship("GuidanceEdge", back_populates="to_node", foreign_keys="GuidanceEdge.to_node_id", cascade="all, delete-orphan")

class GuidanceEdge(Base):
    __tablename__ = "guidance_edges"
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    from_node_id = Column(Integer, ForeignKey("guidance_nodes.id", ondelete="CASCADE"), nullable=False)
    to_node_id = Column(Integer, ForeignKey("guidance_nodes.id", ondelete="CASCADE"), nullable=False)
    distance = Column(Numeric(10, 2), nullable=False)
    
    site = relationship("Site", back_populates="guidance_edges")
    from_node = relationship("GuidanceNode", foreign_keys=[from_node_id], back_populates="edges_from")
    to_node = relationship("GuidanceNode", foreign_keys=[to_node_id], back_populates="edges_to")
