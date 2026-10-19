"""Batch lightweight comparisons; never retrieve stored README during synchronization."""
from datetime import datetime, timezone
from sqlalchemy import select
from app.models.skill import Skill


def comparable(value):
    if isinstance(value, datetime):
        if value.tzinfo is not None:
            value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def upsert_skills(db, cleaned, readme_cache, batch_size=200):
    new_names = []
    updated = unchanged = 0
    # Cleaner output consists only of upstream metadata, not derived scoring fields.
    for start in range(0, len(cleaned), batch_size):
        batch = cleaned[start:start + batch_size]
        fields = sorted(set().union(*(row.keys() for row in batch)))
        if set(fields) - set(Skill.__table__.columns.keys()):
            raise ValueError("Unknown skill field")
        if 'readme_content' in fields:
            raise ValueError("README must be supplied separately")
        columns = list(dict.fromkeys(['id', 'prev_stars', *fields]))
        names = [row['repo_full_name'] for row in batch]
        existing = {
            row.repo_full_name: dict(row._mapping)
            for row in db.execute(select(*(getattr(Skill, key) for key in columns))
                                  .where(Skill.repo_full_name.in_(names)))
        }
        inserts, updates = [], []
        now = datetime.now(timezone.utc)
        batch_new, batch_unchanged = [], 0
        for row in batch:
            name = row['repo_full_name']
            previous = existing.get(name)
            readme = readme_cache.get(name)
            values = dict(row)
            if readme is not None:
                values.update(readme_content=readme, readme_size=len(readme))
            if previous is None:
                inserts.append(values)
                batch_new.append(name)
            elif readme is not None or any(comparable(previous[key]) != comparable(value)
                                          for key, value in row.items()) or previous['prev_stars'] != previous['stars']:
                updates.append({**values, 'id': previous['id'], 'prev_stars': previous['stars'],
                                'last_synced': now})
            else:
                batch_unchanged += 1
        try:
            if inserts:
                db.bulk_insert_mappings(Skill, inserts, return_defaults=False)
            if updates:
                db.bulk_update_mappings(Skill, updates)
            db.commit()
        except Exception:
            db.rollback()
            raise  # Do not report a rolled-back batch as a successful sync.
        new_names.extend(batch_new)
        updated += len(updates)
        unchanged += batch_unchanged
    return len(new_names), updated, unchanged, new_names
