import os
import sys
import csv

# Add backend directory to sys.path so 'app' can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Map SUPABASE_DB_URL to DATABASE_URL if provided
supabase_url = os.environ.get("SUPABASE_DB_URL", "").strip()
if supabase_url:
    os.environ["DATABASE_URL"] = supabase_url

from app.database import SessionLocal
from app.models.skill import Skill

def main():
    db = SessionLocal()
    try:
        total_skills = db.query(Skill).count()
        if total_skills == 0:
            print("Total skills in DB: 0")
            return
            
        low_stars = db.query(Skill).filter(Skill.stars < 50).all()
        uncategorized = db.query(Skill).filter(Skill.category == 'uncategorized').all()
        low_score = db.query(Skill).filter(Skill.score < 10.0).all()
        
        low_stars_set = {s.id for s in low_stars}
        uncat_set = {s.id for s in uncategorized}
        low_score_set = {s.id for s in low_score}
        
        worst_offenders_set = low_stars_set & uncat_set & low_score_set
        any_condition_set = low_stars_set | uncat_set | low_score_set
        
        print(f"Total skills in DB: {total_skills}")
        print(f"Stars < 50:         {len(low_stars_set)}  ({len(low_stars_set)/total_skills*100:.1f}%)")
        print(f"Uncategorized:      {len(uncat_set)}  ({len(uncat_set)/total_skills*100:.1f}%)")
        print(f"Score < 10:         {len(low_score_set)}  ({len(low_score_set)/total_skills*100:.1f}%)")
        print(f"All three (worst):  {len(worst_offenders_set)}  ({len(worst_offenders_set)/total_skills*100:.1f}%)")
        
        output_dir = os.path.join(os.path.dirname(__file__), '..', 'output')
        os.makedirs(output_dir, exist_ok=True)
        csv_path = os.path.join(output_dir, 'audit_results.csv')
        
        all_fetched = low_stars + uncategorized + low_score
        unique_skills = {s.id: s for s in all_fetched}
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['repo_full_name', 'stars', 'category', 'score', 'forks', 'last_commit_at'])
            
            for sid in any_condition_set:
                s = unique_skills[sid]
                last_commit = s.last_commit_at.isoformat() if s.last_commit_at else ''
                writer.writerow([s.repo_full_name, s.stars, s.category, s.score, s.forks, last_commit])
                
        print(f"\nWrote CSV output to {csv_path}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
