from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.parking_category import ParkingCategory
from app.schemas.parking_category import ParkingCategoryResponse, ParkingCategoryCreate, ParkingCategoryUpdate
from app.utils.auth import get_current_user, require_role
from app.utils.logger import log_activity

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("", response_model=List[ParkingCategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all parking categories"""
    categories = db.query(ParkingCategory).all()
    return categories

@router.post("", response_model=ParkingCategoryResponse)
def create_category(
    category_data: ParkingCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Create a new parking category"""
    # Check if category name already exists
    existing = db.query(ParkingCategory).filter(ParkingCategory.name == category_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    new_category = ParkingCategory(
        name=category_data.name,
        color_code=category_data.color_code
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    log_activity(db, current_user.id, f"Created parking category: {category_data.name}", "category", new_category.id)
    
    return new_category

@router.put("/{category_id}", response_model=ParkingCategoryResponse)
def update_category(
    category_id: int,
    category_data: ParkingCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Update a parking category"""
    category = db.query(ParkingCategory).filter(ParkingCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check name uniqueness if changing name
    if category_data.name and category_data.name != category.name:
        existing = db.query(ParkingCategory).filter(ParkingCategory.name == category_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category name already exists")
        category.name = category_data.name
    
    if category_data.color_code:
        category.color_code = category_data.color_code
    
    db.commit()
    db.refresh(category)
    
    log_activity(db, current_user.id, f"Updated parking category: {category.name}", "category", category.id)
    
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete a parking category (admin only)"""
    category = db.query(ParkingCategory).filter(ParkingCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category is in use
    from app.models.parking_space import ParkingSpace
    spaces_using = db.query(ParkingSpace).filter(ParkingSpace.category_id == category_id).count()
    if spaces_using > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete category: {spaces_using} parking spaces are using it")
    
    db.delete(category)
    db.commit()
    
    log_activity(db, current_user.id, f"Deleted parking category: {category.name}", "category", category_id)
    
    return {"message": "Category deleted successfully"}
