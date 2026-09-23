import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  RiSearch2Line,
  RiHeartLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiRobot2Line,
} from "@remixicon/react";
import { BrandLogo } from "./icons/BrandLogo";
import { useI18n } from "../i18n/I18nContext";

export function SiteFooter() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSection = (id: string) => {
    const isHome = location.pathname === "/" || location.pathname === "";
    const isOverview =
      !new URLSearchParams(location.search).get("tab") ||
      new URLSearchParams(location.search).get("tab") === "overview";

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
    <footer
      className="mt-12"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {/* Top neon divider */}
      <div className="ps-divider" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <BrandLogo className="w-6 h-6 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span className="font-bold text-sm ps-neon-text">
                Agent Skills Hub
              </span>
            </Link>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--ps-text-muted)" }}
            >
              Automated indexing platform · Maintained by postsoma-2050.
              <br />
              Data sourced from GitHub and open-source AI agent ecosystem.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--ps-neon-cyan)" }}
            >
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
                    style={{ color: "var(--ps-text-secondary)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--ps-text-secondary)")
                    }
                  >
                    {lang === "zh" ? sec.zh : sec.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links column */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--ps-neon-cyan)" }}
            >
              {lang === "zh" ? "快捷链接" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--ps-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ps-text-secondary)")
                  }
                >
                  <RiShieldCheckLine className="w-3.5 h-3.5" />
                  {lang === "zh" ? "关于与 E-E-A-T 规范" : "About & E-E-A-T"}
                </Link>
              </li>
              <li>
                <Link
                  to="/?tab=explore"
                  className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--ps-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ps-text-secondary)")
                  }
                >
                  <RiSearch2Line className="w-3.5 h-3.5" />
                  {t("tab.explore")}
                </Link>
              </li>
              <li>
                <Link
                  to="/?tab=favorites"
                  className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--ps-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ps-text-secondary)")
                  }
                >
                  <RiHeartLine className="w-3.5 h-3.5" />
                  {t("tab.favorites") || "Saved"}
                </Link>
              </li>
            </ul>
          </div>

          {/* GEO & AI Machine Feeds column */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--ps-neon-cyan)" }}
            >
              {lang === "zh" ? "GEO & 机器知识喂料" : "GEO & Machine Feeds"}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--ps-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ps-text-secondary)")
                  }
                >
                  <RiRobot2Line className="w-3.5 h-3.5" />
                  llms.txt (Index Feed)
                </a>
              </li>
              <li>
                <a
                  href="/llms-full.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--ps-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ps-text-secondary)")
                  }
                >
                  <RiFileTextLine className="w-3.5 h-3.5" />
                  llms-full.txt (Manifest)
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors flex items-center gap-1.5"
                  style={{ color: "var(--ps-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ps-neon-cyan)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ps-text-secondary)")
                  }
                >
                  <RiFileTextLine className="w-3.5 h-3.5" />
                  sitemap.xml (Sitemap)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="ps-divider" />
      <div
        className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
        style={{ color: "var(--ps-text-muted)" }}
      >
        <span>
          © {new Date().getFullYear()} Agent Skills Hub · Maintained by
          postsoma-2050
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--ps-neon-green)" }}
          />
          Auto-updated every 8 hours.
        </span>
      </div>
    </footer>
  );
}
