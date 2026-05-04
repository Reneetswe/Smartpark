"""
Add category_id column to parking_spaces table
"""
from app.database import engine
from sqlalchemy import text

def add_column():
    print("Adding category_id column to parking_spaces...")
    
    with engine.connect() as conn:
        try:
            # Add column
            conn.execute(text("ALTER TABLE parking_spaces ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES parking_categories(id)"))
            conn.commit()
            print("✓ Column added successfully")
        except Exception as e:
            print(f"Note: {e}")
            print("Column may already exist or will be created on next startup")

if __name__ == "__main__":
    add_column()
