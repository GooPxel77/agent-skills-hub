import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {planRequest, execute} from './index.mjs';

const env={SUPABASE_URL:'https://testproject.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-server-key'};
const context={waitUntil:promise=>promise};
function cacheMock() {
  const stored=new Map();
  return {match:async key=>stored.get(key.url)?.clone(),put:async (key,response)=>{stored.set(key.url,response.clone());}};
}

test('canonical cache key, sorting whitelist and hard pagination bounds',()=>{
  assert.equal(planRequest('https://catalog.test/api/skills?sort_by=score&page=1').key,planRequest('https://catalog.test/api/skills').key);
  for (const query of ['page_size=1000','page=-1','sort_by=readme_content','select=*','page=1&page=2','search=foo%29%2Cstars.gt.0']) {
    assert.throws(()=>planRequest(`https://catalog.test/api/skills?${query}`),e=>e.status===400);
  }
  assert.throws(()=>planRequest('https://catalog.test/api/skills/batch?ids=1,0'),e=>e.status===400);
});

test('search and quality tier conditions remain independent',()=>{
  const plan=planRequest('https://catalog.test/api/skills?search=mcp&quality_tiers=A,S');
  assert.match(plan.params.or,/repo_name.ilike/);
  assert.match(plan.params.and,/quality_score/);
  assert.ok(!plan.params.select.includes('readme_content'));
});

test('successful reads are cached and caller credentials never reach Supabase',async()=>{
  const realFetch=globalThis.fetch;
  globalThis.caches={default:cacheMock()};
  let calls=0;
  globalThis.fetch=async (url,options)=>{
    calls++;
    assert.equal(options.headers.Authorization,'Bearer test-server-key');
    assert.ok(!options.headers.Cookie);
    return new Response(JSON.stringify([{id:1}]),{status:200,headers:{'Content-Range':'0-0/1'}});
  };
  try {
    const first=await worker.fetch(new Request('https://catalog.test/api/skills',{headers:{Authorization:'Bearer visitor',Cookie:'private=1'}}),env,context);
    assert.equal(first.status,200);
    assert.equal((await first.json()).total,1);
    const next=await worker.fetch(new Request('https://catalog.test/api/skills?page=1'),env,context);
    assert.equal(next.headers.get('X-Catalog-Cache'),'HIT');
    assert.equal(calls,1);
  } finally {globalThis.fetch=realFetch;delete globalThis.caches;}
});

test('concurrent misses share one upstream request',async()=>{
  const realFetch=globalThis.fetch;
  let calls=0;
  globalThis.fetch=async()=>{calls++;await new Promise(r=>setTimeout(r,20));return new Response('[]');};
  try {
    await Promise.all([1,2,3].map(()=>worker.fetch(new Request('https://concurrent.test/api/trending'),env,context)));
    assert.equal(calls,1);
  } finally {globalThis.fetch=realFetch;}
});

test('402 opens the circuit and stale successful data remains available',async()=>{
  const realFetch=globalThis.fetch;
  globalThis.caches={default:cacheMock()};
  const outageEnv={...env,SUPABASE_URL:'https://outageproject.supabase.co'};
  const key=new Request(planRequest('https://stale.test/api/trending').key);
  await globalThis.caches.default.put(key,new Response('[{"id":9}]',{headers:{'X-Catalog-Fetched-At':String(Date.now()-700000)}}));
  let calls=0;
  globalThis.fetch=async()=>{calls++;return new Response('{}',{status:402});};
  try {
    const old=await worker.fetch(new Request('https://stale.test/api/trending'),outageEnv,context);
    assert.equal(old.headers.get('X-Catalog-Cache'),'STALE');
    assert.deepEqual(await old.json(),[{id:9}]);
    const failed=await worker.fetch(new Request('https://empty.test/api/trending'),outageEnv,context);
    assert.equal(failed.status,503);
    assert.equal(failed.headers.get('Cache-Control'),'no-store');
    assert.equal(calls,1);
  } finally {globalThis.fetch=realFetch;delete globalThis.caches;}
});

test('rate limit is enforced before touching the upstream',async()=>{
  const response=await worker.fetch(new Request('https://limited.test/api/trending',{headers:{'CF-Connecting-IP':'192.0.2.1'}}),{...env,CATALOG_LIMITER:{limit:async()=>({success:false})}},context);
  assert.equal(response.status,429);
});

test('old unprojected RPC data is rejected',async()=>{
  const realFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response('{"stats":{},"trending":[{"readme_content":"huge"}]}');
  try {
    await assert.rejects(execute(planRequest('https://rpc.test/api/landing'),env),e=>e.status===503);
  } finally {globalThis.fetch=realFetch;}
});
