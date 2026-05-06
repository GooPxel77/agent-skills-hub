import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Search, ChevronRight, Heart } from "lucide-react";
import { CrayfishIcon } from "./icons/CrayfishIcon";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "../i18n/I18nContext";
import { useStats } from "../hooks/useStats";
import { timeAgo } from "../utils/time";
interface Props {
  /** Show tab navigation (only on Home page) */
  showTabs?: boolean;
  tab?: "overview" | "explore" | "favorites";
  onTabChange?: (tab: "overview" | "explore" | "favorites") => void;
  /** Breadcrumb items for detail pages */
  breadcrumb?: { label: string }[];
}

export function SiteHeader({ showTabs, tab, onTabChange, breadcrumb }: Props) {
  const { t } = useI18n();
  const { stats } = useStats();
  const subNavRef = useRef<HTMLDivElement>(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });

  // Sub-nav scroll indicator
  useEffect(() => {
    const el = subNavRef.current;
    if (!el) return;
    const check = () => {
      setNavScroll({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [tab]);

  return (
    <header className="sticky top-0 z-10 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0">
            <Link to="/" className="flex items-center gap-2 group">
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--ps-text-primary)' }}>
                <CrayfishIcon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--ps-neon-cyan)' }} />
                <span className="truncate group-hover:opacity-80 transition-opacity ps-neon-text">My Skills Hub</span>
              </h1>
            </Link>
            <p className="text-xs sm:text-sm mt-0.5 hidden sm:block" style={{ color: 'var(--ps-text-secondary)' }}>
              {t("header.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-sm items-center gap-1.5 hidden lg:flex" style={{ color: 'var(--ps-text-muted)' }}>
              {stats?.last_sync_at && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {t("header.lastUpdated")} {timeAgo(stats.last_sync_at)}
                </>
              )}
            </span>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        {/* Tab Navigation or Breadcrumb */}
        {showTabs && onTabChange ? (
          <div className="-mb-3 sm:-mb-4">
            <div className="flex items-center gap-1 pb-0" style={{ borderBottom: '1px solid var(--ps-border)' }}>
              <button
                onClick={() => onTabChange("overview")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === "overview"
                  ? "text-[var(--ps-neon-cyan)]"
                  : "border-transparent hover:opacity-80"
                  }`}
                style={{
                  borderBottomColor: tab === "overview" ? 'var(--ps-neon-cyan)' : 'transparent',
                  color: tab === "overview" ? 'var(--ps-neon-cyan)' : 'var(--ps-text-secondary)',
                }}
              >
                <BarChart3 className="w-4 h-4 inline -mt-0.5 mr-1" />
                {t("tab.overview")}
              </button>
              <button
                onClick={() => onTabChange("explore")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer`}
                style={{
                  borderBottomColor: tab === "explore" ? 'var(--ps-neon-cyan)' : 'transparent',
                  color: tab === "explore" ? 'var(--ps-neon-cyan)' : 'var(--ps-text-secondary)',
                }}
              >
                <Search className="w-4 h-4 inline -mt-0.5 mr-1" />
                {t("tab.explore")}
              </button>
              <button
                onClick={() => onTabChange("favorites")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer`}
                style={{
                  borderBottomColor: tab === "favorites" ? 'var(--ps-neon-cyan)' : 'transparent',
                  color: tab === "favorites" ? 'var(--ps-neon-cyan)' : 'var(--ps-text-secondary)',
                }}
              >
                <Heart className="w-4 h-4 inline -mt-0.5 mr-1" />
                {t("tab.favorites") || "My Favorites"}
              </button>
            </div>
            {/* Section quick navigation (overview tab only) */}
            {tab === "overview" && (
              <div className="relative">
                {navScroll.left && (
                  <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--ps-bg-base), transparent)' }} />
                )}
                <div ref={subNavRef} className="flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-hide">
                  {[
                    { id: "new-this-week", label: "New" },
                    { id: "picks", label: "Picks" },
                    { id: "scenarios", label: "Workflows" },
                    { id: "add-skill", label: "Add Skill" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        const el = document.getElementById(sec.id);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                          el.classList.add("animate-glow-pulse");
                          setTimeout(() => el.classList.remove("animate-glow-pulse"), 2000);
                        }
                      }}
                      className="px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      style={{ color: 'var(--ps-text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ps-neon-cyan)'; e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ps-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
                {navScroll.right && (
                  <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--ps-bg-base), transparent)' }} />
                )}
              </div>
            )}
          </div>
        ) : breadcrumb && breadcrumb.length > 0 ? (
          <div className="flex items-center gap-2 text-sm -mb-3 sm:-mb-4 pb-2" style={{ borderBottom: '1px solid var(--ps-border)' }}>
            <Link to="/" className="transition-colors" style={{ color: 'var(--ps-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-muted)'}
            >
              {t("tab.overview")}
            </Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--ps-text-muted)' }} />
                <span className="font-medium truncate" style={{ color: 'var(--ps-text-primary)' }}>{item.label}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {/* Bottom neon line */}
      <div className="ps-divider" />
    </header>
  );
}
