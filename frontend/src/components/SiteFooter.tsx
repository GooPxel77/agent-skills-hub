import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Heart } from "lucide-react";
import { CrayfishIcon } from "./icons/CrayfishIcon";
import { useI18n } from "../i18n/I18nContext";

export function SiteFooter() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSection = (id: string) => {
    const isHome = location.pathname === "/" || location.pathname === "";
    const isOverview = !new URLSearchParams(location.search).get("tab") || new URLSearchParams(location.search).get("tab") === "overview";

    if (isHome && isOverview) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("animate-glow-pulse");
        setTimeout(() => el.classList.remove("animate-glow-pulse"), 2000);
        return;
      }
    }

    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("animate-glow-pulse");
        setTimeout(() => el.classList.remove("animate-glow-pulse"), 2000);
      }
    }, 300);
  };

  return (
    <footer className="mt-12" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
      {/* Top neon divider */}
      <div className="ps-divider" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <CrayfishIcon className="w-6 h-6" style={{ color: 'var(--ps-neon-cyan)' }} />
              <span className="font-bold text-sm ps-neon-text">My Skills Hub</span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ps-text-muted)' }}>
              Built and maintained by postsoma-2050.<br />
              Data sourced from GitHub and the open-source AI agent ecosystem.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ps-neon-cyan)' }}>
              {lang === "zh" ? "导航" : "Navigation"}
            </h4>
            <ul className="space-y-2">
              {[
                { id: "picks", zh: "本周推荐", en: "Picks" },
                { id: "scenarios", zh: "工作流", en: "Workflows" },
                { id: "add-skill", zh: "添加技能", en: "Add a Skill" },
              ].map((sec) => (
                <li key={sec.id}>
                  <button
                    onClick={() => navigateToSection(sec.id)}
                    className="text-sm transition-colors cursor-pointer"
                    style={{ color: 'var(--ps-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-secondary)'}
                  >
                    {lang === "zh" ? sec.zh : sec.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ps-neon-cyan)' }}>
              {lang === "zh" ? "快捷" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/?tab=explore" className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: 'var(--ps-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-secondary)'}
                >
                  <Search className="w-3.5 h-3.5" />
                  {t("tab.explore")}
                </Link>
              </li>
              <li>
                <Link to="/?tab=favorites" className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: 'var(--ps-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-secondary)'}
                >
                  <Heart className="w-3.5 h-3.5" />
                  {t("tab.favorites") || "My Favorites"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="ps-divider" />
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: 'var(--ps-text-muted)' }}>
        <span>
          &copy; {new Date().getFullYear()} My Skills Hub
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--ps-neon-green)' }} />
          Auto-updated every 8 hours.
        </span>
      </div>
    </footer>
  );
}
