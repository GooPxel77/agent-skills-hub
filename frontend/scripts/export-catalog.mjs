import { SKILL_FIELDS, readSnapshot, writeSnapshot } from './lib/catalog.mjs';

if (process.env.CATALOG_REUSE_SNAPSHOT === '1') {
  const snapshot = readSnapshot();
  console.log(`Reusing catalog snapshot ${snapshot.generated_at}: ${snapshot.skills.length} skills`);
} else {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; old-project fallbacks are disabled');
  const project = new URL(url);
  if (project.protocol !== 'https:' || !project.hostname.endsWith('.supabase.co')) throw new Error('Invalid Supabase project URL');
  if (process.env.VITE_SUPABASE_URL && new URL(process.env.VITE_SUPABASE_URL).origin !== project.origin) {
    throw new Error('Build and browser Supabase projects do not match');
  }
  let returnedBytes = 0;
  async function query(table, params, rpcBody) {
    const target = new URL(`/rest/v1/${table}`, project);
    target.search = new URLSearchParams(params).toString();
    for (let attempt = 0; ; attempt++) {
      let response;
      try {
        response = await fetch(target, { method: rpcBody ? 'POST' : 'GET', body: rpcBody ? JSON.stringify(rpcBody) : undefined, headers: { apikey: key, Authorization: `Bearer ${key}`, ...(rpcBody ? {'Content-Type':'application/json'} : {}) }, signal: AbortSignal.timeout(30000) });
      } catch (error) {
        if (attempt >= 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
        continue;
      }
      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          const retry = Number(response.headers.get('Retry-After'));
          await response.body?.cancel();
          await new Promise(resolve => setTimeout(resolve, Math.min(30000, Math.max(1000, Number.isFinite(retry) ? retry * 1000 : 1000 * 2 ** attempt))));
          continue;
        }
        await response.body?.cancel();
        throw new Error(`Catalog export HTTP ${response.status}; apply migration 008 and verify the server key`);
      }
      const body = await response.text();
      returnedBytes += Buffer.byteLength(body);
      const rows = JSON.parse(body);
      if (!rpcBody && !Array.isArray(rows)) throw new Error('Invalid export response');
      return rows;
    }
  }
  const revision = await query('sync_logs', { select:'id,status,started_at,finished_at', order:'started_at.desc', limit:'1' });
  if (revision[0]?.status === 'running') throw new Error('Sync is running; export only after it completes');
  const latest = await query('skills', { select:'last_synced', order:'last_synced.desc.nullslast', limit:'1' });
  const watermark = latest[0]?.last_synced;
  if (!watermark || !Number.isFinite(Date.parse(watermark))) throw new Error('Missing catalog watermark');
  let previous;
  try { previous = readSnapshot(); } catch { /* first export */ }
  const incremental = previous?.project_url === project.origin && previous.watermark
    && Date.parse(previous.watermark) <= Date.parse(watermark);
  const byId = new Map(incremental ? previous.skills.map(s => [s.id,s]) : []);
  let lastId = 0, fetched = 0;
  while (true) {
    const bounds = incremental
      ? `(last_synced.gte.${previous.watermark},last_synced.lte.${watermark})`
      : `(last_synced.lte.${watermark})`;
    const page = await query('v_skill_build_export', {
      select: [...SKILL_FIELDS, 'readme_content'].join(','), id:`gt.${lastId}`,
      and:bounds, order:'id.asc', limit:'500'
    });
    if (!page.length) break;
    let currentId = lastId;
    for (const row of page) {
      if (!Number.isSafeInteger(row.id) || row.id <= currentId) {
        throw new Error(`Unsafe export page: invalid ID sequence id=${row.id} previous=${currentId}`);
      }
      currentId = row.id;
      if (row.readme_content) row.readme_content = row.readme_content.slice(0, 1500);
      if (row.stars >= 20) byId.set(row.id, row);
    }
    fetched += page.length;
    lastId = currentId;
    if (page.length < 500) break;
  }
  // Lightweight ID reconciliation handles deletions and rows falling below the public threshold.
  const liveIds = new Set();
  let idCursor = 0;
  while (true) {
    const ids = await query('skills', { select:'id', stars:'gte.20', id:`gt.${idCursor}`,order:'id.asc',limit:'1000' });
    if (!ids.length) break;
    if (ids.some(row => !Number.isSafeInteger(row.id) || row.id <= idCursor)) throw new Error('Invalid live id cursor');
    ids.forEach(row => liveIds.add(row.id));
    idCursor = ids.at(-1).id;
    if (ids.length < 1000) break;
  }
  if ([...liveIds].some(id => !byId.has(id))) throw new Error('Catalog changed during export; retry');
  const skills = [...byId.values()].filter(row => liveIds.has(row.id)).sort((a,b) => a.id-b.id);
  if (!skills.length) throw new Error('Empty export; keeping previous published site');
  let compositions = [];
  if (incremental && fetched === 0 && Array.isArray(previous?.compositions) && previous.compositions.length > 0) {
    compositions = previous.compositions.filter(row => liveIds.has(row.skill_id) && liveIds.has(row.compatible_skill_id));
    console.log(`Reused ${compositions.length} compositions from previous snapshot (no changed skills)`);
  } else {
    let compCursor = 0;
    while (true) {
      const page = await query('v_skill_composition_export', {
        select: 'id,skill_id,compatible_skill_id,compatibility_score,reason',
        id: `gt.${compCursor}`, order: 'id.asc', limit: '1000'
      });
      if (!page.length) break;
      if (page.some(row => !Number.isSafeInteger(row.id) || row.id <= compCursor)) throw new Error('Invalid composition cursor');
      compositions.push(...page.filter(row => liveIds.has(row.skill_id) && liveIds.has(row.compatible_skill_id)));
      compCursor = page.at(-1).id;
      if (page.length < 1000) break;
    }
  }
  const [masters, orgs, weeks] = await Promise.all([
    query('rpc/get_masters', {}, {}), query('rpc/get_org_builders', {}, {}), query('rpc/get_trending_weeks', {}, {})
  ]);
  const today = new Date();
  const day = today.getUTCDay() || 7;
  const currentWeekDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - day + 1));
  const currentWeekStart = currentWeekDate.toISOString().slice(0, 10);

  const history = {};
  for (const week of weeks) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(week.week_start)) throw new Error('Invalid history date');
    if (incremental && week.week_start !== currentWeekStart && Array.isArray(previous?.history?.[week.week_start]) && previous.history[week.week_start].length > 0) {
      history[week.week_start] = previous.history[week.week_start];
    } else {
      history[week.week_start] = await query('rpc/get_trending_history', {}, {p_week_start:week.week_start});
    }
  }
  const endRevision = await query('sync_logs', { select:'id,status,started_at,finished_at', order:'started_at.desc', limit:'1' });
  if (JSON.stringify(revision) !== JSON.stringify(endRevision)) throw new Error('Catalog changed during export; retry after sync');
  writeSnapshot({ version: 1, project_url:project.origin, watermark, generated_at: new Date().toISOString(), skills, compositions, masters, orgs, weeks, history });
  console.log(JSON.stringify({ skills: skills.length, compositions: compositions.length, changed_rows:fetched, incremental:Boolean(incremental), json_bytes: returnedBytes }));
}
