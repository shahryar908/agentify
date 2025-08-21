"""
Database connection and session management
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Database engine
engine = None
SessionLocal = None

def get_database_url() -> str:
    """Get database URL from settings"""
    return settings.DATABASE_URL

def create_database_engine():
    """Create database engine with proper configuration"""
    global engine, SessionLocal
    
    database_url = get_database_url()
    
    # SQLite-specific configuration
    if database_url.startswith("sqlite"):
        # Ensure database directory exists
        db_path = database_url.replace("sqlite:///", "")
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG  # SQL logging in debug mode
        )
        
        # Enable foreign keys for SQLite
        @event.listens_for(Engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            if 'sqlite' in str(dbapi_connection):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()
    else:
        # PostgreSQL or other databases
        engine = create_engine(
            database_url,
            echo=settings.DEBUG
        )
    
    SessionLocal = sessionmaker(
        autocommit=False, 
        autoflush=False, 
        bind=engine
    )
    
    logger.info(f"Database engine created for: {database_url}")
    return engine

def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables"""
    from .models_db import Base
    
    if engine is None:
        create_database_engine()
    
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

def drop_tables():
    """Drop all database tables (use with caution!)"""
    from .models_db import Base
    
    if engine is None:
        create_database_engine()
    
    Base.metadata.drop_all(bind=engine)
    logger.warning("All database tables dropped")

def init_database():
    """Initialize database with tables and initial data"""
    create_database_engine()
    create_tables()
    
    # Create initial data if needed
    try:
        from .seed_data import create_initial_data
        create_initial_data()
        logger.info("Database initialized with seed data")
    except ImportError:
        logger.info("No seed data module found, skipping initial data creation")
    except Exception as e:
        logger.error(f"Error creating initial data: {e}")

# Initialize on import
create_database_engine()