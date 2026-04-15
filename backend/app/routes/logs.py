from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogResponse
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/api/logs", tags=["logs"])

@router.get("", response_model=List[ActivityLogResponse])
def get_activity_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return [
        ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            details=log.details,
            created_at=log.created_at,
            user_name=log.user.full_name if log.user else None
        ) for log in logs
    ]

@router.get("/user/{user_id}", response_model=List[ActivityLogResponse])
def get_user_activity_logs(
    user_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id
    ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    
    return [
        ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            details=log.details,
            created_at=log.created_at,
            user_name=log.user.full_name if log.user else None
        ) for log in logs
    ]
