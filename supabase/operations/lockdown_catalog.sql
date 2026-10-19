-- Apply ONLY after the published JSON / gateway has been deployed and verified.
-- Rollback: restore the ACLs saved before running this script.
BEGIN;
REVOKE SELECT ON public.skills, public.skill_compositions, public.weekly_trending_snapshots, public.skill_masters
FROM PUBLIC, anon, authenticated;

DO $$
DECLARE obj record;
BEGIN
  FOR obj IN SELECT schemaname, viewname FROM pg_views
    WHERE schemaname='public' AND viewname IN (
      'v_curated_skills','v_trending','v_rising','v_top_rated','v_community_classics',
      'v_recently_updated','v_stats','v_categories','v_language_stats',
      'v_skill_build_export','v_skill_composition_export')
  LOOP
    EXECUTE format('REVOKE SELECT ON %I.%I FROM PUBLIC, anon, authenticated',obj.schemaname,obj.viewname);
    EXECUTE format('GRANT SELECT ON %I.%I TO service_role',obj.schemaname,obj.viewname);
  END LOOP;
  FOR obj IN SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
    WHERE n.nspname='public' AND p.proname IN (
      'get_landing_data','get_workflow_categories','get_masters','get_org_builders',
      'get_last_sync_at','get_trending_weeks','get_trending_history')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated',obj.oid::regprocedure);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',obj.oid::regprocedure);
  END LOOP;
END $$;
GRANT SELECT ON public.skills, public.skill_compositions, public.weekly_trending_snapshots, public.skill_masters TO service_role;
-- lookup_skill_id, Auth, user_favorites and community/admin write endpoints stay available.
COMMIT;
