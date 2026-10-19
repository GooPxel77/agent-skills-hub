# Public catalog gateway

This optional Cloudflare Worker preserves the frontend `/api` read endpoints. GitHub Pages defaults to static JSON and does not require this Worker. Auth, favorites, community writes, and administration continue using their existing Supabase endpoints.

Requires Node 22 or newer. Apply `supabase/migrations/008_egress_optimization.sql` first.

```sh
npm ci
npm test
npx wrangler deploy --dry-run
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler deploy
```

Set `ALLOWED_ORIGIN` in `wrangler.jsonc` to the real frontend origin. Choose a rate-limit namespace unique to this account; the shipped `205055` namespace is a suggested default. Set the repository Actions variable `CATALOG_API_BASE_URL` to the deployed Worker origin (without `/api`). Rebuild the frontend. Never put the service role key in a `VITE_` variable.

The public gateway accepts GET only, validates query fields, caps page size at 50, caps batches at 50 IDs, and preserves exact counts in cached list responses. It rejects arbitrary PostgREST projections/table names. Public data must never depend on caller cookies or authorization headers; these are not forwarded upstream.

Cache retention is 24 hours, freshness 10 minutes. A failed refresh serves the last successful cached response; no failure responses are stored. `X-Catalog-Cache` is HIT, MISS, or STALE. A 402 opens a five-minute circuit. Concurrent identical requests share a pending request in each Worker isolate. Cache and rate limits are per Cloudflare location; they are not a globally strict request budget. Native rate limiting uses 60 requests/minute/IP, so monitor shared NAT clients and distributed scraping. No challenges are returned to API fetches.

After validating all public pages, run the separate `supabase/operations/lockdown_catalog.sql` to prevent bypassing the gateway/static snapshots. Save existing ACLs before applying it. This script preserves Auth/favorites/writes and the scalar submission duplicate lookup, and revokes catalog table/view/RPC reads for anon/authenticated/PUBLIC. Audit other exposed schemas/GraphQL/custom RPCs in the actual production project.

WAF HTML protection and verified bot rules belong on the frontend domain. Cloudflare cannot protect third-party `*.supabase.co` URLs with your website's WAF rules.

References: [Worker Cache](https://developers.cloudflare.com/workers/runtime-apis/cache/), [native rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Supabase API grants](https://supabase.com/docs/guides/api/securing-your-api).
