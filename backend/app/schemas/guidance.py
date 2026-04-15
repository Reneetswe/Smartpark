from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time

class NodeResponse(BaseModel):
    id: int
    node_code: str
    node_type: str
    pos_x: int
    pos_y: int

class EdgeResponse(BaseModel):
    from_node_id: int
    to_node_id: int
    distance: float

class GuidanceResponse(BaseModel):
    booking_id: int
    site_id: int
    site_name: str
    bay_code: str
    booking_date: date
    start_time: time
    end_time: time
    booked_space_pos: Optional[dict] = None
    nodes: List[NodeResponse]
    edges: List[EdgeResponse]
    route_path: List[int]
