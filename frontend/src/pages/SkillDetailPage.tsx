import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchSkillDetail, fetchSkillBySlug } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { QualityRadar } from "../components/QualityRadar";
import { ProjectTypeBadge } from "../components/ProjectTypeBadge";
import { PlatformBadges } from "../components/PlatformBadges";
import { SizeBadge } from "../components/SizeBadge";
import { explainCompatibility } from "../utils/compatibility";
import { InstallCommand } from "../components/InstallCommand";
import { FavoriteButton } from "../components/FavoriteButton";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import type { SkillDetail } from "../types/skill";

export function SkillDetailPage() {
  const { t, lang } = useI18n();
  const { id, owner, repo } = useParams<{ id?: string; owner?: string; repo?: string }>();
  const [detail, setDetail] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Support both /skill/:id (numeric) and /skill/:owner/:repo (slug)
    let fetchPromise: Promise<SkillDetail>;
    if (owner && repo) {
      fetchPromise = fetchSkillBySlug(`${owner}/${repo}`);
    } else if (id) {
      // Check if id is numeric → fetch by ID, otherwise try as slug
      if (/^\d+$/.test(id)) {
        fetchPromise = fetchSkillDetail(Number(id));
      } else {
        fetchPromise = fetchSkillBySlug(id);
      }
    } else {
      return;
    }

    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);
    fetchPromise
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, owner, repo]);


  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader breadcrumb={[{ label: "..." }]} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--ps-text-muted)] mt-3">{t("detail.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen">
        <SiteHeader breadcrumb={[{ label: "Error" }]} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <svg className="w-12 h-12 text-[var(--ps-text-muted)] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h2 className="text-lg font-medium text-[var(--ps-text-primary)]">{error || "Skill not found"}</h2>
            <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("detail.backToHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ogDescription = detail.description
    ? detail.description.slice(0, 160)
    : `${detail.repo_name} - ${detail.category} skill with ${detail.stars} stars`;

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{`${detail.repo_name} - Agent Skills Hub`}</title>
        <meta name="description" content={ogDescription} />
        {/* Open Graph */}
        <meta property="og:title" content={`${detail.repo_name} | Agent Skills Hub`} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.205055.xyz/skill/${detail.repo_full_name}`} />
        <meta property="og:site_name" content="Agent Skills Hub" />
        <meta property="og:image" content="https://www.205055.xyz/og-image.png" />
        <meta property="og:image:secure_url" content="https://www.205055.xyz/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${detail.repo_name} | Agent Skills Hub`} />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@postsoma-2050" />
        <meta name="twitter:title" content={`${detail.repo_name} | Agent Skills Hub`} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="https://www.205055.xyz/og-image.png" />
        <meta name="twitter:image:alt" content={`${detail.repo_name} | Agent Skills Hub`} />
        {/* Canonical URL */}
        <link rel="canonical" href={`https://www.205055.xyz/skill/${detail.repo_full_name}`} />
      </Helmet>

      {/* Shared Navigation Bar */}
      <SiteHeader breadcrumb={[{ label: detail.repo_name }]} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero Section - Clean Single Column Natural Flow */}
        <div className="bg-[var(--ps-bg-card)] rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] p-6 mb-6">
          {/* Author Row + Favorite CTA */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={detail.author_avatar_url}
                alt={detail.author_name}
                className="w-6 h-6 rounded-full border border-[var(--ps-border)] shrink-0"
              />
              <a
                href={`https://github.com/${detail.author_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--ps-text-secondary)] hover:text-[var(--ps-neon-cyan)] transition-colors truncate"
              >
                {detail.author_name}
              </a>
            </div>
            <div className="shrink-0">
              <FavoriteButton skillId={detail.id} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ps-text-primary)] mb-2">
            {detail.repo_name}
          </h1>

          {/* Description */}
          {detail.description && (
            <p className="text-sm sm:text-base text-[var(--ps-text-secondary)] leading-relaxed mb-4">
              {detail.description}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-2.5 py-1 text-xs rounded-full bg-[rgba(0,240,255,0.08)] text-[var(--ps-neon-cyan)] border border-[rgba(0,240,255,0.25)] font-medium">
              {detail.category}
            </span>
            {detail.project_type !== detail.category && <ProjectTypeBadge type={detail.project_type} />}
            {detail.language && (
              <span className="px-2.5 py-1 text-xs rounded-full bg-[var(--ps-bg-elevated)] text-[var(--ps-text-secondary)] border border-[var(--ps-border)]">
                {detail.language}
              </span>
            )}
            {detail.size_category && detail.size_category !== "unknown" && (
              <SizeBadge sizeCategory={detail.size_category} sizeKb={detail.repo_size_kb} />
            )}
            {detail.license && (
              <span className="px-2.5 py-1 text-xs rounded-full bg-[rgba(34,197,94,0.08)] text-[var(--ps-neon-green)] border border-[rgba(34,197,94,0.25)]">
                {detail.license}
              </span>
            )}
            {detail.platforms && detail.platforms !== "[]" && (
              <PlatformBadges platforms={detail.platforms} max={8} exclude={[detail.language, detail.project_type?.replace(/-skill$/, "")].filter(Boolean)} />
            )}
          </div>

          {/* Primary Action Button (View on GitHub) */}
          <div className="flex items-center gap-3">
            <a
              href={detail.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 ps-btn ps-btn-primary rounded-lg transition-colors font-medium text-sm cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {t("detail.viewOnGitHub")}
            </a>
          </div>

          {/* Quick Install / Git Clone Terminal Box */}
          <InstallCommand skill={detail} />
        </div>

        {/* Stats + Quality Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stats Card */}
          <div className="bg-[var(--ps-bg-card)] rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] p-5">
            <h3 className="text-xs font-medium text-[var(--ps-text-muted)] uppercase tracking-wide mb-4">
              {t("detail.stats")}
            </h3>
            <dl className="divide-y divide-[var(--ps-border)]">
              {[
                { label: t("detail.stars"), value: detail.stars.toLocaleString(), icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "text-amber-400" },
                { label: t("detail.forks"), value: detail.forks.toLocaleString(), icon: "M6 3a3 3 0 00-3 3v2.6a3 3 0 001 2.24V18a3 3 0 003 3h10a3 3 0 003-3v-7.16A3 3 0 0021 8.6V6a3 3 0 00-3-3H6z", color: "text-[var(--ps-text-muted)]" },
                { label: t("detail.issues"), value: detail.open_issues.toLocaleString(), icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-[var(--ps-text-muted)]" },
                { label: t("detail.tokens"), value: detail.estimated_tokens > 0 ? `~${(detail.estimated_tokens / 1000).toFixed(0)}k` : "-", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", color: "text-[var(--ps-text-muted)]" },
                { label: t("detail.commits"), value: detail.total_commits.toLocaleString(), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-[var(--ps-text-muted)]" },
                { label: t("detail.followers"), value: detail.author_followers.toLocaleString(), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-[var(--ps-text-muted)]" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 py-3">
                  <svg className={`w-4 h-4 shrink-0 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                  <dt className="text-sm text-[var(--ps-text-secondary)] flex-1">{stat.label}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-[var(--ps-text-primary)]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Quality Radar Card */}
          <div className="bg-[var(--ps-bg-card)] rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] p-5">
            <h3 className="text-xs font-medium text-[var(--ps-text-muted)] uppercase tracking-wide mb-4">
              {t("detail.qualityAnalysis")}
            </h3>
            <div className="flex justify-center mb-4">
              <QualityRadar
                completeness={detail.quality_completeness}
                clarity={detail.quality_clarity}
                specificity={detail.quality_specificity}
                examples={detail.quality_examples}
                structure={detail.readme_structure_score}
                agentReadiness={detail.quality_agent_readiness}
                size="md"
              />
            </div>
            <div className="space-y-2">
              {[
                { label: t("detail.completeness"), value: detail.quality_completeness },
                { label: t("detail.clarity"), value: detail.quality_clarity },
                { label: t("detail.specificity"), value: detail.quality_specificity },
                { label: t("detail.examples"), value: detail.quality_examples },
                { label: t("detail.structure"), value: detail.readme_structure_score },
                { label: t("detail.agentReadiness"), value: detail.quality_agent_readiness },
              ].map((dim) => (
                <div key={dim.label} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--ps-text-secondary)] w-24">{dim.label}</span>
                  <div className="flex-1 h-1.5 bg-[var(--ps-bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(dim.value ?? 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--ps-text-primary)] w-8 text-right">
                    {((dim.value ?? 0) * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compatible Skills */}
        {detail.compatible_skills && detail.compatible_skills.length > 0 && (
          <div className="bg-[var(--ps-bg-card)] rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] p-5 mb-6">
            <h3 className="text-xs font-medium text-[var(--ps-text-muted)] uppercase tracking-wide mb-4">
              {t("detail.compatibleSkills")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detail.compatible_skills.map((cs) => (
                <Link
                  key={cs.skill_id}
                  to={`/skill/${cs.skill_id}`}
                  className="flex items-center gap-3 p-3 bg-[var(--ps-bg-elevated)] rounded-lg cursor-pointer hover:bg-[rgba(0,240,255,0.04)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {cs.skill_score.toFixed(0)}
                  </div>
                  <div className="w-full flex-1 min-w-0">
                    <span className="text-sm font-medium text-[var(--ps-text-primary)] block truncate">
                      {cs.skill_name}
                    </span>
                    <span className="text-xs text-[var(--ps-text-muted)] block">{explainCompatibility(cs.reason, lang === "zh")}</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                    {lang === "zh" ? "估算 " : "Est. "}{(cs.compatibility_score * 100).toFixed(0)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
