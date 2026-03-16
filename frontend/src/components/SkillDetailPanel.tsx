import { useEffect, useState } from "react";
import { X, Star, GitFork, AlertCircle, Tag, Github } from "lucide-react";
import { fetchSkillDetail } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill, SkillDetail } from "../types/skill";
import { QualityRadar } from "./QualityRadar";
import { ScoreBadge } from "./ScoreBadge";
import { ProjectTypeBadge } from "./ProjectTypeBadge";
import { PlatformBadges } from "./PlatformBadges";
import { SizeBadge } from "./SizeBadge";

interface Props {
  skill: Skill;
  onClose: () => void;
  onNavigateSkill?: (skillId: number) => void;
}

export function SkillDetailPanel({ skill, onClose, onNavigateSkill }: Props) {
  const { t } = useI18n();
  const [detail, setDetail] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSkillDetail(skill.id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [skill.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const data = detail ?? skill;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 md:inset-auto md:top-0 md:right-0 md:h-full md:w-full md:max-w-md z-50 animate-slide-in overflow-y-auto"
        style={{ background: 'var(--ps-bg-base)', borderLeft: '1px solid var(--ps-border)' }}>
        {/* Header */}
        <div className="sticky top-0 px-5 py-4 flex items-center gap-3 z-10 backdrop-blur-xl"
          style={{ background: 'rgba(10, 14, 26, 0.9)', borderBottom: '1px solid var(--ps-border)' }}>
          <ScoreBadge score={data.score} size="sm" />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate" style={{ color: 'var(--ps-text-primary)' }}>{data.repo_name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <img src={data.author_avatar_url} alt="" className="w-4 h-4 rounded-full" />
              <span className="text-xs" style={{ color: 'var(--ps-text-secondary)' }}>{data.author_name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer"
            style={{ color: 'var(--ps-text-muted)', background: 'var(--ps-bg-elevated)', border: '1px solid var(--ps-border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ps-border-glow)'; e.currentTarget.style.color = 'var(--ps-neon-cyan)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ps-border)'; e.currentTarget.style.color = 'var(--ps-text-muted)'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Description */}
          {data.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ps-text-secondary)' }}>{data.description}</p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            <span className="ps-badge-purple">{data.category}</span>
            <ProjectTypeBadge type={data.project_type} />
            {data.language && <span className="ps-badge">{data.language}</span>}
            {data.size_category && data.size_category !== "unknown" && (
              <SizeBadge sizeCategory={data.size_category} sizeKb={data.repo_size_kb} />
            )}
          </div>

          {/* Platforms */}
          {data.platforms && data.platforms !== "[]" && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--ps-neon-cyan)' }}>
                {t("explore.platform")}
              </h4>
              <PlatformBadges platforms={data.platforms} max={8} />
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: t("detail.stars"), value: data.stars.toLocaleString(), Icon: Star },
              { label: t("detail.forks"), value: data.forks.toLocaleString(), Icon: GitFork },
              { label: t("detail.issues"), value: data.open_issues.toLocaleString(), Icon: AlertCircle },
              { label: t("detail.tokens"), value: data.estimated_tokens > 0 ? `~${(data.estimated_tokens / 1000).toFixed(0)}k` : "-", Icon: Tag },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--ps-bg-elevated)' }}>
                <stat.Icon className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--ps-text-muted)' }} />
                <div className="text-sm font-bold" style={{ color: 'var(--ps-text-primary)' }}>{stat.value}</div>
                <div className="text-[10px]" style={{ color: 'var(--ps-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quality Radar */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--ps-neon-cyan)' }}>
              {t("detail.qualityAnalysis")}
            </h4>
            <div className="rounded-xl p-4 flex justify-center" style={{ background: 'var(--ps-bg-elevated)' }}>
              <QualityRadar
                completeness={data.quality_completeness}
                clarity={data.quality_clarity}
                specificity={data.quality_specificity}
                examples={data.quality_examples}
                structure={data.readme_structure_score}
                agentReadiness={data.quality_agent_readiness}
                size="md"
              />
            </div>
          </div>

          {/* Quality Score Breakdown */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--ps-neon-cyan)' }}>
              {t("detail.scoreBreakdown")}
            </h4>
            <div className="space-y-2">
              {[
                { label: t("detail.completeness"), value: data.quality_completeness },
                { label: t("detail.clarity"), value: data.quality_clarity },
                { label: t("detail.specificity"), value: data.quality_specificity },
                { label: t("detail.examples"), value: data.quality_examples },
                { label: t("detail.structure"), value: data.readme_structure_score },
                { label: t("detail.agentReadiness"), value: data.quality_agent_readiness },
              ].map((dim) => (
                <div key={dim.label} className="flex items-center gap-3">
                  <span className="text-xs w-28" style={{ color: 'var(--ps-text-secondary)' }}>{dim.label}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--ps-bg-elevated)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(dim.value ?? 0) * 100}%`, background: 'var(--ps-gradient-neon)' }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--ps-text-primary)' }}>
                    {((dim.value ?? 0) * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compatible Skills */}
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--ps-neon-cyan)', borderTopColor: 'transparent' }} />
              <p className="text-xs mt-2" style={{ color: 'var(--ps-text-muted)' }}>{t("detail.loading")}</p>
            </div>
          ) : detail?.compatible_skills && detail.compatible_skills.length > 0 ? (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--ps-neon-cyan)' }}>
                {t("detail.compatibleSkills")}
              </h4>
              <div className="space-y-2">
                {detail.compatible_skills.map((cs) => (
                  <div
                    key={cs.skill_id}
                    onClick={() => onNavigateSkill?.(cs.skill_id)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${onNavigateSkill ? "cursor-pointer" : ""
                      }`}
                    style={{ background: 'var(--ps-bg-elevated)' }}
                    onMouseEnter={(e) => { if (onNavigateSkill) e.currentTarget.style.background = 'rgba(0, 240, 255, 0.06)'; }}
                    onMouseLeave={(e) => { if (onNavigateSkill) e.currentTarget.style.background = 'var(--ps-bg-elevated)'; }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--ps-neon-cyan)', border: '1px solid var(--ps-border-glow)' }}>
                      {cs.skill_score.toFixed(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate" style={{ color: 'var(--ps-text-primary)' }}>
                        {cs.skill_name}
                      </span>
                      <span className="text-xs block truncate" style={{ color: 'var(--ps-text-muted)' }}>{cs.reason}</span>
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--ps-neon-green)' }}>
                      {(cs.compatibility_score * 100).toFixed(0)}% {t("detail.match")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* GitHub Button */}
          <a
            href={data.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ps-btn ps-btn-primary w-full justify-center py-3 text-sm font-medium"
          >
            <Github className="w-5 h-5" />
            {t("detail.viewOnGitHub")}
          </a>
        </div>
      </div>
    </>
  );
}
