from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.parking_space import ParkingSpace
from app.utils.auth import require_role
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/layout", tags=["layout"])

class SpacePositionUpdate(BaseModel):
    id: int
    pos_x: int
    pos_y: int

class SpaceUpdate(BaseModel):
    category_id: int | None = None
    status: str | None = None

class BulkPositionUpdate(BaseModel):
    updates: List[SpacePositionUpdate]

@router.patch("/spaces/positions")
def update_space_positions(
    data: BulkPositionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Update positions of multiple parking spaces"""
    updated_count = 0
    
    for update in data.updates:
        space = db.query(ParkingSpace).filter(ParkingSpace.id == update.id).first()
        if space:
            space.pos_x = update.pos_x
            space.pos_y = update.pos_y
            updated_count += 1
    
    db.commit()
    
    log_activity(db, current_user.id, f"Updated positions of {updated_count} parking spaces", "layout", None)
    
    return {"message": f"Updated {updated_count} parking space positions"}

@router.patch("/spaces/{space_id}")
def update_space(
    space_id: int,
    data: SpaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Update a single parking space"""
    space = db.query(ParkingSpace).filter(ParkingSpace.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    
    if data.category_id is not None:
        space.category_id = data.category_id
    
    if data.status:
        space.status = data.status
    
    db.commit()
    db.refresh(space)
    
    log_activity(db, current_user.id, f"Updated parking space {space.bay_code}", "layout", space.id)
    
    return {"message": "Parking space updated successfully", "space": space}
