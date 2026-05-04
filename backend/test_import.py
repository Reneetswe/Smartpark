#!/usr/bin/env python3
"""
Test script to identify import errors before uvicorn starts
Run this on Render to see the actual error
"""
import sys
import traceback

print("=" * 60)
print("TESTING IMPORTS...")
print("=" * 60)

try:
    print("1. Testing database import...")
    from app.database import engine, Base
    print("   ✓ Database imported successfully")
except Exception as e:
    print(f"   ✗ Database import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("2. Testing models import...")
    from app.models import User, Site, ParkingSpace, ParkingCategory, Booking
    print("   ✓ Models imported successfully")
except Exception as e:
    print(f"   ✗ Models import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("3. Testing routes import...")
    from app.routes import (
        auth_router,
        users_router,
        sites_router,
        spaces_router,
        bookings_router,
        categories_router,
        layout_router
    )
    print("   ✓ Routes imported successfully")
except Exception as e:
    print(f"   ✗ Routes import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("4. Testing FastAPI app creation...")
    from app.main import app
    print("   ✓ FastAPI app created successfully")
except Exception as e:
    print(f"   ✗ FastAPI app creation failed: {e}")
    traceback.print_exc()
    sys.exit(1)

print("=" * 60)
print("ALL IMPORTS SUCCESSFUL!")
print("=" * 60)
