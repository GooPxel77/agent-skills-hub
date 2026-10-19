from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session
from app.database import Base
from app.models.skill import Skill, SkillComposition
from app.services.skill_upsert import upsert_skills
from app.services.scorer import ScoringEngine
from app.services.composability import ComposabilityEngine


@pytest.fixture
def db():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    engine.dispose()


def repo(name='owner/repo', **changes):
    return dict(repo_full_name=name, repo_name=name.split('/')[1],
                repo_url='https://github.com/'+name, author_name=name.split('/')[0],
                stars=100, description='Useful agent tooling', **changes)


def test_unchanged_sync_does_not_read_readme_or_write(db):
    payload = repo()
    assert upsert_skills(db, [payload], {payload['repo_full_name']:'x'*50000})[:3] == (1,0,0)
    # Initial prev_stars=0 is intentionally reset to the latest observation once.
    assert upsert_skills(db, [payload], {})[:3] == (0,1,0)
    statements=[]
    event.listen(db.get_bind(), 'before_cursor_execute', lambda conn,cursor,stmt,params,ctx,many: statements.append(stmt))
    assert upsert_skills(db, [payload], {})[:3] == (0,0,1)
    assert len([s for s in statements if s.lstrip().upper().startswith('SELECT')]) == 1
    assert all('readme_content' not in s for s in statements)
    assert not any(s.lstrip().upper().startswith(('UPDATE','INSERT')) for s in statements)


def test_changed_sync_preserves_readme_and_derived_scores(db):
    original=repo()
    upsert_skills(db,[original], {'owner/repo':'large README'})
    db.execute(Skill.__table__.update().values(score=88))
    db.commit()
    changed={**original,'stars':110,'description':'Updated agent tooling'}
    assert upsert_skills(db,[changed], {})[:3] == (0,1,0)
    skill=db.scalars(select(Skill)).one()
    assert (skill.stars,skill.prev_stars,skill.score,skill.readme_content)==(110,100,88,'large README')


def test_datetime_compare_handles_postgres_timezone_and_sqlite(db):
    data={**repo(),'created_at':datetime(2026,1,1,tzinfo=timezone.utc)}
    upsert_skills(db,[data],{})
    upsert_skills(db,[data],{})
    assert upsert_skills(db,[data],{})[:3] == (0,0,1)


def test_bulk_failure_is_not_reported_as_success(db):
    with pytest.raises(Exception):
        upsert_skills(db,[repo(),repo()],{})
    assert db.scalars(select(Skill)).all()==[]


def test_incremental_scoring_reads_only_target_readmes(db):
    db.add_all([Skill(**repo(f'o/repo{i}'), readme_content='# Install\nUseful agents\n'*1000) for i in range(4)])
    db.commit()
    statements=[]
    event.listen(db.get_bind(),'before_cursor_execute',lambda conn,cursor,stmt,params,ctx,many:statements.append(stmt))
    assert ScoringEngine().score_all(db,{1})==1
    readme_reads=[s for s in statements if s.lstrip().upper().startswith('SELECT') and 'skills.readme_content' in s]
    assert readme_reads and all('skills.id IN' in s for s in readme_reads)
    assert db.get(Skill,2).score==0


def test_empty_incremental_set_is_noop(db):
    assert ScoringEngine().score_all(db,set())==0
    assert ComposabilityEngine().compute_all(db,set())==0


def test_composability_reads_database_preview_and_keeps_sentinel(db):
    descriptions=['alpha framework','alpha sdk','beta framework','beta sdk','gamma framework','gamma sdk']
    db.add_all([Skill(**{**repo(f'o{i}/r{i}'),'description':desc},readme_content='x'*50000)
                for i,desc in enumerate(descriptions)])
    db.commit()
    statements=[]
    event.listen(db.get_bind(),'before_cursor_execute',lambda conn,cursor,stmt,params,ctx,many:statements.append((stmt,params)))
    engine=ComposabilityEngine()
    engine.MIN_THRESHOLD=10
    assert engine.compute_all(db,{1})==0
    previews=[(s,p) for s,p in statements if 'substr(skills.readme_content' in s]
    assert previews and previews[0][1][:2]==(1,3000)
    rows=db.scalars(select(SkillComposition)).all()
    assert len(rows)==1 and rows[0].reason=='none_found'


def test_public_api_projection_and_batch_preserve_response_shape(db):
    from app.api.routes import _public_skills, batch_skills
    from app.schemas.skill import SkillResponse
    db.add(Skill(**repo(),readme_content='x'*50000))
    db.commit()
    db.expunge_all()
    statements=[]
    event.listen(db.get_bind(),'before_cursor_execute',lambda conn,cursor,stmt,params,ctx,many:statements.append(stmt))
    rows=batch_skills('1',db)
    assert len(rows)==1
    assert 'readme_content' not in statements[-1]
    assert SkillResponse.model_validate(rows[0]).repo_name=='repo'
    with pytest.raises(Exception):
        _public_skills(db).first().readme_content
