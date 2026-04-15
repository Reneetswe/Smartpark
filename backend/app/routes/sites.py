from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.site import Site
from app.models.parking_space import ParkingSpace
from app.schemas.site import SiteResponse, SiteStats
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/sites", tags=["sites"])

@router.get("", response_model=List[SiteResponse])
def get_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sites = db.query(Site).all()
    return sites

@router.get("/{site_id}", response_model=SiteResponse)
def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.get("/{site_id}/stats", response_model=SiteStats)
def get_site_stats(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    total_spaces = site.total_spaces
    
    status_counts = db.query(
        ParkingSpace.status,
        func.count(ParkingSpace.id)
    ).filter(
        ParkingSpace.site_id == site_id,
        ParkingSpace.is_active == True
    ).group_by(ParkingSpace.status).all()
    
    stats = {status: count for status, count in status_counts}
    
    return SiteStats(
        site_id=site.id,
        site_name=site.name,
        total_spaces=total_spaces,
        available=stats.get("available", 0),
        occupied=stats.get("occupied", 0),
        reserved=stats.get("reserved", 0),
        blocked=stats.get("blocked", 0),
        maintenance=stats.get("maintenance", 0)
    )
