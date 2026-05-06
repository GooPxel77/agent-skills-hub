import { useEffect, useState } from "react";
import { Sparkles, Star, ChevronRight } from "lucide-react";
import { fetchNewThisWeek } from "../api/client";
import type { Skill } from "../types/skill";
import { formatStars, timeAgo } from "../utils/time";

interface Props {
  onShowDetail?: (skill: Skill) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  "claude-skill": "Claude Skill",
  "mcp-server":   "MCP Server",
  "agent-tool":   "Agent Tool",
  "ai-skill":     "AI Skill",
  "codex-skill":  "Codex Skill",
  "llm-plugin":   "LLM Plugin",
};

export function NewThisWeek({ onShowDetail }: Props) {
  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewThisWeek(10)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-10">
        <div className="flex items-start gap-2 mb-4">
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--accent-green)' }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New This Week</h2>
          </div>
        </div>
        <div className="rounded-[var(--ps-radius-card)] border p-8 text-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-start gap-2 mb-4">
        <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--accent-green)' }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New This Week</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Recently indexed AI skills, MCP servers, and agent tools from the past 7 days.
            A quick way to track what is emerging in the AI agent ecosystem.
          </p>
        </div>
      </div>

      <div className="rounded-[var(--ps-radius-card)] overflow-hidden border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {items.map((skill, i) => (
          <div
            key={skill.id}
            onClick={() => onShowDetail?.(skill)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors"
            style={{
              borderBottom: i < items.length - 1 ? `1px solid var(--border-subtle)` : 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Rank */}
            <span
              className="text-sm font-bold w-6 text-center shrink-0 tabular-nums"
              style={{ color: i < 3 ? 'var(--accent-green)' : 'var(--text-muted)' }}
            >
              {i + 1}
            </span>

            {/* Avatar */}
            <img
              src={skill.author_avatar_url}
              alt={skill.author_name}
              loading="lazy"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full shrink-0"
              style={{ border: '1px solid var(--border-subtle)' }}
            />

            {/* Name + owner */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={(e) => { e.stopPropagation(); window.open(skill.repo_url, "_blank", "noopener"); }}
                  className="font-semibold text-sm truncate transition-colors cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                >
                  {skill.repo_name}
                </span>
                <span
                  className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--accent-green)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                >
                  NEW
                </span>
              </div>
              <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{skill.author_name}</span>
            </div>

            {/* Category badge */}
            <span
              className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium shrink-0"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {CATEGORY_LABEL[skill.category] ?? skill.category}
            </span>

            {/* Stars */}
            <div className="flex items-center gap-1 text-xs w-14 justify-end shrink-0" style={{ color: 'var(--text-secondary)' }}>
              <Star className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-amber)', fill: 'var(--accent-amber)' }} />
              {formatStars(skill.stars)}
            </div>

            {/* Time indexed */}
            <span className="text-xs w-14 text-right hidden sm:block shrink-0" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(skill.first_seen)}
            </span>

            {/* Chevron */}
            <ChevronRight
              className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
