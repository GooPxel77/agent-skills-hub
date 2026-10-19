/** Public catalog only. Authentication and writes stay on their existing endpoints. */
export const SKILL_COLUMNS = 'id,repo_full_name,repo_name,repo_url,description,homepage_url,author_name,author_avatar_url,author_followers,stars,forks,open_issues,total_issues,total_commits,language,category,topics,license,score,star_momentum,project_type,last_commit_at,created_at,last_synced,first_seen,quality_completeness,quality_clarity,quality_specificity,quality_examples,quality_agent_readiness,quality_score,size_category,repo_size_kb,readme_size,readme_structure_score,platforms,estimated_tokens';
const SORTS = new Set(['score','stars','last_commit_at','created_at','quality_score','star_momentum']);
const inflight = new Map();
const restricted = new Map();
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function integer(value, fallback, min, max) {
  if (value === null || value === undefined) return fallback;
  if (!/^\d+$/.test(String(value))) throw new HttpError(400, 'Invalid integer');
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) throw new HttpError(400, 'Integer out of range');
  return number;
}
function text(value, max = 100) {
  if (!value || value.length > max || /[(),\\\x00-\x1f]/.test(value)) throw new HttpError(400, 'Invalid filter');
  return value;
}
export function planRequest(input) {
  const url = new URL(input);
  const p = url.searchParams;
  const path = url.pathname.replace(/\/$/, '');
  const allowed = path === '/api/skills' ? ['page','page_size','sort_by','sort_order','search','category','platform','size_category','quality_tiers','min_stars']
    : path === '/api/skills/batch' ? ['ids']
    : path === '/api/trending/history' ? ['week_start']
    : ['/api/trending','/api/rising','/api/top-rated','/api/most-starred','/api/recently-updated','/api/new-this-week','/api/language-stats'].includes(path) ? ['limit','days'] : [];
  for (const key of p.keys()) if (!allowed.includes(key) || p.getAll(key).length !== 1) throw new HttpError(400, 'Unexpected parameter');
  const normalized = new URLSearchParams();
  const params = { select: SKILL_COLUMNS };
  let kind = 'list', resource, body;
  if (path === '/api/skills') {
    const page = integer(p.get('page'), 1, 1, 500);
    const size = integer(p.get('page_size'), 20, 1, 50);
    const sort = p.get('sort_by') || 'score', order = p.get('sort_order') || 'desc';
    if (!SORTS.has(sort) || !['asc','desc'].includes(order)) throw new HttpError(400, 'Invalid sort');
    normalized.set('page', String(page)); normalized.set('page_size', String(size));
    normalized.set('sort_by', sort); normalized.set('sort_order', order);
    Object.assign(params, { stars: `gte.${integer(p.get('min_stars'), 20, 20, 10000000)}`, order: `${sort}.${order}.nullslast,id.${order}`, offset: String((page-1)*size), limit: String(size) });
    if (p.has('min_stars')) normalized.set('min_stars', params.stars.slice(4));
    for (const key of ['category','size_category']) if (p.has(key)) {
      const value = text(p.get(key)); params[key] = `eq.${value}`; normalized.set(key,value);
    }
    if (p.has('platform')) {
      const value = text(p.get('platform')); params.platforms = `ilike.%"${value}"%`; normalized.set('platform',value);
    }
    if (p.has('search') && p.get('search').trim()) {
      const value = text(p.get('search').trim(), 100).replace(/[%_*]/g, '');
      if (!value) throw new HttpError(400, 'Empty search');
      params.or = `(repo_name.ilike.%${value}%,description.ilike.%${value}%,author_name.ilike.%${value}%)`;
      normalized.set('search',value);
    }
    if (p.has('quality_tiers')) {
      const tiers = [...new Set(p.get('quality_tiers').split(','))].sort();
      const filters = { S:'quality_score.gte.80', A:'and(quality_score.gte.65,quality_score.lt.80)', B:'and(quality_score.gte.50,quality_score.lt.65)', C:'and(quality_score.gte.35,quality_score.lt.50)', D:'quality_score.lt.35' };
      if (!tiers.length || tiers.some(t => !filters[t])) throw new HttpError(400, 'Invalid quality tier');
      // Keep the search OR and quality OR as separate AND operands.
      params.and = `(or(${tiers.map(t => filters[t]).join(',')}))`;
      normalized.set('quality_tiers',tiers.join(','));
    }
    resource = 'skills'; kind = 'paginated';
  } else if (path === '/api/skills/batch') {
    const raw = p.get('ids');
    if (!raw || raw.split(',').length > 50) throw new HttpError(400, 'At most 50 ids');
    const ids = [...new Set(raw.split(',').map(id => integer(id, 0, 1, Number.MAX_SAFE_INTEGER)))].sort((a,b)=>a-b);
    normalized.set('ids',ids.join(','));
    Object.assign(params, { id:`in.(${ids.join(',')})`, stars:'gte.20', limit:'50' }); resource='skills';
  } else if (path.startsWith('/api/skills/by-slug/')) {
    const slug = decodeURIComponent(path.slice('/api/skills/by-slug/'.length));
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(slug) || slug.split('/').some(s => s==='.' || s==='..')) throw new HttpError(400,'Invalid slug');
    Object.assign(params, { repo_full_name:`eq.${slug}`, stars:'gte.20', limit:'1' }); resource='skills'; kind='detail';
  } else if (/^\/api\/skills\/\d+$/.test(path)) {
    Object.assign(params, { id:`eq.${integer(path.split('/').at(-1),0,1,Number.MAX_SAFE_INTEGER)}`, stars:'gte.20', limit:'1' }); resource='skills'; kind='detail';
  } else if (['/api/landing','/api/stats','/api/categories','/api/language-stats'].includes(path)) {
    resource='rpc/get_landing_data'; kind=path.split('/').at(-1); body={};
  } else if (path==='/api/workflows') { resource='rpc/get_workflow_categories'; body={};
  } else if (path==='/api/masters') { resource='rpc/get_masters'; body={};
  } else if (path==='/api/org-builders') { resource='rpc/get_org_builders'; body={};
  } else if (path==='/api/trending/weeks') { resource='rpc/get_trending_weeks'; body={};
  } else if (path==='/api/trending/history') {
    const date=p.get('week_start');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date) throw new HttpError(400,'Invalid week');
    normalized.set('week_start',date); resource='rpc/get_trending_history'; body={p_week_start:date};
  } else {
    const views = { '/api/trending':'v_trending', '/api/rising':'v_rising', '/api/top-rated':'v_top_rated', '/api/most-starred':'v_community_classics', '/api/recently-updated':'v_recently_updated', '/api/new-this-week':'skills' };
    resource=views[path];
    if (!resource) throw new HttpError(404,'Unknown endpoint');
    const limit=integer(p.get('limit'),10,1,50); normalized.set('limit',String(limit)); params.limit=String(limit);
    if (p.has('days') && integer(p.get('days'),7,7,7)!==7) throw new HttpError(400,'Only seven-day window is supported');
    if (path==='/api/new-this-week') {
      const cutoff=new Date(); cutoff.setUTCHours(0,0,0,0);
      Object.assign(params,{stars:'gte.20',first_seen:`gte.${new Date(cutoff.getTime()-7*86400000).toISOString()}`,order:'stars.desc,id.desc'});
    }
  }
  normalized.sort();
  return { path, resource, params: body ? {} : params, body, kind, key:`${url.origin}${path}?${normalized}` };
}

export async function execute(plan, env) {
  const project = new URL(env.SUPABASE_URL);
  if (project.protocol !== 'https:' || !project.hostname.endsWith('.supabase.co')) throw new HttpError(503,'Invalid project configuration');
  if ((restricted.get(project.origin) || 0) > Date.now()) throw new HttpError(503,'Upstream restricted');
  async function query(resource, params, body, count=false) {
    const url = new URL(`/rest/v1/${resource}`, project);
    url.search = new URLSearchParams(params).toString();
    const response=await fetch(url,{method:body ? 'POST':'GET',headers:{
      apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...(body ? {'Content-Type':'application/json'}:{}), ...(count ? {Prefer:'count=exact'}:{})
    },body:body ? JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
    if (!response.ok) {
      if (response.status===402) restricted.set(project.origin,Date.now()+300000);
      await response.body?.cancel();
      throw new HttpError(response.status===429 ? 429 : 503, 'Upstream unavailable');
    }
    return {data:await response.json(),range:response.headers.get('Content-Range')};
  }
  const result=await query(plan.resource,plan.params,plan.body,plan.kind==='paginated');
  let data=result.data;
  if (plan.kind==='detail') {
    if (!data.length) throw new HttpError(404,'Skill not found');
    const skill=data[0];
    const comps=(await query('skill_compositions',{select:'compatible_skill_id,compatibility_score,reason',skill_id:`eq.${skill.id}`,compatible_skill_id:`neq.${skill.id}`,order:'compatibility_score.desc',limit:'5'})).data;
    const others=comps.length ? (await query('skills',{select:'id,repo_name,score',id:`in.(${comps.map(c=>c.compatible_skill_id).join(',')})`,stars:'gte.20',limit:'5'})).data : [];
    const byId=new Map(others.map(s=>[s.id,s]));
    data={...skill,compatible_skills:comps.filter(c=>byId.has(c.compatible_skill_id)).map(c=>({skill_id:c.compatible_skill_id,skill_name:byId.get(c.compatible_skill_id).repo_name,skill_score:byId.get(c.compatible_skill_id).score,compatibility_score:c.compatibility_score,reason:c.reason}))};
  } else if (plan.kind==='paginated') {
    const size=Number(plan.params.limit),page=Number(plan.params.offset)/size+1;
    const total=Number(result.range?.split('/')[1]);
    if (!Number.isFinite(total)) throw new HttpError(503,'Missing count');
    data={items:data,total,page,page_size:size,total_pages:Math.max(1,Math.ceil(total/size))};
  } else if (plan.resource==='rpc/get_masters') {
    const masters=[...(data.masters || []), ...(data.emerging || [])];
    const names=[...new Set(masters.flatMap(m=>[m.github,...(m.github_aliases || [])]))];
    const repos=names.length ? (await query('skills',{select:'id,repo_name,repo_full_name,repo_url,description,stars,score,category,author_name',author_name:`in.(${names.map(name=>text(name)).join(',')})`,stars:'gte.20',order:'stars.desc',limit:'100'})).data : [];
    data=masters.map(m => {
      const authors=new Set([m.github,...(m.github_aliases || [])].map(n=>n.toLowerCase()));
      return {...m,avatar_url:`https://avatars.githubusercontent.com/${m.github}`,repo_count:m.skill_count,
        x_verified_at:null,discovered:!m.is_verified,
        top_repos:repos.filter(r=>authors.has(r.author_name.toLowerCase())).slice(0,5)};
    });
  } else if (['landing','stats','categories','language-stats'].includes(plan.kind)) {
    const stats={...data.stats,categories:data.categories ?? []};
    data=plan.kind==='stats' ? stats : plan.kind==='categories' ? stats.categories : plan.kind==='language-stats' ? data.languages : {...data,stats,generated_at:new Date().toISOString()};
  }
  // Protect against accidentally deploying an old SELECT * RPC.
  function hasLargeField(value) {
    if (!value || typeof value !== 'object') return false;
    return Object.entries(value).some(([key,item]) => key==='readme_content' || key==='search_vector' || hasLargeField(item));
  }
  if (hasLargeField(data)) throw new HttpError(503,'Apply catalog projection migration');
  return data;
}

function json(data,status=200,headers={}) { return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}}); }
export default {
  async fetch(request,env,ctx) {
    const headers={'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN || 'https://www.205055.xyz','Vary':'Origin'};
    if (request.method==='OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, OPTIONS'}});
    if (request.method!=='GET') return json({error:'Method not allowed'},405,{...headers,'Cache-Control':'no-store','Allow':'GET, OPTIONS'});
    try {
      const plan=planRequest(request.url);
      if (env.CATALOG_LIMITER) {
        const ip=request.headers.get('CF-Connecting-IP');
        if (!ip) throw new HttpError(400,'Missing client address');
        const {success}=await env.CATALOG_LIMITER.limit({key:`catalog:${ip}`});
        if (!success) return json({error:'Rate limit exceeded'},429,{...headers,'Cache-Control':'no-store','Retry-After':'60'});
      }
      const cacheKey=new Request(plan.key);
      const cache=globalThis.caches?.default;
      const cached=await cache?.match(cacheKey);
      const age=cached ? Date.now()-Number(cached.headers.get('X-Catalog-Fetched-At')) : Infinity;
      const serve=(response,state) => {
        const out=new Response(response.body,response);
        for (const [key,value] of Object.entries(headers)) out.headers.set(key,value);
        out.headers.set('Cache-Control','public, max-age=60, s-maxage=600, stale-while-revalidate=3600');
        out.headers.set('X-Catalog-Cache',state);
        return out;
      };
      if (cached && age<600000) return serve(cached,'HIT');
      try {
        let pending=inflight.get(plan.key);
        if (!pending) {
          pending=execute(plan,env).finally(()=>inflight.delete(plan.key));
          inflight.set(plan.key,pending);
        }
        const data=await pending;
        const stored=json(data,200,{'Cache-Control':'public, max-age=86400','X-Catalog-Fetched-At':String(Date.now())});
        if (cache) ctx.waitUntil(cache.put(cacheKey,stored.clone()));
        return serve(stored,'MISS');
      } catch (error) {
        if (cached && error.status!==404) return serve(cached,'STALE');
        throw error;
      }
    } catch (error) {
      return json({error:error instanceof HttpError ? error.message : 'Catalog unavailable'},error.status || 503,{...headers,'Cache-Control':'no-store','Retry-After':'300'});
    }
  }
};
