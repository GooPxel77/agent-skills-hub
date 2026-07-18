import { memo } from "react";
import { 
  Server, 
  Cpu, 
  Wrench, 
  Sparkles, 
  Plug, 
  Package, 
  Star, 
  Calendar, 
  Award, 
  TrendingUp, 
  ShieldCheck 
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

export const SkillCard = memo(function SkillCard({ skill, onShowDetail }: Props) {
  const isHighValue = skill.stars >= 200 || skill.score >= 80;
  
  // Trending if updated in past 30 days and has positive stars/momentum
  const isTrending = !!(
    skill.last_commit_at && 
    (new Date().getTime() - new Date(skill.last_commit_at).getTime() < 30 * 24 * 60 * 60 * 1000) && 
    (skill.stars >= 50 || (skill.star_momentum || 0) >= 1.5)
  );

  const isVerified = skill.quality_score >= 70;

  return (
    <div
      onClick={() => onShowDetail?.(skill)}
      className="group relative p-5 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-[0_0_20px_rgba(0,240,255,0.04)]"
    >
      {/* Top row: Category icon, Name & Favorite */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            {getCategoryIcon(skill.category)}
          </div>
          <h3
            className="font-semibold text-base text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors truncate"
          >
            {skill.repo_name}
          </h3>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <FavoriteButton skillId={skill.id} size="sm" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--ps-text-secondary)] line-clamp-2 leading-relaxed mb-4">
        {skill.description || "No description provided."}
      </p>

      {/* Badges Row - macOS/Editor style tags with thin border */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {isHighValue && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border border-[var(--ps-neon-amber)]/30 text-[var(--ps-neon-amber)] bg-[var(--ps-neon-amber)]/5">
            <Award className="w-3 h-3" />
            High Value
          </span>
        )}
        {isTrending && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border border-[var(--ps-neon-cyan)]/30 text-[var(--ps-neon-cyan)] bg-[var(--ps-neon-cyan)]/5">
            <TrendingUp className="w-3 h-3" />
            Trending
          </span>
        )}
        {isVerified && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border border-[var(--ps-neon-green)]/30 text-[var(--ps-neon-green)] bg-[var(--ps-neon-green)]/5">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

      {/* Footer Meta Row: Author & Repository metrics */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(255,255,255,0.04)] text-xs text-[var(--ps-text-muted)]">
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
              {timeAgo(skill.last_commit_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

