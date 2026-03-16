import { useEffect, useState, useCallback } from "react";
import { Flame, Sparkles, Zap, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { fetchTrending, fetchRising, fetchTrendingWeeks, fetchTrendingHistory } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill } from "../types/skill";
import type { WeeklyTrendingEntry, TrendingWeek } from "../types/skill";
import { formatStars, timeAgo } from "../utils/time";

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(weekEnd + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

interface Props {
  onSelect?: (skill: Skill) => void;
  onShowDetail?: (skill: Skill) => void;
  initialHot?: Skill[];
  initialRising?: Skill[];
}

export function TrendingSection({ onSelect: _onSelect, onShowDetail, initialHot, initialRising }: Props) {
  const { t } = useI18n();
  const [hot, setHot] = useState<Skill[]>(initialHot ?? []);
  const [rising, setRising] = useState<Skill[]>(initialRising ?? []);
  const [tab, setTab] = useState<"rising" | "history">("rising");

  const [weeks, setWeeks] = useState<TrendingWeek[]>([]);
  const [weeksLoaded, setWeeksLoaded] = useState(false);
  const [weekIdx, setWeekIdx] = useState(0);
  const [historyItems, setHistoryItems] = useState<WeeklyTrendingEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [risingExpanded, setRisingExpanded] = useState(false);

  useEffect(() => {
    if (initialHot && initialHot.length > 0) setHot(initialHot);
  }, [initialHot]);

  useEffect(() => {
    if (initialRising && initialRising.length > 0) setRising(initialRising);
  }, [initialRising]);

  useEffect(() => {
    if (hot.length > 0) return;
    fetchTrending(10).then(setHot).catch(console.error);
  }, [hot.length]);

  useEffect(() => {
    if (rising.length > 0) return;
    fetchRising(7, 10).then(setRising).catch(console.error);
  }, [rising.length]);

  useEffect(() => {
    if (tab !== "history" || weeksLoaded) return;
    setWeeksLoaded(true);
    fetchTrendingWeeks()
      .then((w) => {
        setWeeks(w);
        setWeekIdx(0);
      })
      .catch(console.error);
  }, [tab, weeksLoaded]);

  const loadHistory = useCallback(
    async (idx: number) => {
      if (weeks.length === 0 || idx < 0 || idx >= weeks.length) return;
      setHistoryLoading(true);
      try {
        const data = await fetchTrendingHistory(weeks[idx].week_start);
        setHistoryItems(data);
      } catch (e) {
        console.error(e);
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [weeks],
  );

  useEffect(() => {
    if (tab === "history" && weeks.length > 0) {
      loadHistory(weekIdx);
    }
  }, [tab, weekIdx, weeks, loadHistory]);

  const items = tab === "rising" ? rising : [];
  if (hot.length === 0 && rising.length === 0) return null;

  const currentWeek = weeks[weekIdx];
  const canPrev = weekIdx < weeks.length - 1;
  const canNext = weekIdx > 0;

  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5" style={{ color: 'var(--ps-neon-amber)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--ps-text-primary)' }}>{t("trending.title")}</h2>
          <span className="text-sm hidden sm:inline" style={{ color: 'var(--ps-text-muted)' }}>{t("trending.subtitle")}</span>
        </div>
        {/* Sub-tabs */}
        <div className="flex sm:ml-auto rounded-lg p-0.5 self-start" style={{ background: 'var(--ps-bg-elevated)' }}>
          <button
            onClick={() => setTab("rising")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer`}
            style={{
              background: tab === "rising" ? 'var(--ps-bg-card)' : 'transparent',
              color: tab === "rising" ? 'var(--ps-neon-green)' : 'var(--ps-text-secondary)',
              boxShadow: tab === "rising" ? '0 0 8px rgba(34, 211, 238, 0.15)' : 'none',
              border: tab === "rising" ? '1px solid var(--ps-border-glow)' : '1px solid transparent',
            }}
          >
            <Sparkles className="w-3 h-3 inline -mt-0.5 mr-0.5" />
            {t("trending.newThisWeek")}
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer`}
            style={{
              background: tab === "history" ? 'var(--ps-bg-card)' : 'transparent',
              color: tab === "history" ? 'var(--ps-neon-amber)' : 'var(--ps-text-secondary)',
              boxShadow: tab === "history" ? '0 0 8px rgba(245, 158, 11, 0.15)' : 'none',
              border: tab === "history" ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            }}
          >
            <Zap className="w-3 h-3 inline -mt-0.5 mr-0.5" />
            {t("trending.starVelocityHistory")}
          </button>
        </div>
      </div>

      {/* Week navigator */}
      {tab === "history" && weeks.length > 0 && currentWeek && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => canPrev && setWeekIdx(weekIdx + 1)}
            disabled={!canPrev}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: canPrev ? 'var(--ps-text-secondary)' : 'var(--ps-text-muted)', opacity: canPrev ? 1 : 0.4 }}
            title={t("trending.prevWeek")}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[180px] text-center" style={{ color: 'var(--ps-text-primary)' }}>
            {formatWeekRange(currentWeek.week_start, currentWeek.week_end)}
          </span>
          <button
            onClick={() => canNext && setWeekIdx(weekIdx - 1)}
            disabled={!canNext}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: canNext ? 'var(--ps-text-secondary)' : 'var(--ps-text-muted)', opacity: canNext ? 1 : 0.4 }}
            title={t("trending.nextWeek")}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {weekIdx !== 0 && (
            <button
              onClick={() => setWeekIdx(0)}
              className="text-xs font-medium ml-1"
              style={{ color: 'var(--ps-neon-amber)' }}
            >
              {t("trending.currentWeek")}
            </button>
          )}
        </div>
      )}

      {/* History loading / empty */}
      {tab === "history" && historyLoading && (
        <div className="text-center py-8 text-sm" style={{ color: 'var(--ps-text-muted)' }}>Loading...</div>
      )}
      {tab === "history" && !historyLoading && weeks.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: 'var(--ps-text-muted)' }}>{t("trending.noHistory")}</div>
      )}

      {/* Grid: rising tab */}
      {tab === "rising" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {items.map((skill, i) => (
            <div
              key={skill.id}
              onClick={() => onShowDetail?.(skill)}
              className={`relative ps-card p-4 hover:-translate-y-0.5 transition-all cursor-pointer group${i >= 4 && !risingExpanded ? " hidden sm:block" : ""}`}
            >
              {/* Rank badge */}
              <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold shadow-md`}
                style={{
                  background: i < 3 ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
                  color: i < 3 ? '#0a0e1a' : 'var(--ps-text-secondary)',
                  border: i >= 3 ? '1px solid var(--ps-border)' : 'none',
                }}
              >
                {i + 1}
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 mb-2">
                <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={32} height={32}
                  className="w-8 h-8 rounded-full" style={{ border: '1px solid var(--ps-border)' }} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs truncate block" style={{ color: 'var(--ps-text-secondary)' }}>{skill.author_name}</span>
                </div>
              </div>

              <h3
                onClick={(e) => { e.stopPropagation(); window.open(skill.repo_url, "_blank", "noopener"); }}
                className="font-semibold text-sm truncate transition-colors cursor-pointer"
                style={{ color: 'var(--ps-text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
              >
                {skill.repo_name}
              </h3>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--ps-text-muted)' }}>
                {skill.description || "No description"}
              </p>

              <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--ps-text-muted)' }}>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
                  <strong style={{ color: 'var(--ps-text-primary)' }}>
                    {formatStars(skill.stars)}
                  </strong>
                </span>
                <span>{timeAgo(skill.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "rising" && items.length > 4 && !risingExpanded && (
        <button
          onClick={() => setRisingExpanded(true)}
          className="sm:hidden w-full py-2.5 mt-2 text-xs font-medium cursor-pointer"
          style={{ color: 'var(--ps-neon-cyan)' }}
        >
          {t("common.showAll").replace("{count}", String(items.length))}
        </button>
      )}

      {/* Grid: history tab */}
      {tab === "history" && !historyLoading && historyItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {historyItems.map((entry) => (
            <div
              key={`${entry.rank}-${entry.skill_id}`}
              onClick={() => {
                const skillLike = {
                  id: entry.skill_id,
                  repo_full_name: entry.repo_full_name,
                  repo_name: entry.repo_name,
                  repo_url: entry.repo_url,
                  description: entry.description,
                  author_name: entry.author_name,
                  author_avatar_url: entry.author_avatar_url,
                  stars: entry.stars,
                  category: entry.category,
                  created_at: entry.created_at_snap,
                  last_commit_at: entry.last_commit_at_snap,
                } as Skill;
                onShowDetail?.(skillLike);
              }}
              className="relative ps-card p-4 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              {/* Rank badge */}
              <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold shadow-md"
                style={{
                  background: entry.rank <= 3 ? 'var(--ps-gradient-warm)' : 'var(--ps-bg-elevated)',
                  color: entry.rank <= 3 ? '#0a0e1a' : 'var(--ps-text-secondary)',
                  border: entry.rank > 3 ? '1px solid var(--ps-border)' : 'none',
                }}
              >
                {entry.rank}
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 mb-2">
                <img src={entry.author_avatar_url} alt={entry.author_name} loading="lazy" width={32} height={32}
                  className="w-8 h-8 rounded-full" style={{ border: '1px solid var(--ps-border)' }} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs truncate block" style={{ color: 'var(--ps-text-secondary)' }}>{entry.author_name}</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--ps-neon-amber)' }}>
                    {entry.star_velocity >= 1000
                      ? `${(entry.star_velocity / 1000).toFixed(1)}k/day`
                      : entry.star_velocity >= 1
                        ? `${entry.star_velocity.toFixed(0)}/day`
                        : `${(entry.star_velocity * 7).toFixed(0)}/week`}
                  </span>
                </div>
              </div>

              <h3
                onClick={(e) => { e.stopPropagation(); window.open(entry.repo_url, "_blank", "noopener"); }}
                className="font-semibold text-sm truncate transition-colors cursor-pointer"
                style={{ color: 'var(--ps-text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
              >
                {entry.repo_name}
              </h3>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--ps-text-muted)' }}>
                {entry.description || "No description"}
              </p>

              <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--ps-text-muted)' }}>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
                  <strong style={{ color: 'var(--ps-text-primary)' }}>
                    {formatStars(entry.stars)}
                  </strong>
                </span>
                <span>{timeAgo(entry.last_commit_at_snap)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
