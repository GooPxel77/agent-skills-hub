"""Estimate token consumption for skills."""
import logging

from sqlalchemy.orm import Session, load_only

from app.models.skill import Skill

logger = logging.getLogger(__name__)

# Claude 200K context window
CLAUDE_CONTEXT_WINDOW = 200_000


class TokenEstimator:
    """Estimates token count based on repo size, README size, and language."""

    CODE_TOKENS_PER_KB = 150
    README_TOKENS_PER_CHAR = 0.25
    CODE_RATIO = 0.6

    # Language-specific token density coefficients
    LANG_COEFF = {
        "Python": 0.8, "TypeScript": 1.0, "JavaScript": 1.0,
        "Go": 0.87, "Rust": 1.33, "Ruby": 0.8, "Java": 1.1,
        "Kotlin": 1.0, "C#": 1.1, "C": 0.9, "C++": 1.05,
        "Shell": 0.6, "Bash": 0.6, "PHP": 1.0, "Swift": 0.95,
    }

    # Estimated non-code file ratio by ecosystem
    BINARY_OVERHEAD = {
        "Python": 0.10, "TypeScript": 0.25, "JavaScript": 0.30,
        "Go": 0.05, "Rust": 0.10, "Ruby": 0.10, "Java": 0.20,
        "Shell": 0.05,
    }

    def estimate_all(self, db: Session, changed_ids: set[int] | None = None) -> int:
        if changed_ids is not None and not changed_ids:
            return 0
        query = db.query(Skill).options(load_only(
            Skill.id, Skill.repo_size_kb, Skill.readme_size, Skill.language, Skill.estimated_tokens,
            raiseload=True))
        if changed_ids is not None:
            query = query.filter(Skill.id.in_(changed_ids))
        skills = query.all()
        for skill in skills:
            skill.estimated_tokens = self._estimate(skill)
        db.commit()
        return len(skills)

    def _estimate(self, skill: Skill) -> int:
        repo_kb = skill.repo_size_kb or 0
        readme_chars = skill.readme_size or 0
        language = skill.language or ""

        lang_coeff = self.LANG_COEFF.get(language, 1.0)
        overhead = self.BINARY_OVERHEAD.get(language, 0.15)
        effective_ratio = self.CODE_RATIO * (1 - overhead)

        code_tokens = int(repo_kb * self.CODE_TOKENS_PER_KB * lang_coeff * effective_ratio)
        readme_tokens = int(readme_chars * self.README_TOKENS_PER_CHAR)

        # Cap to PostgreSQL INTEGER max to avoid NumericValueOutOfRange
        return min(code_tokens + readme_tokens, 2_147_483_647)
