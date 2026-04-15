"""
Migration script to update database for customer-based bookings
Removes employee role and updates booking structure
"""
from sqlalchemy import text
from app.database import SessionLocal, engine

def migrate_database():
    db = SessionLocal()
    
    try:
        print("Starting database migration...")
        
        # Step 1: Add new columns to bookings table
        print("Adding customer fields to bookings table...")
        with engine.connect() as conn:
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS customer_employee_number VARCHAR(50),
                    ADD COLUMN IF NOT EXISTS customer_company VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)
                """))
                conn.commit()
                print("✓ Customer fields added")
            except Exception as e:
                print(f"Note: {e}")
        
        # Step 2: Migrate existing booking data
        print("Migrating existing bookings...")
        with engine.connect() as conn:
            try:
                # Copy user data to customer fields for existing bookings
                conn.execute(text("""
                    UPDATE bookings b
                    SET customer_name = u.full_name,
                        customer_email = u.email,
                        customer_phone = u.contact_number,
                        customer_company = u.company
                    FROM users u
                    WHERE b.user_id = u.id AND b.customer_name IS NULL
                """))
                conn.commit()
                print("✓ Existing bookings migrated")
            except Exception as e:
                print(f"Note: {e}")
        
        # Step 3: Remove employee role
        print("Removing employee role...")
        with engine.connect() as conn:
            try:
                # Delete employee users
                conn.execute(text("DELETE FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'employee')"))
                # Delete employee role
                conn.execute(text("DELETE FROM roles WHERE name = 'employee'"))
                conn.commit()
                print("✓ Employee role removed")
            except Exception as e:
                print(f"Note: {e}")
        
        # Step 4: Drop old user_id column (optional - keep for now for safety)
        print("Migration complete!")
        print("\nNote: user_id column retained for safety. Can be dropped manually later.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database()
