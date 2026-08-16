import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSparklingLine,
  RiFireLine,
  RiStarFill,
  RiPulseLine,
  RiArrowRightSLine,
  RiArrowRightLine,
  RiExternalLinkLine,
  RiTimeLine,
  RiFlashlightLine,
} from "@remixicon/react";
import { fetchNewThisWeek, fetchTrending, fetchMostStarred } from "../api/client";
import type { Skill } from "../types/skill";
import { formatStars, timeAgo } from "../utils/time";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  onShowDetail?: (skill: Skill) => void;
}

type StreamTab = "new" | "trending" | "stars";

const CATEGORY_LABEL: Record<string, { zh: string; en: string }> = {
  "mcp-server": { zh: "MCP Server", en: "MCP Server" },
  "claude-skill": { zh: "Claude 技能", en: "Claude Skill" },
  "agent-tool": { zh: "Agent 工具", en: "Agent Tool" },
  "ai-skill": { zh: "自动化脚本", en: "AI Skill" },
  "codex-skill": { zh: "Codex 技能", en: "Codex Skill" },
  "llm-plugin": { zh: "LLM 插件", en: "LLM Plugin" },
};

export function NewThisWeek({ onShowDetail }: Props) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StreamTab>("new");
  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // In-memory cache to avoid refetching on tab switch
  const cacheRef = useRef<Partial<Record<StreamTab, Skill[]>>>({});

  useEffect(() => {
    let cancelled = false;

    // Return from cache if already loaded
    if (cacheRef.current[activeTab]) {
      setItems(cacheRef.current[activeTab] || []);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetcher =
      activeTab === "new"
        ? fetchNewThisWeek(10)
        : activeTab === "trending"
        ? fetchTrending(10)
        : fetchMostStarred(10);

    fetcher
      .then((data) => {
        if (!cancelled) {
          cacheRef.current[activeTab] = data;
          setItems(data);
        }
      })
      .catch((err) => {
        console.error(`Failed to fetch stream [${activeTab}]:`, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleExploreMore = () => {
    if (activeTab === "new") {
      navigate("/?tab=explore&sort_by=created_at&sort_order=desc");
    } else if (activeTab === "trending") {
      navigate("/?tab=explore&sort_by=star_momentum&sort_order=desc");
    } else {
      navigate("/?tab=explore&sort_by=stars&sort_order=desc");
    }
  };

  return (
    <section className="mb-10">
      {/* Header & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] flex items-center justify-center border border-[var(--ps-neon-cyan)]/20">
              <RiPulseLine className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ps-text-primary)] flex items-center gap-2">
              <span>{t("dataStream.title")}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("dataStream.liveSync")}
              </span>
            </h2>
          </div>
          <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 ml-8">
            {t("dataStream.subtitle")}
          </p>
        </div>

        {/* 3-Tab Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--ps-bg-elevated)] border border-[var(--ps-border)] self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "new"
                ? "bg-[var(--ps-bg-card)] text-[var(--ps-neon-cyan)] shadow-sm border border-[var(--ps-neon-cyan)]/30"
                : "text-[var(--ps-text-secondary)] hover:text-[var(--ps-text-primary)]"
            }`}
          >
            <RiSparklingLine className="w-3.5 h-3.5" />
            <span>{t("dataStream.tabNew")}</span>
          </button>

          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "trending"
                ? "bg-[var(--ps-bg-card)] text-[var(--ps-neon-amber)] shadow-sm border border-[var(--ps-neon-amber)]/30"
                : "text-[var(--ps-text-secondary)] hover:text-[var(--ps-text-primary)]"
            }`}
          >
            <RiFireLine className="w-3.5 h-3.5" />
            <span>{t("dataStream.tabTrending")}</span>
          </button>

          <button
            onClick={() => setActiveTab("stars")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "stars"
                ? "bg-[var(--ps-bg-card)] text-amber-300 shadow-sm border border-amber-300/30"
                : "text-[var(--ps-text-secondary)] hover:text-[var(--ps-text-primary)]"
            }`}
          >
            <RiStarFill className="w-3.5 h-3.5 text-amber-300" />
            <span>{t("dataStream.tabMostStars")}</span>
          </button>
        </div>
      </div>

      {/* Main Flow Table / List */}
      <div className="rounded-[var(--ps-radius-card)] overflow-hidden border border-[var(--ps-border)] bg-[var(--ps-bg-surface)] shadow-sm">
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto border-[var(--ps-neon-cyan)] border-t-transparent" />
            <p className="text-xs text-[var(--ps-text-muted)] font-mono">
              Loading dynamic stream...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-xs text-[var(--ps-text-muted)]">
            No items in current stream. Check back after next 8h sync.
          </div>
        ) : (
          <div className="divide-y divide-[var(--ps-border)]/50">
            {items.map((skill, i) => {
              const catLabel =
                CATEGORY_LABEL[skill.category]?.[lang === "zh" ? "zh" : "en"] ||
                skill.category;

              // Rank color styling
              const rankColor =
                i === 0
                  ? "text-[var(--ps-neon-amber)] font-extrabold bg-[var(--ps-neon-amber)]/10 border-[var(--ps-neon-amber)]/30"
                  : i === 1
                  ? "text-emerald-400 font-bold bg-emerald-400/10 border-emerald-400/30"
                  : i === 2
                  ? "text-[var(--ps-neon-cyan)] font-bold bg-[var(--ps-neon-cyan)]/10 border-[var(--ps-neon-cyan)]/30"
                  : "text-[var(--ps-text-muted)] border-transparent";

              return (
                <div
                  key={skill.id}
                  onClick={() => onShowDetail?.(skill)}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer group transition-all duration-200 hover:bg-[var(--ps-bg-card-hover)]"
                >
                  {/* Rank Badge */}
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 border ${rankColor}`}
                  >
                    {i + 1}
                  </span>

                  {/* Author Avatar */}
                  <img
                    src={skill.author_avatar_url}
                    alt={skill.author_name}
                    loading="lazy"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full shrink-0 border border-[var(--ps-border)] object-cover"
                  />

                  {/* Name + Author + Dynamic Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(skill.repo_url, "_blank", "noopener");
                        }}
                        className="font-bold text-sm truncate text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors cursor-pointer flex items-center gap-1"
                        title={skill.repo_full_name}
                      >
                        <span>{skill.repo_name}</span>
                        <RiExternalLinkLine className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </span>

                      {/* Freshness / Stream-specific Badge */}
                      {activeTab === "new" ? (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <RiFlashlightLine className="w-2.5 h-2.5" />
                          NEW
                        </span>
                      ) : activeTab === "trending" ? (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                          <RiFireLine className="w-2.5 h-2.5" />
                          RISING
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-0.5">
                          <RiStarFill className="w-2.5 h-2.5" />
                          TOP
                        </span>
                      )}

                      {/* Category Tag */}
                      <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded border border-[var(--ps-border)] bg-[var(--ps-bg-elevated)] text-[var(--ps-text-secondary)] font-medium shrink-0">
                        {catLabel}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      className="text-xs text-[var(--ps-text-secondary)] truncate mt-0.5 max-w-xl"
                      title={skill.description}
                    >
                      {skill.description || `by @${skill.author_name}`}
                    </p>
                  </div>

                  {/* Quality Score Indicator */}
                  <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-[var(--ps-neon-green)] shrink-0 px-2 py-1 rounded bg-[var(--ps-neon-green)]/5 border border-[var(--ps-neon-green)]/20">
                    <span className="text-[9px] text-[var(--ps-text-muted)] font-sans">
                      Score
                    </span>
                    <span className="font-bold">
                      {Math.round(skill.score || skill.quality_score || 0)}
                    </span>
                  </div>

                  {/* Star Count */}
                  <div className="flex items-center gap-1 text-xs w-16 justify-end shrink-0 font-mono text-[var(--ps-text-secondary)]">
                    <RiStarFill className="w-3.5 h-3.5 text-[var(--ps-neon-amber)]" />
                    <span>{formatStars(skill.stars)}</span>
                  </div>

                  {/* Freshness Timestamp */}
                  <div className="text-xs w-16 text-right hidden sm:flex items-center justify-end gap-1 shrink-0 text-[var(--ps-text-muted)]">
                    <RiTimeLine className="w-3 h-3 shrink-0" />
                    <span>
                      {timeAgo(
                        activeTab === "new"
                          ? skill.first_seen || skill.created_at
                          : skill.last_commit_at || skill.first_seen
                      )}
                    </span>
                  </div>

                  {/* Hover Arrow */}
                  <RiArrowRightSLine className="w-4 h-4 shrink-0 text-[var(--ps-text-muted)] group-hover:text-[var(--ps-neon-cyan)] group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA to Explorer */}
        <div className="p-3 border-t border-[var(--ps-border)]/60 bg-[var(--ps-bg-card)]/50 flex items-center justify-between">
          <span className="text-xs text-[var(--ps-text-muted)] ml-2">
            {lang === "zh"
              ? "共抓取收录 11,700+ 个项目，每 8 小时增量清洗入库"
              : "11,700+ skills crawled & verified, continuously refreshed"}
          </span>
          <button
            onClick={handleExploreMore}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--ps-neon-cyan)] hover:underline px-3 py-1.5 rounded-lg hover:bg-[var(--ps-neon-cyan)]/10 transition-colors cursor-pointer"
          >
            <span>{t("dataStream.viewAllInExplore")}</span>
            <RiArrowRightLine className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
}
