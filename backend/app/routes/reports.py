from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.site import Site
from app.models.parking_space import ParkingSpace
from app.models.booking import Booking
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/occupancy")
def get_occupancy_report(
    site_id: int = None,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    query = db.query(
        Booking.booking_date,
        Site.name.label("site_name"),
        func.count(Booking.id).label("total_bookings")
    ).join(Site, Booking.site_id == Site.id).filter(
        Booking.booking_date >= start_date,
        Booking.booking_date <= end_date,
        Booking.status.in_(["active", "completed"])
    )
    
    if site_id:
        query = query.filter(Booking.site_id == site_id)
    
    results = query.group_by(Booking.booking_date, Site.name).all()
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "data": [
            {
                "date": str(r.booking_date),
                "site_name": r.site_name,
                "total_bookings": r.total_bookings
            } for r in results
        ]
    }

@router.get("/utilization")
def get_utilization_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    sites = db.query(Site).all()
    
    report_data = []
    for site in sites:
        total_spaces = site.total_spaces
        
        status_counts = db.query(
            ParkingSpace.status,
            func.count(ParkingSpace.id)
        ).filter(
            ParkingSpace.site_id == site.id,
            ParkingSpace.is_active == True
        ).group_by(ParkingSpace.status).all()
        
        stats = {status: count for status, count in status_counts}
        
        available = stats.get("available", 0)
        occupied = stats.get("occupied", 0)
        reserved = stats.get("reserved", 0)
        blocked = stats.get("blocked", 0)
        
        utilization_rate = ((occupied + reserved) / total_spaces * 100) if total_spaces > 0 else 0
        
        report_data.append({
            "site_id": site.id,
            "site_name": site.name,
            "total_spaces": total_spaces,
            "available": available,
            "occupied": occupied,
            "reserved": reserved,
            "blocked": blocked,
            "utilization_rate": round(utilization_rate, 2)
        })
    
    return {"sites": report_data}

@router.get("/peak-times")
def get_peak_times_report(
    site_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    query = db.query(
        func.extract('hour', Booking.start_time).label("hour"),
        func.count(Booking.id).label("booking_count")
    ).filter(
        Booking.status.in_(["active", "completed"])
    )
    
    if site_id:
        query = query.filter(Booking.site_id == site_id)
    
    results = query.group_by(func.extract('hour', Booking.start_time)).all()
    
    return {
        "peak_hours": [
            {
                "hour": int(r.hour),
                "booking_count": r.booking_count
            } for r in results
        ]
    }

@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["manager", "admin"]))
):
    alerts = []
    sites = db.query(Site).all()
    
    for site in sites:
        total_spaces = site.total_spaces
        
        available_count = db.query(ParkingSpace).filter(
            ParkingSpace.site_id == site.id,
            ParkingSpace.status == "available",
            ParkingSpace.is_active == True
        ).count()
        
        blocked_count = db.query(ParkingSpace).filter(
            ParkingSpace.site_id == site.id,
            ParkingSpace.status == "blocked",
            ParkingSpace.is_active == True
        ).count()
        
        availability_rate = (available_count / total_spaces * 100) if total_spaces > 0 else 0
        
        if availability_rate < 10:
            alerts.append({
                "type": "critical",
                "site_id": site.id,
                "site_name": site.name,
                "message": f"{site.name} is near full capacity ({availability_rate:.1f}% available)",
                "severity": "high"
            })
        elif availability_rate < 20:
            alerts.append({
                "type": "warning",
                "site_id": site.id,
                "site_name": site.name,
                "message": f"{site.name} has low availability ({availability_rate:.1f}% available)",
                "severity": "medium"
            })
        
        if blocked_count > total_spaces * 0.15:
            alerts.append({
                "type": "maintenance",
                "site_id": site.id,
                "site_name": site.name,
                "message": f"{site.name} has {blocked_count} blocked spaces",
                "severity": "medium"
            })
    
    return {"alerts": alerts}
