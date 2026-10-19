import { readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';

export const SKILL_FIELDS = ["id", "repo_full_name", "repo_name", "repo_url", "description", "homepage_url", "author_name", "author_avatar_url", "author_followers", "stars", "forks", "open_issues", "total_issues", "total_commits", "language", "category", "topics", "license", "score", "star_momentum", "project_type", "last_commit_at", "created_at", "last_synced", "first_seen", "quality_completeness", "quality_clarity", "quality_specificity", "quality_examples", "quality_agent_readiness", "quality_score", "size_category", "repo_size_kb", "readme_size", "readme_structure_score", "platforms", "estimated_tokens"];
export const snapshotPath = process.env.CATALOG_SNAPSHOT_PATH || '.cache/catalog-snapshot.json';

export function readSnapshot() {
  const data = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  if (data.version !== 1 || !Array.isArray(data.skills) || !data.skills.length || !Array.isArray(data.compositions)) {
    throw new Error('Missing or invalid catalog snapshot');
  }
  for (const skill of data.skills) {
    if (!Number.isSafeInteger(skill.id) || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(skill.repo_full_name)
        || skill.repo_full_name.split('/').some(part => part === '.' || part === '..')
        || !/^[a-zA-Z0-9_-]+$/.test(skill.category)
        || skill.stars < 20 || (skill.readme_content?.length ?? 0) > 1500) {
      throw new Error('Invalid exported skill');
    }
  }
  return data;
}

export function writeSnapshot(data) {
  mkdirSync(dirname(snapshotPath), { recursive: true });
  const temp = `${snapshotPath}.tmp`;
  writeFileSync(temp, JSON.stringify(data));
  renameSync(temp, snapshotPath); // Publish only a complete successful export.
}

export function buildLanding(skills, generatedAt) {
  const now = new Date(generatedAt).getTime();
  const week = now - 7 * 86400000;
  const publicRows = skills.map(skill => Object.fromEntries(SKILL_FIELDS.map(key => [key, skill[key] ?? null])));
  const by = (rows, score) => [...rows].sort((a, b) => score(b) - score(a) || b.id - a.id).slice(0, 10);
  const counts = new Map(), languages = new Map();
  for (const s of publicRows) {
    counts.set(s.category, (counts.get(s.category) || 0) + 1);
    if (s.language) languages.set(s.language, (languages.get(s.language) || 0) + 1);
  }
  const categories = [...counts].map(([name, count]) => ({ name, count })).sort((a,b) => b.count-a.count);
  return {
    stats: { total_skills: skills.length,
      avg_score: Math.round(publicRows.reduce((n,s) => n + (s.score || 0), 0) / Math.max(1, skills.length) * 10) / 10,
      categories, last_sync_at: publicRows.reduce((last,s) => Date.parse(s.last_synced || "") > (last ? Date.parse(last) : 0) ? s.last_synced : last, null),
      last_sync_status: 'completed' },
    trending: by(publicRows.filter(s => s.stars >= 50 && s.created_at && Date.parse(s.created_at) >= week),
      s => s.stars / Math.max(1, (now - Date.parse(s.created_at)) / 86400000)),
    rising: by(publicRows.filter(s => s.created_at && Date.parse(s.created_at) >= week), s => s.stars),
    top_rated: by(publicRows, s => s.score || 0),
    hall_of_fame: by(publicRows.filter(s => s.stars >= 100 && s.created_at && Date.parse(s.created_at) <= now - 180*86400000), s => s.stars),
    recently_updated: by(publicRows.filter(s => s.last_commit_at), s => Date.parse(s.last_commit_at)),
    new_this_week: by(publicRows.filter(s => s.first_seen && Date.parse(s.first_seen) >= week), s => s.stars),
    languages: [...languages].map(([language, count]) => ({ language, count })).sort((a,b) => b.count-a.count).slice(0,15),
    workflows: categories.map(c => ({ id: c.name, skill_count: c.count,
      skills: by(publicRows.filter(s => s.category === c.name), s => s.stars).slice(0,3).map(s => ({
        repo_name:s.repo_name,repo_full_name:s.repo_full_name,description:s.description,stars:s.stars,
        score:s.score || s.quality_score || 0,author_name:s.author_name
      })) })),
    generated_at: generatedAt
  };
}

export function enrichMasters(result, skills) {
  return [...(result?.masters ?? []), ...(result?.emerging ?? [])].map(m => {
    const authors = new Set([m.github, ...(m.github_aliases || [])].map(name => name.toLowerCase()));
    return { github:m.github, name:m.name, x_handle:m.x_handle, bio:m.bio,
      tags:Array.isArray(m.tags) ? m.tags : [], avatar_url:`https://avatars.githubusercontent.com/${m.github}`,
      repo_count:m.skill_count, total_stars:m.total_stars, x_followers:m.x_followers,
      x_posts_count:m.x_posts_count, x_verified_at:null, x_notes:m.x_notes,
      discovered:!m.is_verified,
      top_repos:skills.filter(s => authors.has(s.author_name.toLowerCase())).sort((a,b)=>b.stars-a.stars).slice(0,5).map(s => ({
        id:s.id,repo_name:s.repo_name,repo_full_name:s.repo_full_name,repo_url:s.repo_url,
        description:s.description,stars:s.stars,score:s.score,category:s.category
      }))
    };
  });
}
