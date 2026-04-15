from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.utils.auth import get_password_hash, get_current_user, require_role
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            full_name=u.full_name,
            email=u.email,
            role_id=u.role_id,
            role_name=u.role.name,
            employee_number=u.employee_number,
            contact_number=u.contact_number,
            company=u.company,
            is_active=u.is_active,
            is_priority=u.is_priority,
            created_at=u.created_at
        ) for u in users
    ]

@router.post("", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role_id=user_data.role_id,
        employee_number=user_data.employee_number,
        contact_number=user_data.contact_number,
        company=user_data.company,
        is_priority=user_data.is_priority
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_activity(db, current_user.id, f"Created user {new_user.email}", "user", new_user.id)
    
    return UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        role_id=new_user.role_id,
        role_name=new_user.role.name,
        employee_number=new_user.employee_number,
        contact_number=new_user.contact_number,
        company=new_user.company,
        is_active=new_user.is_active,
        is_priority=new_user.is_priority,
        created_at=new_user.created_at
    )

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    log_activity(db, current_user.id, f"Updated user {user.email}", "user", user.id)
    
    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role_id=user.role_id,
        role_name=user.role.name,
        employee_number=user.employee_number,
        contact_number=user.contact_number,
        company=user.company,
        is_active=user.is_active,
        is_priority=user.is_priority,
        created_at=user.created_at
    )

@router.patch("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    log_activity(db, current_user.id, f"Deactivated user {user.email}", "user", user.id)
    
    return {"message": "User deactivated successfully"}

@router.patch("/{user_id}/role")
def update_user_role(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role_id = role_id
    db.commit()
    
    log_activity(db, current_user.id, f"Changed role for user {user.email}", "user", user.id)
    
    return {"message": "User role updated successfully"}
