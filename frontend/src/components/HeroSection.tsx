import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Star } from "lucide-react";
import { CrayfishIcon } from "./icons/CrayfishIcon";
import { fetchQuickSearch } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill, Stats } from "../types/skill";

const TRENDING_TAGS = [
  "mcp-server",
  "claude-skill",
  "langchain",
  "browser-use",
  "coding-agent",
  "openai",
];

interface Props {
  stats: Stats | null;
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
        .then((items) => { setResults(items); setSearching(false); })
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

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
  };

  const totalSkills = stats?.total_skills ?? 17000;
  const countDisplay = `${Math.floor(totalSkills / 1000).toLocaleString()},000+`;

  const mcpCount = stats?.categories.find((c) => c.name === "mcp-server")?.count ?? 6500;
  const claudeCount = stats?.categories.find((c) => c.name === "claude-skill")?.count ?? 2200;
  const agentCount = stats?.categories.find((c) => c.name === "agent-tool")?.count ?? 5000;

  return (
    <section className="hero-gradient -mx-4 px-4 pt-10 pb-8 sm:pt-14 sm:pb-10 mb-6 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(0,240,255,0.07), transparent)',
      }} />

      <div className="max-w-3xl mx-auto text-center relative z-[1]">
        <div className="flex justify-center mb-6">
          <CrayfishIcon className="w-16 h-16 opacity-80" style={{ color: 'var(--ps-neon-cyan)', filter: 'drop-shadow(0 0 12px rgba(125, 211, 252, 0.4))' }} />
        </div>
        {/* Main headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 ps-neon-text">
          {t("hero.title").replace("{count}", countDisplay)}
        </h2>
        <p className="text-base sm:text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--ps-text-secondary)' }}>
          {t("hero.subtitle")}
        </p>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-5" ref={containerRef}>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10"
            style={{ color: 'var(--ps-text-muted)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (query.trim() || results.length > 0) setShowDropdown(true); }}
            placeholder={t("hero.searchPlaceholder")}
            aria-label="Search skills"
            className="ps-input"
            style={{
              paddingLeft: '48px',
              paddingRight: '48px',
              paddingTop: '16px',
              paddingBottom: '16px',
              fontSize: '16px',
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(0, 240, 255, 0.08)',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer z-10 transition-colors"
              style={{ color: 'var(--ps-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-muted)'}
              aria-label="Clear"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (query.trim() || results.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 ps-card overflow-hidden z-50" style={{ boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)' }}>
              {searching && (
                <div className="px-4 py-4 text-center">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--ps-neon-cyan)', borderTopColor: 'transparent' }} />
                </div>
              )}
              {!searching && results.length > 0 && (
                <div className="max-h-72 overflow-y-auto">
                  {results.map((skill, i) => (
                    <div
                      key={skill.id}
                      onClick={() => { navigate(`/skill/${skill.repo_full_name}`); setShowDropdown(false); }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        background: i === activeIdx ? 'rgba(0, 240, 255, 0.06)' : 'transparent',
                      }}
                    >
                      <img src={skill.author_avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate" style={{ color: 'var(--ps-text-primary)' }}>{skill.repo_name}</span>
                          <span className="text-xs shrink-0" style={{ color: 'var(--ps-text-muted)' }}>{skill.author_name}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--ps-text-secondary)' }}>{skill.description}</p>
                      </div>
                      <span className="text-xs flex items-center gap-0.5 shrink-0" style={{ color: 'var(--ps-text-secondary)' }}>
                        <Star className="w-3.5 h-3.5" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
                        {skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1)}k` : skill.stars.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!searching && query.trim() && results.length === 0 && (
                <div className="px-4 py-4 text-center text-sm" style={{ color: 'var(--ps-text-muted)' }}>
                  {t("explore.noResults")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trending tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-xs font-medium" style={{ color: 'var(--ps-text-muted)' }}>{t("hero.trending")}:</span>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="ps-badge cursor-pointer transition-all"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ps-neon-cyan)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(0,240,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Key stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold ps-neon-text">{totalSkills.toLocaleString()}+</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ps-text-muted)' }}>Skills</div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--ps-border)' }} />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ps-neon-purple)' }}>{mcpCount.toLocaleString()}+</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ps-text-muted)' }}>MCP Servers</div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--ps-border)' }} />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ps-neon-cyan)' }}>{claudeCount.toLocaleString()}+</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ps-text-muted)' }}>Claude Skills</div>
          </div>
          <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--ps-border)' }} />
          <div className="text-center hidden sm:block">
            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--ps-neon-green)' }}>{agentCount.toLocaleString()}+</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ps-text-muted)' }}>Agent Tools</div>
          </div>
        </div>
      </div>
    </section>
  );
}
