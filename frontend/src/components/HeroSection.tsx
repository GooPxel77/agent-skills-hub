import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Star, Zap, Server, ShieldCheck } from "lucide-react";
import { fetchQuickSearch } from "../api/client";
import type { Skill } from "../types/skill";

interface Props {
  stats: any; // Kept for compatibility but unused
  onSearch: (query: string) => void;
}

export function HeroSection({ onSearch }: Props) {
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

  return (
    <section className="hero-gradient -mx-4 px-4 pt-10 pb-12 sm:pt-16 sm:pb-16 mb-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255,255,255,0.02), transparent)',
      }} />

      <div className="max-w-4xl mx-auto text-center relative z-[1]">
        {/* Byline pill */}
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[var(--ps-border)] bg-[var(--ps-bg-elevated)] text-xs font-medium text-[var(--ps-text-secondary)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--ps-neon-cyan)]" />
          <span>Curated by postsoma-2050 · Auto-synced every 8 hours</span>
        </div>

        {/* Main headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-[var(--ps-text-primary)]">
          My AI Agent Skills Hub
        </h2>
        
        <p className="text-base sm:text-lg mb-8 max-w-2xl mx-auto text-[var(--ps-text-secondary)] leading-relaxed">
          A personal AI agent skills library curated by postsoma-2050.
          Automatically collecting, classifying, and scoring AI skills, MCP servers,
          agent tools, and automation scripts for fast discovery and reuse.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={() => onSearch("")}
            className="px-6 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--cta-bg)', color: 'var(--cta-text)' }}
          >
            Explore Skills
          </button>
          <a
            href="#scenarios"
            className="px-6 py-3 rounded-full border font-medium transition-colors"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}
          >
            View Workflows
          </a>
        </div>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-16" ref={containerRef}>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 text-[var(--ps-text-muted)]"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (query.trim() || results.length > 0) setShowDropdown(true); }}
            placeholder="Search MCP servers, Claude skills, Codex skills, agent tools..."
            aria-label="Search skills"
            className="ps-input pl-12 pr-12 py-4 text-base rounded-2xl shadow-sm"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer z-10 text-[var(--ps-text-muted)] hover:text-[var(--ps-neon-cyan)] transition-colors"
              aria-label="Clear"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (query.trim() || results.length > 0) && (
            <div
              className="absolute top-full left-0 right-0 mt-2 ps-card overflow-hidden z-[100] text-left shadow-lg"
            >
              {searching && (
                <div className="px-4 py-4 text-center">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto border-[var(--ps-neon-cyan)] border-t-transparent" />
                </div>
              )}
              {!searching && results.length > 0 && (
                <div className="max-h-72 overflow-y-auto">
                  {results.map((skill, i) => (
                    <div
                      key={skill.id}
                      onClick={() => { navigate(`/skill/${skill.repo_full_name}`); setShowDropdown(false); }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i === activeIdx ? 'bg-[rgba(255,255,255,0.05)]' : ''}`}
                    >
                      <img src={skill.author_avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate text-[var(--ps-text-primary)]">{skill.repo_name}</span>
                          <span className="text-xs shrink-0 text-[var(--ps-text-muted)]">{skill.author_name}</span>
                        </div>
                        <p className="text-xs truncate text-[var(--ps-text-secondary)]">{skill.description}</p>
                      </div>
                      <span className="text-xs flex items-center gap-0.5 shrink-0 text-[var(--ps-text-secondary)]">
                        <Star className="w-3.5 h-3.5 text-[var(--ps-neon-amber)] fill-[var(--ps-neon-amber)]" />
                        {skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1)}k` : skill.stars.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!searching && query.trim() && results.length === 0 && (
                <div className="px-4 py-4 text-center text-sm text-[var(--ps-text-muted)]">
                  No skills found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          <div className="p-5 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-[var(--ps-text-primary)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ps-text-primary)] mb-2">Auto-collected</h3>
            <p className="text-sm text-[var(--ps-text-secondary)] leading-relaxed">
              Automatically collects skills, MCP servers, agent tools, and automation scripts
              from GitHub and the open-source AI agent ecosystem.
            </p>
          </div>
          
          <div className="p-5 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-[var(--ps-text-primary)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ps-text-primary)] mb-2">Classified & Scored</h3>
            <p className="text-sm text-[var(--ps-text-secondary)] leading-relaxed">
              Organizes each item by type, platform, use case, freshness, popularity, and
              reuse potential.
            </p>
          </div>

          <div className="p-5 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
              <Server className="w-5 h-5 text-[var(--ps-text-primary)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ps-text-primary)] mb-2">Reusable Workflows</h3>
            <p className="text-sm text-[var(--ps-text-secondary)] leading-relaxed">
              Turns individual skills into reusable workflows for content creation, research,
              developer productivity, and automation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
