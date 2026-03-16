import os
import logging
from app.database import Base, engine

# Import all models here so SQLAlchemy knows about them
from app.models import admin, skill

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

supabase_url = os.environ.get("SUPABASE_DB_URL", "").strip()
database_url = os.environ.get("DATABASE_URL", "").strip()

if supabase_url:
    os.environ["DATABASE_URL"] = supabase_url
    logger.info("Using Supabase PostgreSQL database")
elif database_url:
    logger.info("Using DATABASE_URL: %s", database_url[:30] + "...")
else:
    logger.info("Using default local SQLite database")

def init_db():
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()
