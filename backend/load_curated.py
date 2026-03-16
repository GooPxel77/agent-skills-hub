"""
Load curated repos from data/curated/*.txt into extra_repos table.
Each file corresponds to a category. Lines starting with # are ignored.
Repos are upserted with status='approved' and is_active=True.

Usage:
  cd backend
  python load_curated.py
"""
import glob
import os
import sys
import logging

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
    os.environ.pop("DATABASE_URL", None)
    logger.info("Using default local SQLite database")

from app.database import SessionLocal  # noqa: E402
from app.models.admin import ExtraRepo  # noqa: E402


CURATED_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "curated")


def load_curated():
    pattern = os.path.join(CURATED_DIR, "*.txt")
    files = glob.glob(pattern)
    if not files:
        logger.info("No curated list files found in %s", CURATED_DIR)
        return

    repos: list[str] = []
    for filepath in sorted(files):
        category = os.path.splitext(os.path.basename(filepath))[0]
        logger.info("Reading curated list: %s", category)
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "/" not in line:
                    logger.warning("Skipping invalid entry (no '/'): %s", line)
                    continue
                repos.append(line)

    if not repos:
        logger.info("No repos found in curated lists")
        return

    logger.info("Found %d curated repos to upsert", len(repos))

    db = SessionLocal()
    try:
        added = 0
        for full_name in repos:
            existing = db.query(ExtraRepo).filter(ExtraRepo.full_name == full_name).first()
            if existing:
                if existing.status != "approved" or not existing.is_active:
                    existing.status = "approved"
                    existing.is_active = True
                    added += 1
            else:
                db.add(ExtraRepo(
                    full_name=full_name,
                    is_active=True,
                    status="approved",
                    submitted_by="curated-list",
                ))
                added += 1
        db.commit()
        logger.info("Upserted %d curated repos into extra_repos", added)
    except Exception as e:
        db.rollback()
        logger.exception("Failed to load curated repos: %s", e)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    load_curated()
