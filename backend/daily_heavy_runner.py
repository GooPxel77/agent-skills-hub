"""
Daily Heavy Runner
Runs heavy computations (Scoring, Composability) for up to 100 new or unprocessed skills.
Should be triggered once a day by a GitHub Action.
"""
import logging
import os
import sys

# Override DATABASE_URL to use Supabase if available
supabase_url = os.environ.get("SUPABASE_DB_URL", "").strip()
if supabase_url:
    os.environ["DATABASE_URL"] = supabase_url
    
from sqlalchemy import or_

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

from app.database import SessionLocal, Base, engine
from app.models.skill import Skill, SkillComposition
from app.services.scorer import ScoringEngine
from app.services.composability import ComposabilityEngine

def run_heavy():
    logger.info("Starting Daily Heavy Computations...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        limit = int(os.environ.get("DAILY_HEAVY_LIMIT", 100))
        
        # 1. Scoring Missing ones
        skills_to_score = db.query(Skill).filter(
            or_(Skill.score == 0, Skill.quality_score == 0)
        ).order_by(Skill.first_seen_at.desc().nullslast(), Skill.id.desc()).limit(limit).all()
        
        score_ids = {s.id for s in skills_to_score}
        if score_ids:
            logger.info("Running ScoringEngine for %d skills...", len(score_ids))
            ScoringEngine().score_all(db, changed_ids=score_ids)
        else:
            logger.info("No skills require heavy scoring computation right now.")
            
        # 2. Composability Missing ones
        # Outerjoin to find skills with no child compositions
        skills_without_comp = db.query(Skill).outerjoin(
            SkillComposition, Skill.id == SkillComposition.skill_id
        ).filter(SkillComposition.id == None, Skill.stars >= 5).order_by(
            Skill.first_seen_at.desc().nullslast(), Skill.id.desc()
        ).limit(limit).all()
        
        comp_ids = {s.id for s in skills_without_comp}
        if comp_ids:
            logger.info("Running ComposabilityEngine for %d skills...", len(comp_ids))
            ComposabilityEngine().compute_all(db, changed_ids=comp_ids)
        else:
            logger.info("No skills require heavy composability computation right now.")
            
    except Exception as e:
        logger.exception("Daily heavy job failed: %s", e)
        sys.exit(1)
    finally:
        db.close()
        logger.info("Daily Heavy Computations Completed.")

if __name__ == "__main__":
    run_heavy()
