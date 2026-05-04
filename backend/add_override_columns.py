"""
Add override tracking columns to bookings table
"""
from app.database import engine
from sqlalchemy import text

def add_columns():
    print("Adding override columns to bookings table...")
    
    with engine.connect() as conn:
        try:
            # Add columns
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS overridden BOOLEAN DEFAULT FALSE"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS override_reason VARCHAR(500)"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS overridden_by INTEGER REFERENCES users(id)"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS overridden_at TIMESTAMP WITH TIME ZONE"))
            conn.commit()
            print("✓ Override columns added successfully")
        except Exception as e:
            print(f"Note: {e}")
            print("Columns may already exist")

if __name__ == "__main__":
    add_columns()
