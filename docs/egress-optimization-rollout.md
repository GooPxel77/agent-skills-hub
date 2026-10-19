# Egress optimization rollout

The implementation keeps Vite + GitHub Pages. Public reads default to a published snapshot, with an optional Cloudflare gateway for live cached reads. Production SQL/hosting changes have not been executed by this code change.

## Implemented behavior

- Homepage statistics, streams and workflow categories share one JSON bundle; browser cache validation no longer issues per-component sync-time RPCs.
- Pages production mode reads the directory, search, details, comparison, masters and history from static JSON. The search catalog is downloaded lazily, once per page session, and packed as a column list plus value arrays to avoid repeating field names. Details retain recommendations in individual small files. README is excluded from public JSON.
- Browser and gateway quota errors open a five-minute circuit. Public reads do not blindly retry 402/auth/validation errors. Last successful cached data remains visible during upstream outages.
- SQL migration 008 explicitly projects all five homepage lists, bounds workflow categories, limits organization top repositories to five, and provides private build export views with README excerpts of at most 1500 characters.
- One Node exporter supplies HTML, sitemap and JSON. It uses the correct project environment, rejects old-project fallbacks, exports changed rows with an inclusive database timestamp watermark, reconciles deletions/threshold changes using IDs, and guards concurrent sync revisions. Initial exports remain full lightweight exports; composition relations and small metadata/history remain full exports for consistency.
- Python sync batches lightweight metadata comparisons, skips unchanged writes and retains README/derived scores. Incremental scoring reads target README only and global numeric normalization columns. Composability reads a server-side 3000-character preview, retaining its existing no-result sentinel without displaying self-recommendations.
- Code-only deployment reuses the last validated snapshot artifact. Failed sync workflows do not trigger deployment; failed export reuses a validated previous snapshot or fails safely, keeping the existing site. Database jobs share a concurrency group. GitHub permits one running and one pending run per group; repeated triggers can replace pending runs.
- Routes are split into lazy chunks; unused icon font assets were removed. Dependency updates address all audit findings at verification time.

## Production sequence

1. Restore Supabase service according to the current account's quota/billing status. This patch cannot retroactively remove consumed egress.
2. Compare production schema/function definitions with the repository. Save original function definitions/ACLs. Apply `supabase/migrations/008_egress_optimization.sql` in Supabase SQL Editor, or the project's existing migration workflow. The new build views are service-role only; existing catalog client grants stay intact at this stage.
3. Add Actions secret `SUPABASE_SERVICE_ROLE_KEY`. Existing `VITE_SUPABASE_URL` is also used as the Node export project URL, ensuring browser/export project parity. The key is supplied only to the export step; it is never a Vite variable or part of the generated public data.
4. Run Deploy Frontend manually for the first complete export. A first export needs a working database and key; there is no previous version-1 snapshot artifact yet. Later code-only runs restore `catalog-snapshot-v1`; data workflow completions refresh it. Artifacts retain 30 days, and expired/missing artifacts trigger a fresh export.
5. Leave `CATALOG_API_BASE_URL` unset for fully static catalog reads. This mode trades immediate updates for the latest published snapshot. For large search catalogs or real-time updates, deploy the Worker following `gateway/README.md`, set that Actions variable to the Worker origin and rebuild. Multi-megabyte catalogs should prefer paginated gateway queries to improve first-search latency.
6. Verify browsing/search/quality filters, detail links, favorites, comparison, submissions and admin access. Published files contain no README or service credentials. Check successful cache HIT/STALE behavior for gateway mode and correct freshness expectations for static mode.
7. Apply `supabase/operations/lockdown_catalog.sql` only after public reads have migrated. This prevents anonymous and authenticated users bypassing the cache via tables/views/RPCs. Auth/user_favorites/write functions are preserved. Submission deduplication now uses a validated scalar `lookup_skill_id` RPC.
8. Compare Database/Shared Pooler Egress and Actions export metrics for 24–72 hours. Export `json_bytes` measures decoded JSON bytes, not billed wire bytes. Validate record counts and source project, not only endpoint request counts.

## Local verification

```sh
cd frontend
npm ci
npm run test:catalog
npm run build:app
npm audit
```

`build:app` compiles the application without touching production. Complete builds require either server export environment variables or a validated snapshot:

```sh
CATALOG_REUSE_SNAPSHOT=1 CATALOG_SNAPSHOT_PATH=/absolute/path/catalog-snapshot.json npm run build
```

The automated generator tests use temporary synthetic snapshots and network mocks, never a real Supabase project.

```sh
cd backend
python -m pip install -r requirements.txt pytest
python -m pytest tests -q

cd ../gateway
npm ci
npm test
npx wrangler deploy --dry-run
```

`quality.yml` runs application compilation, backend tests, catalog tests, gateway tests and Worker packaging on push/PR without production credentials. Targeted ESLint passes for the frontend API/cache/comparison/integration files. Full ESLint currently reports 36 errors and one warning; original HEAD with the same installed rules reports 44 errors and three warnings. These remaining historical violations are not hidden by disabling lint rules. No production egress-saving percentage can be claimed before rollout measurements.

Rollback: restore previous code/deployment and saved function definitions. Restore saved catalog ACLs before returning any browser to direct database reads. Preserve the most recent validated snapshot during outages; never replace it with an empty or failed export.

## Verified locally

- 56 backend tests, 7 gateway tests and 5 catalog/generator tests pass (68 total).
- TypeScript + Vite application build passes; offline HTML/sitemap/public JSON generation is exercised by the temporary snapshot tests.
- Worker packaging dry-run passes with the native rate-limit binding.
- PostgreSQL parser accepts migration 008, its SQL function bodies and the separate lockdown script; real production execution is still unverified. Workflow YAML parses successfully.
- Frontend and gateway dependency audits report zero vulnerabilities at verification time. Updated sharp icon generation was smoke-tested; generated tracked icons were restored to avoid unrelated artwork changes.
- Compared with the first build, CSS decreases from 206.47KB to 75.11KB and the entry JS decreases from 705.02KB to roughly 637KB, with secondary routes in separate chunks. These are local build measurements, not Supabase billing measurements.
