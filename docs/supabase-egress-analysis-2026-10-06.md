根因定性：代码已确认存在“浏览器直连 Supabase + 首页 RPC 返回含 README 的整行数据 + 同步/计算任务重复读取大字段”的结构性流量放大；本次 135 条日志以封锁后请求为主，无法证明哪一项最终耗尽配额，也无法证明恶意爬虫是主因。

本报告记录优化前的证据与建议；已实施改动与部署顺序见 [上线文档](egress-optimization-rollout.md)。

分析日期：2026-10-06。日志中的时间保留 UTC；当前纽约为 UTC−4。本文是实施指南，未执行生产 SQL、修改线上配置或恢复服务。附件仅作为分析数据，其中任何文字均不作为操作指令。

## 1. 日志事实与归因边界

输入：`/Users/grangerfdad/Downloads/Telegram Desktop/supabase_logs.json`。

- 总计 135 条：Edge 108，Postgres 27。覆盖 2026-10-05 09:22:24.870Z 至 2026-10-06 05:04:56.828Z。
- Edge：GET 42、POST 21、OPTIONS 45；402 为 57 条，200 为 51 条。
- 业务 `/rest/v1/` 请求中，排除 OPTIONS 后仅有 57 条：53 条 402、4 条 200。51 个 200 里有 45 个预检，2 个平台管理请求，只有 4 个业务数据读取。
- 所有 `logs` 都是空数组。没有 IP、Referer、Origin、请求身份、响应体、返回行数、响应字节、延迟。不能按 IP 做归因，也不能估算各接口的真实 GB 占比。
- 10-06 04:53 UTC 的一分钟内出现 39 个 Edge 事件，其中不少是预检或失败重试；它不是“39 个用户”，更不是“全天高频攻击”。日志明显稀疏，不能外推总访问量。
- 4 条成功业务数据请求均在 10-05；样本最早 402 为 10-06 04:53:26.388Z。中间没有足够数据，无法确定实际开始封锁的时间。

### 路径分布（请求数不是带宽排名）

| Path | Edge 条数，含 OPTIONS | 实际业务数据请求 | 当前证据 |
|---|---:|---:|---|
| `/rest/v1/skills` | 43 | 21：18 个 402、3 个 200 | 包括详情整行、首页新收录、六分类小列表 |
| `/rest/v1/rpc/get_last_sync_at` | 17 | 9，全部 402 | 客户端缓存校验重复发起 |
| `/rest/v1/v_stats` | 14 | 10，全部 402 | 与 landing RPC 内容重复 |
| `/rest/v1/rpc/get_landing_data` | 14 | 10，全部 402 | 代码确认的首页大 Payload 候选 |
| `/rest/v1/v_curated_skills` | 6 | 3，全部 402 | `offset=0&limit=20`，已分页 |
| `/rest/v1/v_trending` | 3 | 2，全部 402 | `limit=10`，列表字段已过滤 |
| `/rest/v1/skill_compositions` | 3 | 1，200 | `skill_id=eq.12581&limit=5` |
| `/rest/v1/v_community_classics` | 2 | 1，402 | `limit=10` |
| 平台管理/健康检查 | 6 | 非业务请求 | 不能归为访客或攻击 |

### UA 与请求性质

- Mac Chrome/154：39 条；Android Chrome/127：39 条；Mac Safari/26.6.2：14 条；Linux Chrome/154：10 条。数量均包含 OPTIONS。
- `@supabase-infra/mgmt-api/v1.442.2`：6 条，对应 `/auth/v1/health`、`/rest-admin/v1/ready`、`/admin/v1/network-bans/retrieve`。这是平台管理流量；`network-bans/retrieve` 本身不能证明被攻击。
- 没有声明为 Googlebot、Bingbot、curl 或 Actions 的 UA。浏览器 UA 可以伪造，不能据此确定真人数量。
- 业务 URL 与本地前端函数高度吻合。证据更支持页面加载/滚动/切换触发的应用请求；不能排除执行 JavaScript 的爬虫。
- 没有 Storage / Realtime 请求出现在本样本中，不代表它们在整个计费周期没有消耗。

### 可复核的具体证据

1. 成功的详情大字段读取：
   `2026-10-05T13:06:23.636Z GET 200 https://vyhspbymaczwgqjgnajp.supabase.co/rest/v1/skills?select=*&repo_full_name=eq.apioo%2Ffusio`，UA 为 Linux Chrome/154。
   后续同 UA 在 13:06:25.317Z 拉取 `skill_compositions?select=compatible_skill_id,compatibility_score,reason&skill_id=eq.12581&order=compatibility_score.desc&limit=5`，再在 13:06:25.866Z 拉取 `skills?select=id,repo_name,score&id=in.(12581)`。对应详情→组合关系→关联技能的串行链路。
2. `2026-10-05T15:31:05.878Z` 的 `skills?select=*&repo_full_name=eq.Yuan1z0825%2Fnature-skills` 只有 OPTIONS 记录；不能把它算为一次成功大数据下载。
3. Android 在 `2026-10-06T04:53:26.390Z`、`.392Z` 两次调用 `get_last_sync_at`；在 26.445Z、27.492Z 两次调用 `get_landing_data`，间隔约 1.05 秒，与 `withRetry(... delay=1000)` 一致。`v_stats` 同样重复。
4. 同一 Android UA 在 `04:53:44.211Z—44.225Z` 发出六次 `skills?select=repo_name,repo_full_name,description,stars,score,quality_score,author_name&category=eq.<分类>&order=stars.desc&limit=3`，分类为 claude-skill、mcp-server、agent-tool、ai-skill、codex-skill、llm-plugin；14ms 内完成发起，与 `SkillWorkflows.tsx` 的 `Promise.all(categories.map(...))` 对应。
5. 新收录查询用 `first_seen=gte.2026-09-29T04:53:25.738Z`，下一次变成 `...04:53:36.124Z`。每次以当前毫秒计算窗口，未来直接按 URL 缓存会产生不同缓存键。
6. curated 列表为 `order=score.desc&offset=0&limit=20`，选择 37 个字段但不含 `readme_content`；不能说现有列表“没有分页”。
7. Postgres 主要是 checkpoint。`distance=43882 kB` 是 WAL/checkpoint 指标，不是互联网 Egress；`could not receive data from client: Connection reset by peer` 也不能作为攻击证据。

## 2. 代码确认的泄漏点

### A. 首页 RPC 把 README 混进公共首页

`supabase/migrations/006_v8_fixes.sql:381` 的函数（003 迁移也有同样模式）：

```sql
SELECT json_agg(row_to_json(t))
FROM (SELECT * FROM v_trending LIMIT 10) t;
```

五个榜单视图底层均选择 `skills.*`。因此一次 RPC 最多序列化 50 个整行记录，包含 README；同一技能进入多个榜单时还会重复输出。前端在收到响应后挑选字段，不会减少 Supabase 已经发出的字节。

这里只确认仓库实现；需用 `pg_get_functiondef` 对照线上函数，才能确认线上部署版本。10 次 RPC 在样本里全是 402，无法直接观测其成功响应大小。

### B. 首页请求叠加与失败放大

- `frontend/src/pages/Home.tsx:37` 同时调用 `useStats()`、`useLandingData()`，RPC 已有 stats/categories。
- `frontend/src/hooks/useCachedQuery.ts` 每个 hook 各自先调用 `get_last_sync_at`，然后才发真正查询；localStorage 缓存只服务该浏览器，不在用户间共享。
- 同步校验失败后被 catch 成 null，使缓存跳过判断失效，继续读取业务数据。
- `frontend/src/api/supabaseClient.ts:37` 将 Supabase 错误丢失为普通 Error 后，所有失败都重试一次，包括 402。
- `SkillWorkflows.tsx` 六分类并发；`NewThisWeek.tsx` 另外查新收录/榜单；详情和 Compare 页面有额外串行/并发查询。

### C. 详情和比较仍在 select('*')

`sbFetchSkillDetail`、`sbFetchSkillBySlug`、`fetchSkillsByIds` 都有整行查询；ComparePage 更是 `Promise.all(ids.map(fetchSkillDetail))`，每个详情还查询推荐组合。比较页面应一次查询所需指标，不需要完整 README 和所有推荐关系。

### D. 同步与每日算法通过数据库协议读取完整记录

- `backend/app/scheduler/jobs.py:621` 对每个 cleaned repo 执行 `db.query(Skill).filter(...).first()`，包含 README。每八小时执行一次同步（一天三次）；BATCH_SIZE=200 只控制提交，不会减少 SELECT 字段或请求数。
- README 下载保存最多 50,000 字符。后续每次 ORM 整行读取都可能把这些数据从 Supabase 发到 Actions runner。
- `daily_heavy_runner.py` 的 200 上限只限制待处理目标 ID。`scorer.py` 及 `composability.py` 内部仍 `.query(Skill)...all()` 读取全部候选行；changed_ids 主要限制更新/比较目标，没有限制全局输入数据的字节数。
- 评分算法需要全局归一化，组合算法需要全局候选池：保留必要的全局轻量数据，避免简单加 limit 破坏算法。
- 若连接走 Supavisor，这些字节记在 Shared Pooler Egress，而不是当前 REST 日志。官方说明：[Egress 分类](https://supabase.com/docs/guides/platform/manage-your-usage/egress)。

### E. 构建全量下载及项目指向不一致

`frontend/scripts/generate-skill-pages.mjs` 使用 `stars=gte.20&...readme_content...&order=id.asc&limit=500` 全量读取，然后才 `slice(0,1500)`。截断发生在 runner，节省不了 Supabase Egress。

`generate-sitemap.mjs` 又用 `limit=1000` 全量拉取基础字段，且未加 stars>=20 预过滤。应复用同一快照。

`deploy.yml` 在 main push，以及 Sync / Heavy workflow completed 时构建；未限制前置 workflow 必须成功。因此常规定时任务可能每天额外触发四次构建，此外还有 push / 手动构建，实际次数看 Actions 历史。

重要：两个生成脚本读取 `SUPABASE_URL / SUPABASE_ANON_KEY`，默认项目为 `vknzzecmzsfmohglpfgm`；部署 workflow 仅显式传 `VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY`，浏览器日志项目却为 `vyhspbymaczwgqjgnajp`。不能把默认旧项目的下载直接计入新项目超额。先核对已部署 bundle、Actions 环境以及 DB 连接对应的 project ref；禁止继续默默 fallback 到旧项目。

## 3. P0：恢复和止血顺序

1. 暂停周期全量构建和重计算，保留最后成功的静态站点/快照。失败时展示旧公开数据，不要清空旧快照。
2. 对 402、401、403、参数 4xx 禁止自动重试；只有网络错误、429、可恢复 5xx 使用有限指数退避和 jitter，429 遵循 Retry-After。
3. 合并首页 stats 与 landing；同一资源共享 in-flight Promise；有未过期缓存时不要先为每个组件读取同步时间。版本信息由一个短 TTL 共享资源提供，或随 landing 返回。
4. 先精简 RPC 的数据库投影，再上线网关/快照。只加代理但每次回源，仍会产生 Supabase 出站流量。
5. 将公开目录入口切换到缓存 API 或静态 JSON，验证后关闭客户端角色对目录表/视图/RPC 的直读权限；Auth 与用户收藏按原授权逻辑独立保留。
6. 配额已经消耗的字节无法回退。按控制台套餐选择升级、付费套餐关闭适用的 Spend Cap，或等待下一计费周期；不要把“修代码”描述成会立即解除 402。官方恢复说明：[Manage Egress usage](https://supabase.com/docs/guides/platform/manage-your-usage/egress)。本文未执行任何付费操作。

## 4. P1：架构缓存与防绕过

仓库实际是 React 19 + Vite + React Router，部署 GitHub Pages；不是 Next.js。GitHub Pages 无法执行 Route Handler / ISR。

现状最小改动：保留前端，公开目录由 Cloudflare Worker/独立 Next.js API 或现有 FastAPI 提供；同步后导出一次轻量 JSON 快照并发布，首页、分类和榜单共享它，详情按需访问缓存 API。纯静态 Pages 也可直接分发快照。账户写操作不进入公共缓存。

浏览器 → 自有域名 CDN/WAF → 公开缓存 API/快照 → Supabase（缓存缺失时）

### Next.js App Router 示例

以下代码用于新增的 Next.js 服务，使用传统 Data Cache 模式（未启用 Cache Components）；不是现有 Vite 仓库可直接执行的文件。Next.js 的第三方客户端查询用 `unstable_cache` 明确缓存，不依赖 GET 默认行为。新 Cache Components 项目应按版本采用 `use cache`。参见 [Next.js unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)。

```ts
// app/api/catalog/landing/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const readLanding = unstable_cache(async () => {
  const { data, error } = await db.rpc('get_landing_data');
  if (error) throw error; // 失败不能作为成功数据进入缓存
  return data;
}, ['catalog-landing-v2'], { revalidate: 600, tags: ['catalog'] });

export async function GET(request: Request) {
  // 固定资源不接受任意 cache-busting 参数
  if (new URL(request.url).search) {
    return NextResponse.json({ error: 'Unexpected query' }, {
      status: 400, headers: { 'Cache-Control': 'no-store' }
    });
  }
  try {
    return NextResponse.json(await readLanding(), { headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600'
    }});
  } catch {
    return NextResponse.json({ error: 'Catalog temporarily unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '300' }
    });
  }
}
```

- Service role 仅在服务端环境，绝不加 VITE_ / NEXT_PUBLIC_ 前缀，也不接收客户端任意表名、select、order、SQL。
- 返回值只能是公开目录 DTO；服务角色绕过 RLS，因此每条查询须显式限制可公开数据。
- 前端公开目录函数统一 `fetch('/api/catalog/landing')`；仅设置 VITE_API_BASE_URL 不足以迁移，SkillWorkflows 等直接调用以及部分 API 函数还需一起改。
- 多实例部署要使用共享 Data Cache/Redis/已发布快照；本进程 Map 的缓存和锁不能保证全局回源次数。为回源加 single-flight 和 402 熔断，失败时返回最后成功快照。
- 如改用 Next 页面 ISR，可让页面共享同一缓存读函数；私有页面不使用公共 ISR。静态 export 不支持运行时 ISR。

### Cloudflare Cache Rule

JSON 默认不会自动缓存，仅设置 Cache-Control 不足以证明 HIT。官方行为：[Default Cache Behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)。

```text
http.request.method eq "GET"
and http.request.uri.path eq "/api/catalog/landing"
and http.request.uri.query eq ""
```

动作：Eligible for cache；Edge TTL 遵循源站 Cache-Control；成功 200 缓存 600 秒，4xx/5xx 不缓存；Browser TTL 遵循源站。其他目录资源单独白名单和缓存键规则。不要设置覆盖所有状态码的固定 TTL。

公共资源返回必须与 Cookie/Authorization 无关，不能 Set-Cookie。个性化接口为 `private, no-store` 并明确排除缓存。保留搜索词、分类、排序和游标等语义参数；网关拒绝未知参数并规范化排序/默认值，不能统一忽略所有 query string。

Cloudflare 自有站点 WAF 无法保护浏览器直连的 `*.supabase.co`；隐藏 anon key 和 CORS 都不能阻止脚本请求。关闭目录直读才解决绕过问题。

### 权限收口（仅在所有目录调用迁移后执行）

下列 SQL 是针对目录的示例；执行前核对线上对象及全部依赖。不要撤销 Auth/收藏表授权。SECURITY DEFINER RPC 和默认 owner 权限视图可能独立暴露底层数据，所以必须同时处理视图和函数，而非只对 skills 撤权。官方：[Securing your API](https://supabase.com/docs/guides/api/securing-your-api)。

```sql
REVOKE SELECT ON public.skills, public.skill_compositions
FROM PUBLIC, anon, authenticated;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, viewname FROM pg_views
    WHERE schemaname = 'public' AND viewname IN (
      'v_curated_skills', 'v_trending', 'v_rising', 'v_top_rated',
      'v_community_classics', 'v_recently_updated',
      'v_stats', 'v_categories', 'v_language_stats'
    )
  LOOP
    EXECUTE format('REVOKE SELECT ON %I.%I FROM PUBLIC, anon, authenticated',
                   r.schemaname, r.viewname);
    EXECUTE format('GRANT SELECT ON %I.%I TO service_role',
                   r.schemaname, r.viewname);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.get_landing_data()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_landing_data() TO service_role;
GRANT SELECT ON public.skills, public.skill_compositions TO service_role;
```

继续审计并迁移 `get_masters`、`get_org_builders`、`get_trending_history`、`get_trending_weeks`、`get_last_sync_at` 等目录读取函数及可访问的 GraphQL/其他视图；逐一对函数的准确签名撤权。必须撤销 PUBLIC EXECUTE，否则 anon 仍可能继承函数执行权限。不要误撤写入或账号函数。

## 5. P1：数据库投影、分页和比较

### 首页 RPC 完整替换示例

下面保留原有返回 shape 和 37 个列表字段，五个榜单均不返回 README/search_vector。比只缩到十几个字段更利于当前 UI 兼容。后续再按卡片实际使用情况缩小 DTO。

部署前先记录原函数定义用于回滚，并确认线上各视图字段与仓库一致、service_role 可读取这些视图与其底层表。

```sql
CREATE OR REPLACE FUNCTION public.get_landing_data()
RETURNS json LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
SELECT json_build_object(
  'stats', (SELECT row_to_json(s) FROM public.v_stats s LIMIT 1),
  'categories', COALESCE((SELECT json_agg(c) FROM public.v_categories c), '[]'::json),
  'trending', COALESCE((SELECT json_agg(x) FROM
    (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens
     FROM public.v_trending LIMIT 10) x), '[]'::json),
  'rising', COALESCE((SELECT json_agg(x) FROM
    (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens
     FROM public.v_rising LIMIT 10) x), '[]'::json),
  'top_rated', COALESCE((SELECT json_agg(x) FROM
    (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens
     FROM public.v_top_rated LIMIT 10) x), '[]'::json),
  'hall_of_fame', COALESCE((SELECT json_agg(x) FROM
    (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens
     FROM public.v_community_classics LIMIT 10) x), '[]'::json),
  'recently_updated', COALESCE((SELECT json_agg(x) FROM
    (SELECT id, repo_full_name, repo_name, repo_url, description, homepage_url, author_name, author_avatar_url, author_followers, stars, forks, open_issues, total_issues, total_commits, language, category, topics, license, score, star_momentum, project_type, last_commit_at, created_at, last_synced, first_seen, quality_completeness, quality_clarity, quality_specificity, quality_examples, quality_agent_readiness, quality_score, size_category, repo_size_kb, readme_size, readme_structure_score, platforms, estimated_tokens
     FROM public.v_recently_updated LIMIT 10) x), '[]'::json),
  'languages', COALESCE((SELECT json_agg(l) FROM public.v_language_stats l), '[]'::json)
);
$$;
REVOKE EXECUTE ON FUNCTION public.get_landing_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_landing_data() TO service_role;

```

### 详情与比较

现有详情 UI 未见 readme_content 消费。先将详情的 `select('*')` 改为现有显式 SKILL_COLUMNS；只有打开 README 时才请求独立接口。

```ts
const COMPARE_COLUMNS = [
  'id', 'repo_full_name', 'repo_name', 'repo_url', 'description',
  'stars', 'score', 'quality_score', 'quality_completeness',
  'quality_clarity', 'quality_specificity', 'quality_examples',
  'quality_agent_readiness', 'readme_structure_score',
  'estimated_tokens', 'language', 'category', 'platforms', 'license'
].join(',');

// 放在服务端；id 参数先验证为正整数，最多 4 个
const ids = [...new Set(requestedIds)];
if (!ids.length || ids.length > 4 || ids.some(id => !Number.isSafeInteger(id) || id <= 0)) {
  throw new Error('Invalid comparison ids');
}
const { data, error } = await db.from('skills')
  .select(COMPARE_COLUMNS).in('id', ids).gte('stars', 20);
if (error) throw error;
```

### 硬上限、稳定排序、游标分页

当前 offset=0&limit=20 本身正常。改动重点是服务端强制最大 50 条、排序字段白名单和深页游标。以下为 stars 降序示例；保持当前 curated 的 stars>=20 规则，若线上有其他公开资格条件也要并入。

```ts
const pageSize = Math.min(50, Math.max(1, requestedPageSize));
if (!Number.isSafeInteger(requestedPageSize)) throw new Error('Invalid page size');
const CARD_COLUMNS = 'id,repo_full_name,repo_name,repo_url,description,stars,score,category,language,author_name,author_avatar_url,platforms,estimated_tokens';
let query = db.from('skills').select(CARD_COLUMNS).gte('stars', 20)
  .order('stars', { ascending: false }).order('id', { ascending: false });
if (cursor) {
  // 游标从网关解码，先验证两个字段均为非负安全整数；禁止传原始过滤字符串
  if (![cursor.stars, cursor.id].every(Number.isSafeInteger) || cursor.stars < 0 || cursor.id <= 0) {
    throw new Error('Invalid cursor');
  }
  query = query.or(`stars.lt.${cursor.stars},and(stars.eq.${cursor.stars},id.lt.${cursor.id})`);
}
const { data, error } = await query.limit(pageSize + 1);
if (error) throw error;
const hasMore = (data?.length ?? 0) > pageSize;
const items = (data ?? []).slice(0, pageSize);
const nextCursor = hasMore ? { stars: items.at(-1)!.stars, id: items.at(-1)!.id } : null;
```

不用每页 `count:'exact'`，用 hasMore；如产品仍要总页数，缓存单独统计。exact count 的主要问题是数据库计算，不是巨大响应字节。动态 stars 排序的跨页结果可能随数据更新变化；要严格稳定则使用快照版本。

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS skills_catalog_stars_id
ON public.skills (stars DESC, id DESC) WHERE stars >= 20;
CREATE INDEX CONCURRENTLY IF NOT EXISTS skills_category_stars_id
ON public.skills (category, stars DESC, id DESC);
```

CONCURRENTLY 在事务块外执行，先 EXPLAIN 检查现有索引，避免盲目加索引。索引降低计算/延迟，不直接减少同一结果的返回字节。

### 构建时在数据库截断 README

```sql
CREATE OR REPLACE VIEW public.v_skill_build_export AS
SELECT id, repo_full_name, repo_name, author_name, author_avatar_url,
       stars, forks, description, category, language, score, license,
       left(readme_content, 1500) AS readme_content,
       readme_size, last_commit_at, created_at, topics,
       quality_score, platforms, star_momentum, estimated_tokens,
       open_issues, total_commits
FROM public.skills
WHERE stars >= 20;
REVOKE SELECT ON public.v_skill_build_export FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.v_skill_build_export TO service_role;
```

生成器改查此视图并保留原有 id 游标，一次导出给 HTML 和 sitemap 共用。这里 left() 在数据库执行，才减少线上传输。服务角色只放 Actions secrets，并使用 Node 的非 VITE 环境变量，不进入浏览器 bundle。

## 6. P2：流水线增量与 upsert

### 先统一项目环境变量，删除旧项目 fallback

```js
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing server Supabase configuration');
```

工作流给导出步骤传对应变量；不要把 service role 放入 Vite 配置。把“导出一次快照”从每次前端代码构建中分离，普通代码部署复用最后成功 artifact。同步完成后只处理真实变更；大批量读取至少只拿 id/repo_full_name/hash。

### SQLAlchemy bulk upsert 替代逐仓库 SELECT 全行

先添加 source_hash 列，同时在 ORM Skill 模型添加对应 Column。hash 只包含上游业务字段，不包含 last_synced、运行时间或派生评分；删除/下架用独立对账处理。

```sql
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS source_hash text;
```

```python
import hashlib, json
from sqlalchemy.dialects.postgresql import insert
from app.models.skill import Skill

# 每批 rows 的字段集合应一致；输入是已有 cleaner 规范化后的业务字段
rows = []
for repo_data in normalized_batch:
    business = {k: v for k, v in repo_data.items()
                if k not in {'id', 'last_synced', 'first_seen', 'prev_stars', 'source_hash'}}
    payload = json.dumps(business, sort_keys=True, ensure_ascii=False,
                         separators=(',', ':'), default=str).encode()
    rows.append({**business, 'source_hash': hashlib.sha256(payload).hexdigest()})

if rows:
    stmt = insert(Skill).values(rows)
    mutable = {k: getattr(stmt.excluded, k) for k in rows[0]
               if k not in {'repo_full_name'}}
    # 与原逻辑一致：只在真正更新时保留旧 stars
    mutable['prev_stars'] = Skill.stars
    stmt = stmt.on_conflict_do_update(
        index_elements=[Skill.repo_full_name], set_=mutable,
        where=Skill.source_hash.is_distinct_from(stmt.excluded.source_hash)
    )
    db.execute(stmt)  # 不 RETURNING 全行；批量提交
    db.commit()
```

如计算必须知道变更 id，只 `.returning(Skill.id)`。如果字段应允许局部更新，就按字段集合分组，不要将缺失字段补成 null 后覆盖。同步 freshness 和 public content version 分离：内容未变不更新全站缓存版本；不要让运行时间进入 hash。

降低读取还可用 `db.query(Skill.id, Skill.repo_full_name, Skill.source_hash)` 一次批量加载轻量元信息。不要只用 GitHub pushed_at 判定是否变更：stars/forks/description 等可能在无 push 时变化；用选定业务字段 hash，配合低频全量对账。

### Supabase JS upsert 默认不要求返回行

适用于采用 REST 的脚本；当前 Python 同步是数据库连接，不能只改 JS 就修复它。

```ts
const { error } = await db.from('skills')
  .upsert(changedRows, { onConflict: 'repo_full_name' });
if (error) throw error;
// 不串 .select('*')；确实需要 ID 时只 .select('id')
```

HTTP 等价为 `Prefer: resolution=merge-duplicates,return=minimal`。无返回并不等于增量：需先用 hash 筛掉 unchangedRows，或数据库 ON CONFLICT WHERE 检测变化。参见 [Supabase JS upsert](https://supabase.com/docs/reference/javascript/upsert)。

### 重计算真正限制数据读取

- daily runner 目标查询只返回 Skill.id；评分依赖 README 的部分只取 changed_ids 的 README。
- 全局评分归一化在 SQL 聚合，或只取 stars/forks/followers/commits 等数值 DTO。
- 组合算法只取 id、description、topics、category、platforms、language 等轻量 DTO；框架识别依赖 README 的前 3000 字符，可在更新时预计算 frameworks 并存储，而不是每次全量拉 README。
- 不要在部分加载 ORM 后继续访问未加载字段，否则 lazy loading 又会产生 N+1。直接返回 tuple/dict/DTO 更容易控制投影。
- 仓库已有 none_found 自关联哨兵来记录无推荐结果；保留其计算标记，但不要将哨兵返回为用户可见推荐。

### Workflow 限制

```yaml
# sync.yml 等写同一库的 workflow 使用同一 group
concurrency:
  group: catalog-db-maintenance
  cancel-in-progress: false
```

cron run 可能被排队或替换 pending，要核对调度需求；跨 workflow 的数据库锁可用 advisory lock/lease 补充。不是简单靠降频掩盖大字段读取。

```yaml
# deploy.yml 的 build job：前置 workflow 成功才允许构建
if: >-
  github.event_name != 'workflow_run' ||
  github.event.workflow_run.conclusion == 'success'
```

现有 sitemap generator 最后 `main().catch(console.error)` 会吞掉失败退出码，应改为打印错误并 `process.exitCode = 1`；对导出记录数/shape 做检查。成功才替换旧快照，增量导出应从固定快照或稳定 revision watermark 读取，避免生成过程中更新导致漏数据。last_synced 每次更新的设计不适合作为“内容真正变化”游标，新增内容版本/updated_at。

## 7. P2：即时 WAF / Rate Limiting / Robots

这些规则作用于自有域名入口，须与 Supabase 目录撤权配套。

Cloudflare Rate Limiting 初始规则：

```text
http.request.method eq "GET"
and starts_with(http.request.uri.path, "/api/catalog/")
```

计数按 IP；Free 可从 30 次 / 10 秒、Block 10 秒开始，符合其短计数周期限制。支持更长周期的套餐可改为 60 次 / 60 秒、Block 60 秒。只是初始阈值，依据真实请求分布和共享 NAT 调整，不能保证按 IP 识别真人或阻止分布式抓取。接口用 429，不向 fetch API 返回需要浏览器交互的 challenge HTML。官方套餐限制：[Cloudflare Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)。

HTML 详情页可单独限速和 Managed Challenge；已验证搜索引擎通过 Cloudflare verified bot 信号识别，不能靠 UA 白名单。更高级 cf.bot_management.score 条件仅在套餐实际支持时使用。对 API 查询参数白名单、最大页长、最大比较数量、最大搜索长度做应用层硬限制；禁止客户端任意选择 README/JSON。

```text
# robots.txt（合作式指引，不是安全边界）
User-agent: *
Disallow: /api/
Disallow: /admin/
Sitemap: https://www.205055.xyz/sitemap.xml
```

robots 对恶意抓取没有约束力，也不能约束直连 supabase.co 的脚本。先优化公共目录的字节与缓存，再依据带 IP 的完整日志决定针对性规则；当前数据不足以给出应封禁的 IP。

## 8. 验收与量化

1. 先在控制台按被限制项目查看 Database / Shared Pooler / Storage 等 Egress 以及日期峰值，核对 GitHub workflow 的真实运行时间与成功/失败状态。记录套餐、周期、实际用量。
2. 补封锁前至少 24—72 小时完整访问记录：IP、UTC timestamp、UA、path/query、状态、Origin/Referer、request id、缓存状态。Supabase 当前 API gateway 日志本身可能没有 response bytes；在自有网关按实际序列化结果记录字节、返回行数、回源次数和延迟，而非虚构从本 JSON 读到了这些字段。
3. 检查线上定义：`SELECT pg_get_functiondef('public.get_landing_data()'::regprocedure);`。查索引/查询统计用 Query Performance 或 pg_stat_statements；rows/calls 是查询量指标，不是字节数。
4. 在恢复后或测试环境用 `octet_length(public.get_landing_data()::text)` 对比 SQL JSON 大小；用同一数据集测 HTTP wire bytes。SQL 字节不等于最终计费网络字节，但可定位 Payload 改善。
5. 首页 JSON 中任何榜单都不应出现 readme_content。详情默认读取也不含 README。HTML generator 请求返回的 README 最长 1500 字符。
6. 同一公开 URL 连续访问，检查 `CF-Cache-Status: HIT` / Age，并验证 Supabase 回源次数没有随每次访问增长。不能只看浏览器请求减少。
7. 用旧 anon key 和 authenticated 用户 JWT 分别尝试目录表、视图、RPC，应该拒绝；Auth 和收藏仍正常。旧公开 URL 不能绕过网关读取大字段。
8. 每次同步输出 examined/changed/written/returned_rows/returned_bytes；unchanged 仓库不产生完整记录 SELECT、不写入、不触发全站重新导出。
9. 估算式：未缓存访问次数 × 平均响应字节 + 自动化读取次数 × 每次读取字节。示例：若 10,000 个记录平均 20KB，每次完整读取约 200MB；每天三次约 18GB/30天，仅为情景计算，非本项目实测。若首页 50 个榜单条目平均各有 20KB README，单次约 1MB，也只是说明量级。
10. 首批目标：公开 API 固定分页上限、README 列表零返回、稳定资源缓存 HIT 达 95%（需流量验证）、402 无自动重试、每次构建最多一份轻量导出。再根据分项 Egress 与新增监控调整优先级。

所有 Next.js/SQL/Cloudflare 范例均未在生产执行；必须先核对线上 schema 和宿主环境再上线。本文分析读取了本地日志及仓库代码，没有调用真实项目数据库。
