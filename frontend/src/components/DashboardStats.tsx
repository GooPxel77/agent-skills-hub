import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { fetchLanguageStats, fetchTrending } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill, Stats } from "../types/skill";
import { timeAgo } from "../utils/time";
import { CategoryPieChart } from "./charts/CategoryPieChart";
import { LanguageBarChart } from "./charts/LanguageBarChart";
import { StarTrendChart } from "./charts/StarTrendChart";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  "C#": "#178600",
  Shell: "#89e051",
  Kotlin: "#A97BFF",
};

const CAT_COLORS: Record<string, string> = {
  "mcp-server": "#a855f7",
  "uncategorized": "#475569",
  "agent-tool": "#00f0ff",
  "codex-skill": "#22d3ee",
  "claude-skill": "#f59e0b",
  "llm-plugin": "#ec4899",
  "ai-skill": "#a855f7",
  "youmind-plugin": "#22d3ee",
};

interface Props {
  stats: Stats | null;
  initialLanguages?: { language: string; count: number }[];
  initialTrending?: Skill[];
}

export function DashboardStats({ stats, initialLanguages, initialTrending }: Props) {
  const { t } = useI18n();
  const [langs, setLangs] = useState<{ language: string; count: number }[]>(initialLanguages ?? []);
  const [trendingSkills, setTrendingSkills] = useState<Skill[]>(initialTrending ?? []);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (initialLanguages && initialLanguages.length > 0) setLangs(initialLanguages);
  }, [initialLanguages]);

  useEffect(() => {
    if (initialTrending && initialTrending.length > 0) setTrendingSkills(initialTrending);
  }, [initialTrending]);

  useEffect(() => {
    if (langs.length > 0) return;
    fetchLanguageStats().then(setLangs).catch(console.error);
  }, [langs.length]);

  useEffect(() => {
    if (!showCharts || trendingSkills.length > 0) return;
    fetchTrending(15).then(setTrendingSkills).catch(console.error);
  }, [showCharts, trendingSkills.length]);

  if (!stats) return null;

  const totalLangs = langs.reduce((s, l) => s + l.count, 0) || 1;

  return (
    <section className="mb-10">
      {/* Stat Cards — 3 key metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="ps-card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold ps-neon-text">{stats.total_skills.toLocaleString()}</div>
          <div className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--ps-text-secondary)' }}>{t("stats.totalSkills")}</div>
        </div>
        <div className="ps-card p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ps-neon-cyan)' }}>{stats.avg_score.toFixed(1)}</div>
          <div className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--ps-text-secondary)' }}>{t("stats.avgScore")}</div>
        </div>
        <div className="ps-card p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ps-neon-green)' }}>{timeAgo(stats.last_sync_at)}</div>
            {stats.last_sync_status === "completed" && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--ps-neon-green)' }} title="Sync healthy" />
            )}
            {stats.last_sync_status === "running" && (
              <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: 'var(--ps-neon-amber)' }} title="Sync running" />
            )}
            {stats.last_sync_status === "failed" && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--ps-neon-pink)' }} title="Sync failed" />
            )}
          </div>
          <div className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--ps-text-secondary)' }}>{t("stats.lastSync")}</div>
        </div>
      </div>

      {/* Category Distribution + Language Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="ps-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ps-text-primary)' }}>{t("stats.categoryDist")}</h3>
          <div className="space-y-3">
            {stats.categories.filter((cat) => cat.name !== "uncategorized").map((cat) => {
              const pct = (cat.count / stats.total_skills) * 100;
              const color = CAT_COLORS[cat.name] || "#475569";
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--ps-text-primary)' }}>{cat.name}</span>
                    </div>
                    <span className="text-sm tabular-nums" style={{ color: 'var(--ps-text-secondary)' }}>
                      {cat.count.toLocaleString()}<span className="ml-1 text-xs" style={{ color: 'var(--ps-text-muted)' }}>({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'var(--ps-bg-elevated)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div className="ps-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ps-text-primary)' }}>{t("stats.topLanguages")}</h3>
          {/* Stacked Bar */}
          <div className="flex h-5 rounded-lg overflow-hidden mb-4" style={{ background: 'var(--ps-bg-elevated)' }}>
            {langs.slice(0, 8).map((l) => (
              <div
                key={l.language}
                className="h-full transition-all duration-500 hover:opacity-80 cursor-default relative group"
                style={{
                  width: `${(l.count / totalLangs) * 100}%`,
                  backgroundColor: LANG_COLORS[l.language] || "#475569",
                }}
                title={`${l.language}: ${l.count.toLocaleString()}`}
              />
            ))}
          </div>
          {/* Legend grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {langs.slice(0, 12).map((l) => {
              const langPct = ((l.count / totalLangs) * 100).toFixed(1);
              return (
                <div key={l.language} className="flex items-center gap-2 py-1 px-2 rounded-md transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ps-bg-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: LANG_COLORS[l.language] || "#475569" }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium truncate block" style={{ color: 'var(--ps-text-primary)' }}>{l.language}</span>
                    <span className="text-[10px]" style={{ color: 'var(--ps-text-muted)' }}>{l.count.toLocaleString()} ({langPct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toggle for interactive charts */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="ps-btn text-xs"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCharts ? "rotate-180" : ""}`} />
          {showCharts ? t("trending.showLess") : t("chart.categoryDist")}
        </button>
      </div>

      {/* Interactive Charts (collapsible) */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <CategoryPieChart categories={stats.categories} total={stats.total_skills} />
          <LanguageBarChart languages={langs} />
          {trendingSkills.length > 0 && (
            <div className="lg:col-span-2">
              <StarTrendChart skills={trendingSkills} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
