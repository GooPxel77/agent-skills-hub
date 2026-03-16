import { memo, useState } from "react";
import { Star, GitFork, ChevronUp, Copy, Check } from "lucide-react";
import type { Skill } from "../types/skill";
import { isNew, isRecentlyUpdated, parseTags, timeAgo } from "../utils/time";
import { CompareButton } from "./CompareButton";
import { FavoriteButton } from "./FavoriteButton";
import { getInstallCommands } from "./InstallCommand";
import { PlatformBadges } from "./PlatformBadges";
import { QualityBadge, ScoreBadge } from "./ScoreBadge";
import { SizeBadge } from "./SizeBadge";

interface Props {
  skill: Skill;
  onSelect?: (skill: Skill) => void;
  onShowDetail?: (skill: Skill) => void;
}

export const SkillCard = memo(function SkillCard({ skill, onSelect: _onSelect, onShowDetail }: Props) {
  const tags = parseTags(skill.topics).slice(0, 3);
  const [installCopied, setInstallCopied] = useState(false);

  const handleCopyInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const commands = getInstallCommands(skill);
      const primary = commands.find((c) => c.primary) || commands[0];
      await navigator.clipboard.writeText(primary.command);
      setInstallCopied(true);
      setTimeout(() => setInstallCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  const skillIsNew = isNew(skill.first_seen);
  const recentlyUpdated = isRecentlyUpdated(skill.last_commit_at);

  return (
    <div
      onClick={() => onShowDetail?.(skill)}
      className="ps-card p-4 cursor-pointer group"
    >
      {/* Top: Score + Author + Name */}
      <div className="flex items-start gap-3">
        <ScoreBadge score={skill.score} showTier />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={16} height={16} className="w-4 h-4 rounded-full" />
            <span className="text-xs truncate" style={{ color: 'var(--ps-text-muted)' }}>{skill.author_name}</span>
            {/* Badges: Quality + HOT + NEW */}
            <span className="ml-auto flex items-center gap-1 shrink-0">
              {skill.quality_score > 0 && <QualityBadge score={skill.quality_score} />}
              {skill.star_momentum >= 0.05 && (
                <span className="ps-badge-hot" style={{ fontSize: '9px', fontWeight: 700 }}>
                  HOT
                </span>
              )}
              {skillIsNew && (
                <span className="ps-badge-new" style={{ fontSize: '9px', fontWeight: 700 }}>
                  NEW
                </span>
              )}
            </span>
          </div>
          <h3
            onClick={(e) => {
              e.stopPropagation();
              window.open(skill.repo_url, "_blank", "noopener");
            }}
            className="font-semibold text-sm truncate transition-colors"
            style={{ color: 'var(--ps-text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
          >
            {skill.repo_name}
          </h3>
          <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--ps-text-secondary)' }}>
            {skill.description || "No description"}
          </p>
        </div>
      </div>

      {/* Tags row */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        <span className="ps-badge-purple" style={{ fontSize: '10px' }}>
          {skill.category}
        </span>
        {skill.language && (
          <span className="ps-badge" style={{ fontSize: '10px' }}>
            {skill.language}
          </span>
        )}
        {skill.size_category && skill.size_category !== "unknown" && (
          <SizeBadge sizeCategory={skill.size_category} sizeKb={skill.repo_size_kb} />
        )}
        {skill.last_commit_at && (
          <span className={`ps-badge${recentlyUpdated ? '-new' : ''}`} style={{ fontSize: '10px' }}>
            {timeAgo(skill.last_commit_at)}
          </span>
        )}
        {tags.map((tag) => (
          <span key={tag} className="ps-badge" style={{ fontSize: '10px' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Platform badges */}
      {skill.platforms && skill.platforms !== "[]" && (
        <div className="mt-1.5">
          <PlatformBadges platforms={skill.platforms} max={3} />
        </div>
      )}

      {/* Bottom: Stars + Forks + Actions */}
      <div className="mt-2.5 flex items-center gap-3 text-xs" style={{ color: 'var(--ps-text-muted)' }}>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
          {skill.stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {skill.forks.toLocaleString()}
        </span>
        <span className="ml-auto flex items-center gap-1">
          {/* Upvote placeholder */}
          <span className="flex items-center gap-0.5 cursor-not-allowed" style={{ color: 'var(--ps-text-muted)' }} title="Coming soon">
            <ChevronUp className="w-3 h-3" />
          </span>
          {/* Copy install command */}
          <button
            onClick={handleCopyInstall}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer"
            title={installCopied ? "Copied!" : "Copy install command"}
            style={{ color: 'var(--ps-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ps-neon-cyan)'; e.currentTarget.style.background = 'var(--ps-bg-elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ps-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            {installCopied ? (
              <Check className="w-3 h-3" style={{ color: 'var(--ps-neon-green)' }} />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
          <CompareButton skill={skill} size="sm" />
          <FavoriteButton skillId={skill.id} size="sm" />
        </span>
      </div>
    </div>
  );
});
