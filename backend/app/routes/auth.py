from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin, Token, UserResponse
from app.utils.auth import verify_password, create_access_token, get_current_user
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_login.email).first()
    if not user or not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    
    log_activity(db, user.id, "User logged in", "user", user.id)
    
    user_response = UserResponse(
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
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        role_id=current_user.role_id,
        role_name=current_user.role.name,
        employee_number=current_user.employee_number,
        contact_number=current_user.contact_number,
        company=current_user.company,
        is_active=current_user.is_active,
        is_priority=current_user.is_priority,
        created_at=current_user.created_at
    )
