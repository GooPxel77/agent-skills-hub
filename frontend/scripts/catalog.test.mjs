import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { SKILL_FIELDS, buildLanding } from './lib/catalog.mjs';
const generatedAt='2026-10-06T00:00:00Z';
const skill=(id,extra={})=>({
  ...Object.fromEntries(SKILL_FIELDS.map(key=>[key,null])),
  id,repo_full_name:`owner/repo${id}`,repo_name:`repo${id}`,repo_url:`https://github.com/owner/repo${id}`,
  description:'Useful agent tool',author_name:'owner',author_avatar_url:'',topics:'[]',platforms:'[]',
  category:'mcp-server',language:'Python',stars:100,score:70,last_synced:generatedAt,
  created_at:'2026-10-05T00:00:00Z',first_seen:'2026-10-05T00:00:00Z',
  readme_size:50000,readme_content:'Excerpt '.repeat(180),...extra
});
test('homepage cards exclude README and retain sync timestamp',()=>{
  const bundle=buildLanding([skill(1),skill(2)],generatedAt);
  assert.equal(bundle.stats.last_sync_at,generatedAt);
  assert.equal(bundle.stats.total_skills,2);
  assert.equal(bundle.workflows[0].skill_count,2);
  assert.ok(!JSON.stringify(bundle).includes('readme_content'));
});
test('HTML, sitemap, detail and catalog reuse one offline snapshot',()=>{
  const dir=mkdtempSync(join(tmpdir(),'skills-catalog-test-'));
  const snapshot=join(dir,'snapshot.json');
  mkdirSync(join(dir,'dist'));
  writeFileSync(join(dir,'dist/index.html'),'<html><head><title>Agent Skills Hub</title><script type="module" src="/assets/app.js"></script></head><body></body></html>');
  writeFileSync(snapshot,JSON.stringify({version:1,generated_at:generatedAt,skills:[skill(1),skill(2)],
    compositions:[{skill_id:1,compatible_skill_id:2,compatibility_score:0.8,reason:'shared_tools'}],
    masters:{masters:[],emerging:[]},orgs:[],weeks:[],history:{}}));
  try {
    for (const script of ['export-catalog.mjs','generate-skill-pages.mjs','generate-sitemap.mjs']) {
      const result=spawnSync(process.execPath,[resolve('scripts',script)],{cwd:dir,encoding:'utf8',env:{...process.env,CATALOG_REUSE_SNAPSHOT:'1',CATALOG_SNAPSHOT_PATH:snapshot,SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:''}});
      assert.equal(result.status,0,result.stderr+result.stdout);
    }
    assert.ok(readFileSync(join(dir,'dist/skill/owner/repo1/index.html'),'utf8').includes('repo1'));
    const detail=JSON.parse(readFileSync(join(dir,'dist/data/skills/owner/repo1.json'),'utf8'));
    assert.equal(detail.compatible_skills[0].skill_id,2);
    assert.ok(!('readme_content' in detail));
    assert.ok(!readFileSync(join(dir,'dist/data/catalog.json'),'utf8').includes('readme_content'));
    assert.ok(readFileSync(join(dir,'dist/sitemap-top.xml'),'utf8').includes('/skill/owner/repo1'));
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('export neither retries quota errors nor publishes partial data',()=>{
  const dir=mkdtempSync(join(tmpdir(),'skills-export-test-'));
  const script=resolve('scripts/export-catalog.mjs');
  const driver=`let calls=0; globalThis.fetch=async()=>{calls++;return new Response('{}',{status:402});}; try {await import(${JSON.stringify('file://'+script)});process.exitCode=2;} catch(error) {if(calls!==1 || !error.message.includes('402')) process.exitCode=3;}`;
  try {
    const result=spawnSync(process.execPath,['--input-type=module','-e',driver],{cwd:dir,encoding:'utf8',env:{...process.env,CATALOG_REUSE_SNAPSHOT:'0',SUPABASE_URL:'https://fixture.supabase.co',VITE_SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'test-key'}});
    assert.equal(result.status,0,result.stderr);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('incremental export updates changed rows and reconciles deletions',()=>{
  const dir=mkdtempSync(join(tmpdir(),'skills-incremental-test-'));
  const snapshot=join(dir,'snapshot.json');
  const oldWatermark='2026-10-05T00:00:00Z';
  const newWatermark='2026-10-06T00:00:00Z';
  writeFileSync(snapshot,JSON.stringify({version:1,generated_at:oldWatermark,watermark:oldWatermark,
    project_url:'https://fixture.supabase.co',skills:[skill(1),skill(2),skill(4)],compositions:[]}));
  const script=resolve('scripts/export-catalog.mjs');
  const changed=[skill(1,{stars:120}),skill(3)];
  const driver=`let sawIncremental=false; globalThis.fetch=async target=>{
    const url=new URL(target); const table=url.pathname.split('/').at(-1); let data=[];
    if(table==='sync_logs') data=[{id:1,status:'completed'}];
    else if(table==='skills' && url.searchParams.get('select')==='last_synced') data=[{last_synced:${JSON.stringify(newWatermark)}}];
    else if(table==='skills') data=[{id:1},{id:3},{id:4}];
    else if(table==='v_skill_build_export') { sawIncremental=url.searchParams.get('and').includes('last_synced.gte.${oldWatermark}');data=${JSON.stringify(changed)}; }
    else if(table==='get_masters') data={masters:[],emerging:[]};
    return new Response(JSON.stringify(data));
  }; await import(${JSON.stringify('file://'+script)}); if(!sawIncremental) process.exitCode=2;`;
  try {
    const result=spawnSync(process.execPath,['--input-type=module','-e',driver],{cwd:dir,encoding:'utf8',env:{...process.env,CATALOG_REUSE_SNAPSHOT:'0',CATALOG_SNAPSHOT_PATH:snapshot,SUPABASE_URL:'https://fixture.supabase.co',VITE_SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'test-key'}});
    assert.equal(result.status,0,result.stderr);
    const updated=JSON.parse(readFileSync(snapshot,'utf8'));
    assert.deepEqual(updated.skills.map(s=>s.id),[1,3,4]);
    assert.equal(updated.skills[0].stars,120);
    assert.equal(updated.watermark,newWatermark);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('published catalog filters, paginates and shares one lazy download',async()=>{
  const ts=await import('typescript');
  const source=readFileSync(resolve('src/api/staticCatalog.ts'),'utf8');
  const compiled=ts.default.transpileModule(source,{compilerOptions:{module:ts.default.ModuleKind.ESNext,target:ts.default.ScriptTarget.ES2022}}).outputText
    .replaceAll('import.meta.env','({ BASE_URL: "https://published.test/" })');
  const module=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  const realFetch=globalThis.fetch;
  const rows=[skill(1,{stars:100,quality_score:85}),skill(2,{stars:500,quality_score:40}),skill(3,{stars:200,quality_score:60})];
  let calls=0;
  globalThis.fetch=async url=>{
    assert.equal(url,'https://published.test/data/catalog.json');calls++;
    return new Response(JSON.stringify({columns:SKILL_FIELDS,rows:rows.map(s=>SKILL_FIELDS.map(k=>s[k]))}));
  };
  try {
    const base={page:1,page_size:1,sort_by:'stars',sort_order:'desc'};
    const first=await module.staticSkills({...base,min_stars:200});
    const second=await module.staticSkills({...base,min_stars:200,page:2});
    assert.equal(first.items[0].id,2);
    assert.equal(second.items[0].id,3);
    assert.equal(first.total,2);
    const high=await module.staticSkills({...base,quality_tiers:'S',search:'useful tool'});
    assert.equal(high.items[0].id,1);
    assert.equal(calls,1);
  } finally {globalThis.fetch=realFetch;}
});

test('static pagination reaches the final record beyond page 500', async () => {
  const ts = await import('typescript');
  const source = readFileSync(resolve('src/api/staticCatalog.ts'), 'utf8');
  const compiled = ts.default.transpileModule(source, { compilerOptions: { module: ts.default.ModuleKind.ESNext, target: ts.default.ScriptTarget.ES2022 } }).outputText
    .replaceAll('import.meta.env', '({ BASE_URL: "https://paging.test/" })');
  const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  const originalFetch = globalThis.fetch;
  const rows = Array.from({ length: 10021 }, (_, i) => [i + 1, 100, 50]);
  globalThis.fetch = async () => new Response(JSON.stringify({ columns: ['id', 'stars', 'score'], rows }));
  try {
    const query = { page_size: 20, sort_by: 'score', sort_order: 'asc' };
    const penultimate = await module.staticSkills({ ...query, page: 501 });
    assert.equal(penultimate.items[0].id, 10001);
    const final = await module.staticSkills({ ...query, page: 502 });
    assert.equal(final.total_pages, 502);
    assert.deepEqual(final.items.map(s => s.id), [10021]);
    const beyond = await module.staticSkills({ ...query, page: 999999 });
    assert.equal(beyond.page, 502);
    assert.deepEqual(beyond.items.map(s => s.id), [10021]);
  } finally { globalThis.fetch = originalFetch; }
});

test('source download never invents package or MCP installation commands', async () => {
  const ts = await import('typescript');
  const source = readFileSync(resolve('src/utils/installation.ts'), 'utf8').replace(/^import .*;\n/gm, '');
  const compiled = ts.default.transpileModule(source, { compilerOptions: { module: ts.default.ModuleKind.ESNext, jsx: ts.default.JsxEmit.React } }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  for (const language of ['Python', 'JavaScript', 'TypeScript']) {
    const commands = module.getInstallCommands(skill(1, { repo_full_name: 'owner/not-a-published-package', language, category: 'mcp-server', platforms: '["docker","mcp"]' }));
    assert.equal(commands.length, 1);
    assert.equal(commands[0].command, 'git clone https://github.com/owner/not-a-published-package.git');
  }
  for (const repo_full_name of ['../repo', 'owner/..', 'owner/repo;echo bad', 'owner/repo extra']) {
    assert.deepEqual(module.getInstallCommands(skill(1, { repo_full_name })), []);
  }
});
