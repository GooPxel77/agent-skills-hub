"""
Extra Repos Manual Sync Runner.
Skips typical GitHub keyword crawls and specifically syncs manually specified or newly approved Extra Repos.
"""
import asyncio
import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

supabase_url = os.environ.get("SUPABASE_DB_URL", "").strip()
if supabase_url:
    os.environ["DATABASE_URL"] = supabase_url
    
from app.scheduler.jobs import sync_all_skills
from app.database import Base, engine

def main():
    logger.info("Starting Extra Repos only sync runner...")
    Base.metadata.create_all(bind=engine)
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        # Force skip the heavy checks
        os.environ["SKIP_SCORING"] = "1"
        os.environ["SKIP_COMPOSABILITY"] = "1"
        
        loop.run_until_complete(sync_all_skills(incremental=True, only_extra_repos=True))
        logger.info("Extra repos sync runner completed successfully")
    except Exception as e:
        logger.exception("Extra repos sync runner failed: %s", e)
        sys.exit(1)
    finally:
        loop.close()

if __name__ == "__main__":
    main()
