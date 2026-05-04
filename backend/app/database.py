from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
import sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set", file=sys.stderr)
    raise RuntimeError("DATABASE_URL environment variable is not set")

# Fix for SQLAlchemy 2.x: postgres:// is not supported, must use postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Add sslmode if not already present (required by most cloud databases)
if "sslmode" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = DATABASE_URL + separator + "sslmode=require"

print(f"Connecting to database: {DATABASE_URL[:30]}...", file=sys.stderr)

# Configure engine for PostgreSQL with proper connection handling
try:
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("Database engine created successfully", file=sys.stderr)
except Exception as e:
    print(f"ERROR creating database engine: {e}", file=sys.stderr)
    raise

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
