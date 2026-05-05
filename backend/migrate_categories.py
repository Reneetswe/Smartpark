"""
Migration script to:
1. Create parking_categories table
2. Seed default categories
3. Link existing parking spaces to categories
"""
from app.database import SessionLocal, engine, Base
from app.models.parking_category import ParkingCategory
from app.models.parking_space import ParkingSpace

def migrate():
    print("Starting category migration...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created/verified")
    
    db = SessionLocal()
    
    try:
        # Check if categories already exist
        existing = db.query(ParkingCategory).count()
        if existing > 0:
            print(f"✓ Categories already exist ({existing} found)")
        else:
            # Seed default categories
            categories = [
                ParkingCategory(name="Standard", color_code="#3B82F6"),
                ParkingCategory(name="Disabled", color_code="#EF4444"),
                ParkingCategory(name="EV Charging", color_code="#10B981"),
                ParkingCategory(name="Visitor", color_code="#F59E0B"),
            ]
            
            db.add_all(categories)
            db.commit()
            print(f"✓ Seeded {len(categories)} categories")
        
        # Map old category strings to new category IDs
        category_map = {
            "standard": "Standard",
            "disabled": "Disabled",
            "ev": "EV Charging",
            "visitor": "Visitor",
        }
        
        # Get all categories
        all_categories = {cat.name: cat.id for cat in db.query(ParkingCategory).all()}
        
        # Update existing parking spaces
        spaces = db.query(ParkingSpace).filter(ParkingSpace.category_id == None).all()
        updated_count = 0
        
        for space in spaces:
            old_category = space.category.lower()
            new_category_name = category_map.get(old_category, "Standard")
            category_id = all_categories.get(new_category_name)
            
            if category_id:
                space.category_id = category_id
                updated_count += 1
        
        db.commit()
        print(f"✓ Linked {updated_count} parking spaces to categories")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
