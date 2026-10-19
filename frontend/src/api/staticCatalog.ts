import type { Skill, SkillDetail, SkillsQueryParams, PaginatedSkills } from '../types/skill';

const resources = new Map<string, Promise<unknown>>();
let decodedCatalog: Promise<Skill[]> | null = null;
export function readPublished<T>(path: string): Promise<T> {
  let promise = resources.get(path);
  if (!promise) {
    promise = fetch(`${import.meta.env.BASE_URL}data/${path}`).then(async response => {
      if (!response.ok) throw new Error(`Published catalog unavailable (${response.status})`);
      if (response.headers.get('content-type')?.includes('text/html')) {
        throw new Error('This skill’s published data is temporarily unavailable. Please try again later.');
      }
      return response.json();
    }).catch(error => { resources.delete(path); throw error; });
    resources.set(path, promise);
  }
  return promise as Promise<T>;
}

export async function staticDetail(slug: string): Promise<SkillDetail> {
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(slug) || slug.split('/').some(s => s==='.' || s==='..')) throw new Error('Invalid slug');
  return readPublished<SkillDetail>(`skills/${slug.split('/').map(encodeURIComponent).join('/')}.json`);
}

export async function staticByIds(ids: number[]): Promise<Skill[]> {
  const valid = [...new Set(ids)].filter(id => Number.isSafeInteger(id) && id>0).slice(0,50);
  const lookup = await readPublished<Record<string,string>>('ids.json');
  return Promise.all(valid.filter(id => lookup[id]).map(id => staticDetail(lookup[id])));
}

export async function staticSkills(params: SkillsQueryParams): Promise<PaginatedSkills> {
  // Loaded only when searching/browsing, once per page session, from the static CDN.
  if (!decodedCatalog) {
    decodedCatalog = readPublished<{ columns: (keyof Skill)[]; rows: unknown[][] }>('catalog.json')
      .then(packed => packed.rows.map(values => Object.fromEntries(packed.columns.map((key,index) => [key,values[index]])) as unknown as Skill))
      .catch(error => { decodedCatalog = null; throw error; });
  }
  const all = await decodedCatalog;
  const pageSize = Math.min(50,Math.max(1,Math.trunc(params.page_size)||20));
  const requestedPage = Math.min(Number.MAX_SAFE_INTEGER,Math.max(1,Math.trunc(params.page)||1));
  const words = (params.search||'').trim().toLocaleLowerCase().slice(0,100).split(/\s+/).filter(Boolean);
  const tiers = new Set((params.quality_tiers || '').split(',').filter(Boolean));
  const tier = (score: number) => score>=80 ? 'S' : score>=65 ? 'A' : score>=50 ? 'B' : score>=35 ? 'C' : 'D';
  const matches = all.filter(s => (!params.category || s.category===params.category)
    && (!params.size_category || s.size_category===params.size_category)
    && (!params.platform || (() => { try { return JSON.parse(s.platforms||'[]').includes(params.platform); } catch { return false; } })())
    && (!params.min_stars || s.stars>=params.min_stars)
    && (!tiers.size || tiers.has(tier(s.quality_score || 0)))
    && (!words.length || words.every(word => `${s.repo_name} ${s.description} ${s.author_name} ${s.topics}`.toLocaleLowerCase().includes(word))));
  const sort = ['score','stars','last_commit_at','created_at','quality_score','star_momentum'].includes(params.sort_by) ? params.sort_by : 'stars';
  const ascending = params.sort_order==='asc';
  matches.sort((a,b) => {
    const left=a[sort],right=b[sort];
    if (left==null) return right==null ? a.id-b.id : 1;
    if (right==null) return -1;
    const diff=typeof left==='number' && typeof right==='number' ? left-right : String(left).localeCompare(String(right));
    return (diff || a.id-b.id)*(ascending ? 1 : -1);
  });
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(matches.length / pageSize)));
  return { items:matches.slice((page-1)*pageSize,page*pageSize),total:matches.length,page,page_size:pageSize,total_pages:Math.max(1,Math.ceil(matches.length/pageSize)) };
}
