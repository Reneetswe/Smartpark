from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.models.guidance import GuidanceNode, GuidanceEdge
from app.schemas.guidance import GuidanceResponse, NodeResponse, EdgeResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/guidance", tags=["guidance"])

def find_shortest_path(nodes, edges, start_node_id, end_pos):
    from collections import defaultdict
    import heapq
    
    graph = defaultdict(list)
    for edge in edges:
        graph[edge.from_node_id].append((edge.to_node_id, float(edge.distance)))
        graph[edge.to_node_id].append((edge.from_node_id, float(edge.distance)))
    
    node_dict = {node.id: node for node in nodes}
    
    end_node = None
    min_distance = float('inf')
    for node in nodes:
        if node.node_type == "parking":
            dist = abs(node.pos_x - end_pos['x']) + abs(node.pos_y - end_pos['y'])
            if dist < min_distance:
                min_distance = dist
                end_node = node
    
    if not end_node:
        return []
    
    distances = {node.id: float('inf') for node in nodes}
    distances[start_node_id] = 0
    previous = {}
    pq = [(0, start_node_id)]
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_node == end_node.id:
            break
        
        if current_dist > distances[current_node]:
            continue
        
        for neighbor, weight in graph[current_node]:
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))
    
    path = []
    current = end_node.id
    while current in previous:
        path.append(current)
        current = previous[current]
    path.append(start_node_id)
    path.reverse()
    
    return path

@router.get("/{booking_id}", response_model=GuidanceResponse)
def get_guidance(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if current_user.role.name == "employee" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this guidance")
    
    nodes = db.query(GuidanceNode).filter(GuidanceNode.site_id == booking.site_id).all()
    edges = db.query(GuidanceEdge).filter(GuidanceEdge.site_id == booking.site_id).all()
    
    entrance_node = next((n for n in nodes if n.node_type == "entrance"), None)
    
    booked_space_pos = {
        "x": booking.space.pos_x if booking.space.pos_x else 0,
        "y": booking.space.pos_y if booking.space.pos_y else 0
    }
    
    route_path = []
    if entrance_node and nodes:
        route_path = find_shortest_path(nodes, edges, entrance_node.id, booked_space_pos)
    
    return GuidanceResponse(
        booking_id=booking.id,
        site_id=booking.site_id,
        site_name=booking.site.name,
        bay_code=booking.space.bay_code,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        booked_space_pos=booked_space_pos,
        nodes=[NodeResponse(
            id=n.id,
            node_code=n.node_code,
            node_type=n.node_type,
            pos_x=n.pos_x,
            pos_y=n.pos_y
        ) for n in nodes],
        edges=[EdgeResponse(
            from_node_id=e.from_node_id,
            to_node_id=e.to_node_id,
            distance=float(e.distance)
        ) for e in edges],
        route_path=route_path
    )
