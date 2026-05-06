import { memo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Skill } from "../types/skill";
import { timeAgo } from "../utils/time";
import { FavoriteButton } from "./FavoriteButton";
import { getInstallCommands } from "./InstallCommand";
import { ScoreBadge } from "./ScoreBadge";

interface Props {
  skill: Skill;
  onSelect?: (skill: Skill) => void;
  onShowDetail?: (skill: Skill) => void;
}

export const SkillCard = memo(function SkillCard({ skill, onSelect: _onSelect, onShowDetail }: Props) {
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

  return (
    <div
      onClick={() => onShowDetail?.(skill)}
      className="group p-5 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Name and Description */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3
            onClick={(e) => {
              e.stopPropagation();
              window.open(skill.repo_url, "_blank", "noopener");
            }}
            className="font-semibold text-base text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors line-clamp-1"
          >
            {skill.repo_name}
          </h3>
        </div>
        <p className="text-sm text-[var(--ps-text-secondary)] line-clamp-2 leading-relaxed">
          {skill.description || "No description provided."}
        </p>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-[var(--ps-text-muted)] mb-4">
        {skill.score > 0 && (
          <ScoreBadge score={skill.score} className="text-xs" />
        )}
        {skill.score > 0 && <span>·</span>}
        {skill.category && (
          <span>{skill.category}</span>
        )}
        {skill.category && <span>·</span>}
        <span className="flex items-center gap-0.5">
          {skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1)}k` : skill.stars} stars
        </span>
        {skill.last_commit_at && (
          <>
            <span>·</span>
            <span>Updated {timeAgo(skill.last_commit_at)}</span>
          </>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mt-auto mb-4 text-xs text-[var(--ps-text-muted)]">
        <span>by</span>
        <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={16} height={16} className="w-4 h-4 rounded-full" />
        <span className="truncate">{skill.author_name}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--ps-border)]">
        <span className="text-xs font-medium text-[var(--ps-text-secondary)] group-hover:text-[var(--ps-text-primary)] transition-colors flex items-center gap-1">
          View Details
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </span>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopyInstall}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors text-[var(--ps-text-muted)] hover:text-[var(--ps-neon-cyan)] hover:bg-[var(--ps-bg-elevated)]"
            title={installCopied ? "Copied!" : "Copy install command"}
          >
            {installCopied ? (
              <Check className="w-3.5 h-3.5 text-[var(--ps-neon-green)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <FavoriteButton skillId={skill.id} size="sm" />
        </div>
      </div>
    </div>
  );
});
