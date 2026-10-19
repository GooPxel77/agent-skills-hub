-- Apply before deploying the catalog export/gateway. No existing client grants are revoked here.
BEGIN;
GRANT SELECT ON public.skills, public.skill_compositions, public.sync_logs,
                public.skill_masters, public.weekly_trending_snapshots TO service_role;
CREATE OR REPLACE FUNCTION public.get_landing_data()
RETURNS json LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$
  SELECT json_build_object(
    'stats', (SELECT row_to_json(s) FROM public.v_stats s LIMIT 1),
    'categories', COALESCE((SELECT json_agg(c) FROM public.v_categories c), '[]'::json),
    'trending', COALESCE((SELECT json_agg(t) FROM
      (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens FROM public.v_trending LIMIT 10) t), '[]'::json),
    'rising', COALESCE((SELECT json_agg(t) FROM
      (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens FROM public.v_rising LIMIT 10) t), '[]'::json),
    'top_rated', COALESCE((SELECT json_agg(t) FROM
      (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens FROM public.v_top_rated LIMIT 10) t), '[]'::json),
    'hall_of_fame', COALESCE((SELECT json_agg(t) FROM
      (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens FROM public.v_community_classics LIMIT 10) t), '[]'::json),
    'recently_updated', COALESCE((SELECT json_agg(t) FROM
      (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens FROM public.v_recently_updated LIMIT 10) t), '[]'::json),
    'languages', COALESCE((SELECT json_agg(l) FROM public.v_language_stats l), '[]'::json)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_workflow_categories()
RETURNS json LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $$
  SELECT COALESCE(json_agg(t ORDER BY t.id), '[]'::json)
  FROM (
    SELECT counts.category AS id, counts.skill_count,
           COALESCE((SELECT json_agg(s) FROM (
             SELECT repo_name, repo_full_name, description, stars,
                    COALESCE(NULLIF(score,0),quality_score,0) AS score, author_name
             FROM public.skills
             WHERE category = counts.category AND stars >= 20
             ORDER BY stars DESC, id DESC LIMIT 3
           ) s), '[]'::json) AS skills
    FROM (SELECT category, count(*)::integer AS skill_count
          FROM public.skills WHERE stars >= 20 GROUP BY category) counts
  ) t;
$$;
GRANT EXECUTE ON FUNCTION public.get_landing_data(), public.get_workflow_categories()
TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.v_skill_build_export AS
SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens, left(readme_content, 1500) AS readme_content
FROM public.skills WHERE stars >= 20;
REVOKE ALL ON public.v_skill_build_export FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_skill_build_export TO service_role;
CREATE OR REPLACE VIEW public.v_skill_composition_export AS
SELECT c.id, c.skill_id, c.compatible_skill_id, c.compatibility_score, c.reason
FROM public.skill_compositions c
JOIN public.skills source ON source.id = c.skill_id AND source.stars >= 20
JOIN public.skills target ON target.id = c.compatible_skill_id AND target.stars >= 20
WHERE c.skill_id <> c.compatible_skill_id;
REVOKE ALL ON public.v_skill_composition_export FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_skill_composition_export TO service_role;

-- Submission duplicate check returns one scalar, not an unrestricted table projection.
CREATE OR REPLACE FUNCTION public.lookup_skill_id(p_repo_full_name text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT id FROM public.skills
  WHERE repo_full_name = p_repo_full_name
    AND length(p_repo_full_name) <= 255
    AND p_repo_full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.lookup_skill_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_skill_id(text) TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.get_org_builders()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  WITH known AS (
    SELECT github AS name FROM public.skill_masters WHERE is_active
    UNION
    SELECT jsonb_array_elements_text(github_aliases::jsonb) FROM public.skill_masters WHERE is_active
  ), eligible AS (
    SELECT id,repo_name,repo_full_name,repo_url,description,stars,quality_score,category,
           author_name,author_avatar_url
    FROM public.skills WHERE stars >= 20 AND author_name NOT IN (SELECT name FROM known)
  ), counts AS (
    SELECT author_name, max(author_avatar_url) AS avatar_url, count(*) AS repo_count,
           sum(stars) AS total_stars
    FROM eligible GROUP BY author_name
    HAVING count(*) >= 3 AND sum(stars) >= 10000
    ORDER BY total_stars DESC LIMIT 20
  )
  SELECT COALESCE(json_agg(org ORDER BY org.total_stars DESC), '[]'::json)
  FROM (
    SELECT c.author_name AS github,c.author_name AS name,c.avatar_url,c.repo_count,c.total_stars,
      COALESCE((SELECT json_agg(repo) FROM (
        SELECT id,repo_name,repo_full_name,repo_url,description,stars,
               COALESCE(quality_score,0) AS score,category
        FROM eligible WHERE author_name=c.author_name ORDER BY stars DESC,id DESC LIMIT 5
      ) repo), '[]'::json) AS top_repos
    FROM counts c
  ) org;
$$;
GRANT EXECUTE ON FUNCTION public.get_org_builders() TO anon, authenticated, service_role;
COMMIT;
