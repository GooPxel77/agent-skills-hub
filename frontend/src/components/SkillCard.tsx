import { memo } from "react";
import { Link } from "react-router-dom";
import { 
  Server, 
  Cpu, 
  Wrench, 
  Sparkles, 
  Plug, 
  Package, 
  Star, 
  Calendar, 
} from "lucide-react";
import type { Skill } from "../types/skill";
import { timeAgo } from "../utils/time";
import { FavoriteButton } from "./FavoriteButton";

interface Props {
  skill: Skill;
  onSelect?: (skill: Skill) => void;
  onShowDetail?: (skill: Skill) => void;
}

function getCategoryIcon(category: string) {
  const cat = category?.toLowerCase();
  if (cat === "mcp-server") return <Server className="w-4 h-4 text-[var(--ps-neon-cyan)]" />;
  if (cat === "claude-skill" || cat === "codex-skill") return <Cpu className="w-4 h-4 text-[var(--ps-neon-cyan)]" />;
  if (cat === "agent-tool") return <Wrench className="w-4 h-4 text-[var(--ps-neon-cyan)]" />;
  if (cat === "ai-skill") return <Sparkles className="w-4 h-4 text-[var(--ps-neon-cyan)]" />;
  if (cat === "llm-plugin" || cat === "youmind-plugin") return <Plug className="w-4 h-4 text-[var(--ps-neon-cyan)]" />;
  return <Package className="w-4 h-4 text-[var(--ps-text-muted)]" />;
}

export const SkillCard = memo(function SkillCard({ skill }: Props) {
  return (
    <div
      className="group relative p-4 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Top row: Category icon, Name & Favorite */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            {getCategoryIcon(skill.category)}
          </div>
          <h3
            className="font-semibold text-base text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors truncate"
          >
            <Link to={`/skill/${skill.repo_full_name}`} className="after:absolute after:inset-0 after:rounded-[var(--ps-radius-card)]">{skill.repo_name}</Link>
          </h3>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="relative z-10 shrink-0">
          <FavoriteButton skillId={skill.id} size="sm" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--ps-text-secondary)] line-clamp-2 leading-relaxed mb-3 min-h-10">
        {skill.description || "No description provided."}
      </p>

      {/* Footer Meta Row: Author & Repository metrics */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-[var(--ps-border)] text-xs text-[var(--ps-text-muted)]">
        {/* Author */}
        <div className="flex items-center gap-2 min-w-0">
          <img 
            src={skill.author_avatar_url} 
            alt={skill.author_name} 
            loading="lazy" 
            width={16} 
            height={16} 
            className="w-4 h-4 rounded-full shrink-0 border border-[rgba(255,255,255,0.1)]" 
          />
          <span className="truncate">{skill.author_name}</span>
        </div>

        {/* Stars and Update Date */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[var(--ps-neon-amber)]/80" />
            {skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1)}k` : skill.stars}
          </span>
          {skill.last_commit_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--ps-text-muted)]/70" />
              <span title="Last commit">{timeAgo(skill.last_commit_at)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

