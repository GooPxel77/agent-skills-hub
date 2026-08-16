import {
  RiGlobalLine,
  RiGitForkLine,
  RiStore2Line,
  RiExternalLinkLine,
  RiCompass3Line,
  RiArrowRightUpLine,
} from "@remixicon/react";
import { useI18n } from "../i18n/I18nContext";
import { platforms, type Platform } from "../data/platforms";

function getPlatformIcon(icon: Platform["icon"]) {
  switch (icon) {
    case "globe":
      return RiGlobalLine;
    case "github":
      return RiGitForkLine;
    case "store":
      return RiStore2Line;
    default:
      return RiGlobalLine;
  }
}

export function PlatformRecommendations() {
  const { t, lang } = useI18n();

  return (
    <section id="discover" className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] flex items-center justify-center border border-[var(--ps-neon-cyan)]/20">
              <RiCompass3Line className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ps-text-primary)]">
              {t("platforms.title")}
            </h2>
          </div>
          <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 ml-8">
            {t("platforms.subtitle")}
          </p>
        </div>

        <span className="text-xs text-[var(--ps-text-muted)] font-mono self-start sm:self-auto">
          3 Verified Ecosystem Hubs
        </span>
      </div>

      {/* 3-Column Balanced Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        {platforms.map((p) => {
          const Icon = getPlatformIcon(p.icon);

          return (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-neon-cyan)]/40 hover:bg-[var(--ps-bg-card-hover)] transition-all duration-300 flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Card Top: Icon + Title + Tag */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors truncate">
                        {p.name}
                      </h3>
                      <span className="inline-block text-[10px] font-mono text-[var(--ps-neon-purple)] font-medium">
                        {lang === "zh" ? p.tag_zh : p.tag_en}
                      </span>
                    </div>
                  </div>

                  <RiArrowRightUpLine className="w-4 h-4 text-[var(--ps-text-muted)] group-hover:text-[var(--ps-neon-cyan)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--ps-text-secondary)] leading-relaxed line-clamp-3 mb-4">
                  {lang === "zh" ? p.description_zh : p.description_en}
                </p>
              </div>

              {/* Card Footer: Visit Link */}
              <div className="pt-3 border-t border-[var(--ps-border)]/50 flex items-center justify-between text-xs text-[var(--ps-text-muted)] group-hover:text-[var(--ps-neon-cyan)] transition-colors">
                <span className="font-mono text-[11px]">
                  {new URL(p.url).hostname}
                </span>
                <span className="flex items-center gap-1 font-semibold text-xs">
                  <span>{t("platforms.visit")}</span>
                  <RiExternalLinkLine className="w-3 h-3" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
