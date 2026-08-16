import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSearch2Line,
  RiCloseLine,
  RiStarFill,
  RiSparklingLine,
  RiCompass3Line,
  RiShieldCheckLine,
  RiTerminalBoxLine,
} from "@remixicon/react";
import { fetchQuickSearch } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill, Stats } from "../types/skill";

interface Props {
  stats?: Stats | null;
  onSearch: (query: string) => void;
}

export function HeroSection({ stats, onSearch }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Skill[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback((q: string) => {
    clearTimeout(searchTimer.current);
    if (!q.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(() => {
      fetchQuickSearch(q, 6)
        .then((items) => {
          setResults(items);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 200);
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    setActiveIdx(-1);
    setShowDropdown(true);
    doSearch(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < results.length) {
        navigate(`/skill/${results[activeIdx].repo_full_name}`);
        setShowDropdown(false);
      } else if (query.trim()) {
        onSearch(query);
        setShowDropdown(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => Math.max(p - 1, -1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const quickTags = [
    { label: "MCP Server", query: "mcp" },
    { label: "Claude Skill", query: "claude-skill" },
    { label: "Cursor Rules", query: "cursor" },
    { label: "Browser Agent", query: "browser" },
    { label: "Code Gen", query: "code" },
  ];

  return (
    <section className="hero-gradient -mx-4 px-4 pt-6 pb-8 sm:pt-10 sm:pb-10 mb-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(56,189,248,0.03), transparent)",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-[1]">
        {/* Byline pill: minimal and dynamic */}
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 mb-4 rounded-full border border-[var(--ps-border)] bg-[var(--ps-bg-elevated)] text-xs font-medium text-[var(--ps-text-secondary)] shadow-sm">
          <RiSparklingLine className="w-3.5 h-3.5 text-[var(--ps-neon-cyan)] animate-pulse" />
          <span>
            {stats?.total_skills
              ? `${stats.total_skills.toLocaleString()} ${t("hero.badgeSkills")}`
              : t("hero.badgeDefault")}
            {" · "}
            {t("hero.autoSync")}
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-[var(--ps-text-primary)]">
          {t("hero.title")}
        </h1>

        {/* Single-sentence subtitle */}
        <p className="text-sm sm:text-base mb-6 max-w-2xl mx-auto text-[var(--ps-text-secondary)] leading-relaxed">
          {t("hero.subtitleSingle")}
        </p>

        {/* Search Bar - Positioned right below subtitle */}
        <div className="relative max-w-2xl mx-auto mb-4" ref={containerRef}>
          <RiSearch2Line className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 text-[var(--ps-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim() || results.length > 0) setShowDropdown(true);
            }}
            placeholder={t("hero.searchPlaceholder")}
            aria-label="Search skills"
            className="w-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--ps-text-primary)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--ps-neon-cyan)]/50 focus:bg-[rgba(255,255,255,0.05)] focus:ring-2 focus:ring-[var(--ps-neon-cyan)]/15 transition-all duration-300 outline-none rounded-2xl text-sm sm:text-base shadow-sm"
            style={{ paddingLeft: "48px", paddingRight: "48px", height: "52px" }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer z-10 text-[var(--ps-text-muted)] hover:text-[var(--ps-neon-cyan)] transition-colors"
              aria-label="Clear"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}

          {/* Quick Search Dropdown */}
          {showDropdown && (query.trim() || results.length > 0) && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[rgba(255,255,255,0.1)] overflow-hidden z-[100] text-left shadow-2xl"
              style={{
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.05)",
                background: "rgba(15, 17, 21, 0.96)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {searching && (
                <div className="px-4 py-4 text-center">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto border-[var(--ps-neon-cyan)] border-t-transparent" />
                </div>
              )}
              {!searching && results.length > 0 && (
                <div className="max-h-72 overflow-y-auto">
                  {results.map((skill, i) => {
                    const isHighValue = skill.stars >= 200 || skill.score >= 80;
                    const isVerified = skill.quality_score >= 70;
                    return (
                      <div
                        key={skill.id}
                        onClick={() => {
                          navigate(`/skill/${skill.repo_full_name}`);
                          setShowDropdown(false);
                        }}
                        onMouseEnter={() => setActiveIdx(i)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(56,189,248,0.06)]"
                        style={{
                          background: i === activeIdx ? "rgba(56, 189, 248, 0.06)" : "transparent",
                        }}
                      >
                        <img
                          src={skill.author_avatar_url}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full shrink-0 border border-[rgba(255,255,255,0.1)]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate text-[var(--ps-text-primary)]">
                              {skill.repo_name}
                            </span>
                            <span className="text-xs shrink-0 text-[var(--ps-text-muted)]">
                              {skill.author_name}
                            </span>
                          </div>
                          <p className="text-xs truncate text-[var(--ps-text-secondary)]">
                            {skill.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs flex items-center gap-0.5 text-[var(--ps-text-secondary)]">
                            <RiStarFill className="w-3.5 h-3.5 text-[var(--ps-neon-amber)]" />
                            {skill.stars >= 1000
                              ? `${(skill.stars / 1000).toFixed(1)}k`
                              : skill.stars.toLocaleString()}
                          </span>
                          {isHighValue ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--ps-neon-amber)]/30 text-[var(--ps-neon-amber)] bg-[var(--ps-neon-amber)]/10 shrink-0 font-medium">
                              High Value
                            </span>
                          ) : isVerified ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--ps-neon-green)]/30 text-[var(--ps-neon-green)] bg-[var(--ps-neon-green)]/10 shrink-0 font-medium">
                              Verified
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!searching && query.trim() && results.length === 0 && (
                <div className="px-4 py-4 text-center text-sm text-[var(--ps-text-muted)]">
                  No skills found. Press Enter to search explore tab.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick search suggestion tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs">
          <span className="text-[var(--ps-text-muted)] font-medium">{t("hero.trending")}:</span>
          {quickTags.map((tag) => (
            <button
              key={tag.query}
              onClick={() => onSearch(tag.query)}
              className="px-2.5 py-1 rounded-full border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-neon-cyan)]/40 hover:text-[var(--ps-neon-cyan)] text-[var(--ps-text-secondary)] transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* 3-Step Quick Guide */}
        <div className="pt-5 border-t border-[var(--ps-border)]/60 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {/* Step 1 */}
            <div className="group p-3.5 rounded-xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-neon-cyan)]/50 hover:bg-[var(--ps-bg-card-hover)] transition-all duration-300 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/25 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <RiCompass3Line className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[var(--ps-neon-cyan)] px-1 rounded bg-[var(--ps-neon-cyan)]/10">
                    01
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-[var(--ps-text-primary)]">
                    {t("hero.step1Title")}
                  </h3>
                </div>
                <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 leading-snug">
                  {t("hero.step1Desc")}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group p-3.5 rounded-xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-neon-purple)]/50 hover:bg-[var(--ps-bg-card-hover)] transition-all duration-300 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[var(--ps-neon-purple)]/10 text-[var(--ps-neon-purple)] border border-[var(--ps-neon-purple)]/25 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <RiShieldCheckLine className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[var(--ps-neon-purple)] px-1 rounded bg-[var(--ps-neon-purple)]/10">
                    02
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-[var(--ps-text-primary)]">
                    {t("hero.step2Title")}
                  </h3>
                </div>
                <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 leading-snug">
                  {t("hero.step2Desc")}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group p-3.5 rounded-xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-neon-green)]/50 hover:bg-[var(--ps-bg-card-hover)] transition-all duration-300 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[var(--ps-neon-green)]/10 text-[var(--ps-neon-green)] border border-[var(--ps-neon-green)]/25 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <RiTerminalBoxLine className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[var(--ps-neon-green)] px-1 rounded bg-[var(--ps-neon-green)]/10">
                    03
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-[var(--ps-text-primary)]">
                    {t("hero.step3Title")}
                  </h3>
                </div>
                <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 leading-snug">
                  {t("hero.step3Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
