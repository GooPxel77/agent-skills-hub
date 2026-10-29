import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowRightLine, RiStarFill } from "@remixicon/react";
import { fetchNewThisWeek, fetchTrending, fetchMostStarred } from "../api/client";
import type { Skill } from "../types/skill";
import { formatStars, timeAgo } from "../utils/time";
import { useI18n } from "../i18n/I18nContext";

type StreamTab = "new" | "trending" | "stars";

export function NewThisWeek() {
  const { t, lang } = useI18n();
  const zh = lang === "zh";
  const [activeTab, setActiveTab] = useState<StreamTab>("new");
  const [result, setResult] = useState<{ tab: StreamTab; items: Skill[]; error: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const cache = useRef<Partial<Record<StreamTab, Skill[]>>>({});

  useEffect(() => {
    let cancelled = false;
    const cached = cache.current[activeTab];
    const request = cached ? Promise.resolve(cached) : activeTab === "new" ? fetchNewThisWeek(10) : activeTab === "trending" ? fetchTrending(10) : fetchMostStarred(10);
    request.then(items => {
      if (!cancelled) { cache.current[activeTab] = items; setResult({ tab: activeTab, items, error: false }); }
    }).catch(() => { if (!cancelled) setResult({ tab: activeTab, items: [], error: true }); });
    return () => { cancelled = true; };
  }, [activeTab, retry]);

  const loading = !result || result.tab !== activeTab;
  const items = loading ? [] : result.items;
  const error = !loading && result.error;
  const tabs: { id: StreamTab; label: string }[] = [
    { id: "new", label: t("dataStream.tabNew") },
    { id: "trending", label: t("dataStream.tabTrending") },
    { id: "stars", label: t("dataStream.tabMostStars") },
  ];
  const explanation = activeTab === "new"
    ? (zh ? "以快照發布時間為準，近 7 天首次收錄，按 Star 總數排序。" : "First indexed in the 7 days before publication, ordered by total stars.")
    : activeTab === "trending"
    ? (zh ? "快照發布前 7 天建立、至少 50 Star，按建立後平均每日 Star 排序。" : "Created in the 7 days before publication with at least 50 stars, ordered by average stars per day.")
    : (zh ? "建立至少 180 天、至少 100 Star，按 Star 總數排序。" : "At least 180 days old with 100 or more stars, ordered by total stars.");

  return (
    <section className="mb-10" aria-labelledby="stream-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h2 id="stream-title" className="text-xl font-semibold text-[var(--ps-text-primary)]">{t("dataStream.title")}</h2>
          <p className="mt-1 text-sm text-[var(--ps-text-secondary)]">{zh ? "來自已發布的 GitHub 資料快照" : "From the published GitHub catalog snapshot"}</p>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label={zh ? "榜單類型" : "Catalog lists"}>
          {tabs.map(tab => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}
            className={`min-h-11 px-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-[var(--ps-neon-cyan)] text-[var(--ps-neon-cyan)]" : "border-transparent text-[var(--ps-text-secondary)] hover:text-[var(--ps-text-primary)]"}`}>
            {tab.label}
          </button>)}
        </div>
      </div>
      <p className="text-sm text-[var(--ps-text-secondary)] mb-3" aria-live="polite">{explanation}</p>
      <div className="rounded-xl overflow-hidden border border-[var(--ps-border)] bg-[var(--ps-bg-card)]">
        {loading ? <p role="status" className="p-8 text-sm text-[var(--ps-text-secondary)]">{zh ? "載入中…" : "Loading projects…"}</p>
        : error ? <div role="alert" className="p-8 text-sm text-[var(--ps-text-secondary)]">{zh ? "無法載入榜單。" : "Could not load this list."} <button className="text-[var(--ps-neon-cyan)] underline underline-offset-4" onClick={() => { setResult(null); setRetry(n => n + 1); }}>{zh ? "重試" : "Try again"}</button></div>
        : items.length === 0 ? <p className="p-8 text-sm text-[var(--ps-text-secondary)]">{zh ? "目前沒有符合條件的項目。" : "No projects match this list yet."}</p>
        : <ol className="divide-y divide-[var(--ps-border)]">
          {items.map((skill, i) => {
            const date = activeTab === "new" ? skill.first_seen || skill.created_at : skill.last_commit_at || skill.first_seen;
            const dateLabel = activeTab === "new" ? (skill.first_seen ? (zh ? "收錄" : "Indexed") : (zh ? "建立" : "Created")) : skill.last_commit_at ? (zh ? "提交" : "Updated") : (zh ? "收錄" : "Indexed");
            return <li key={skill.id} className="relative flex items-center gap-3 px-4 py-4 hover:bg-[var(--ps-bg-card-hover)]">
              <span className="w-5 shrink-0 text-sm tabular-nums text-[var(--ps-text-muted)]">{i + 1}</span>
              <img src={skill.author_avatar_url} alt="" loading="lazy" width={32} height={32} className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/skill/${skill.repo_full_name}`} className="font-semibold text-sm text-[var(--ps-text-primary)] hover:text-[var(--ps-neon-cyan)] after:absolute after:inset-0">{skill.repo_name}</Link>
                <span className="ml-2 text-xs text-[var(--ps-text-secondary)]">{skill.author_name}</span>
                <p className="text-sm text-[var(--ps-text-secondary)] truncate mt-1">{skill.description || "—"}</p>
                <p className="mt-1 text-xs text-[var(--ps-text-secondary)] sm:hidden">{dateLabel} {timeAgo(date)}</p>
              </div>
              <span className="flex items-center gap-1 text-sm tabular-nums text-[var(--ps-text-secondary)] shrink-0" aria-label={`${formatStars(skill.stars)} stars`}><RiStarFill className="w-4 h-4 text-[var(--ps-neon-amber)]" />{formatStars(skill.stars)}</span>
              <span className="hidden sm:block w-32 text-right text-xs text-[var(--ps-text-secondary)] shrink-0">{dateLabel} {timeAgo(date)}</span>
            </li>;
          })}
        </ol>}
        <div className="border-t border-[var(--ps-border)] px-4 py-3 flex justify-end">
          <Link to="/?tab=explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--ps-neon-cyan)] hover:underline underline-offset-4">{zh ? "探索所有項目" : "Explore all projects"}<RiArrowRightLine className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}
