import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, Star } from "lucide-react";
import { fetchQuickSearch } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { useRecentSearches } from "../hooks/useRecentSearches";
import type { Skill } from "../types/skill";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const HOT_KEYWORDS = ["mcp-server", "claude", "agent", "codex", "python", "typescript"];

export function SearchBar({ value, onChange }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { searches: recentSearches, addSearch, clearSearches } = useRecentSearches();
  const [local, setLocal] = useState(value);
  const [results, setResults] = useState<Skill[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => () => {
    clearTimeout(timer.current);
    clearTimeout(searchTimer.current);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doQuickSearch = useCallback((query: string) => {
    clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(() => {
      fetchQuickSearch(query, 6)
        .then((items) => {
          setResults(items);
          setSearching(false);
        })
        .catch(() => {
          setSearching(false);
        });
    }, 200);
  }, []);

  const handleChange = (v: string) => {
    setLocal(v);
    setActiveIdx(-1);
    setShowDropdown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 400);
    doQuickSearch(v);
  };

  const handleClear = () => {
    setLocal("");
    setResults([]);
    setShowDropdown(false);
    clearTimeout(timer.current);
    onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) {
      if (e.key === "Enter") {
        setShowDropdown(false);
        if (local.trim()) addSearch(local.trim());
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIdx((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIdx((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIdx >= 0 && activeIdx < results.length) {
          navigate(`/skill/${results[activeIdx].repo_full_name}`);
          setShowDropdown(false);
          addSearch(results[activeIdx].repo_name);
        } else {
          setShowDropdown(false);
          if (local.trim()) addSearch(local.trim());
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
    }
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleHotKeyword = (keyword: string) => {
    setLocal(keyword);
    onChange(keyword);
    doQuickSearch(keyword);
    setShowDropdown(true);
    addSearch(keyword);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10"
        style={{ color: 'var(--ps-text-muted)' }}
      />
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={t("explore.search")}
        aria-label="Search skills"
        className="ps-input"
        style={{ paddingLeft: '40px', paddingRight: '36px' }}
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer z-10 transition-colors"
          style={{ color: 'var(--ps-text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-muted)'}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 ps-card overflow-hidden z-[100]"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 240, 255, 0.08)',
            background: 'var(--ps-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Recent searches when empty */}
          {!local.trim() && recentSearches.length > 0 && (
            <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--ps-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--ps-text-muted)' }}>{t("search.recent")}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSearches();
                  }}
                  className="text-[10px] transition-colors cursor-pointer"
                  style={{ color: 'var(--ps-text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-pink)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-muted)'}
                >
                  {t("search.clearRecent")}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleHotKeyword(query)}
                    className="ps-badge cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hot keywords when empty */}
          {!local.trim() && (
            <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--ps-border)' }}>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--ps-text-muted)' }}>{t("search.hotKeywords")}</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {HOT_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleHotKeyword(kw)}
                    className="ps-badge cursor-pointer transition-all"
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ps-neon-cyan)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(0,240,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {searching && local.trim() && (
            <div className="px-3 py-4 text-center">
              <div className="w-4 h-4 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--ps-neon-cyan)', borderTopColor: 'transparent' }} />
            </div>
          )}

          {/* Results */}
          {!searching && results.length > 0 && (
            <div className="max-h-72 overflow-y-auto">
              {results.map((skill, i) => (
                <div
                  key={skill.id}
                  onClick={() => {
                    navigate(`/skill/${skill.repo_full_name}`);
                    setShowDropdown(false);
                    addSearch(skill.repo_name);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: i === activeIdx ? 'rgba(0, 240, 255, 0.06)' : 'transparent',
                  }}
                >
                  <img src={skill.author_avatar_url} alt="" width={28} height={28} className="w-7 h-7 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--ps-text-primary)' }}>
                        {skill.repo_name}
                      </span>
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--ps-text-muted)' }}>
                        {skill.author_name}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--ps-text-secondary)' }}>{skill.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--ps-text-secondary)' }}>
                      <Star className="w-3 h-3" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
                      {skill.stars.toLocaleString()}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${skill.score >= 70 ? "ps-badge-new" :
                      skill.score >= 40 ? "ps-badge" :
                        "ps-badge-purple"
                      }`}>
                      {skill.score.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!searching && local.trim() && results.length === 0 && (
            <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--ps-text-muted)' }}>
              {t("explore.noResults")}
            </div>
          )}

          {/* Keyboard hint */}
          {results.length > 0 && (
            <div className="px-3 py-1.5 flex items-center gap-3 text-[10px]" style={{ borderTop: '1px solid var(--ps-border)', background: 'var(--ps-bg-elevated)', color: 'var(--ps-text-muted)' }}>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--ps-bg-card)', border: '1px solid var(--ps-border)' }}>↑↓</kbd>
                {t("search.navigate")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--ps-bg-card)', border: '1px solid var(--ps-border)' }}>Enter</kbd>
                {t("search.select")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--ps-bg-card)', border: '1px solid var(--ps-border)' }}>Esc</kbd>
                {t("search.close")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
