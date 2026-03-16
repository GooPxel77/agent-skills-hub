import { useEffect, useState } from "react";
import { Trophy, Star } from "lucide-react";
import { fetchMostStarred } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill } from "../types/skill";
import { formatStars } from "../utils/time";
import { ScoreBadge } from "./ScoreBadge";

interface Props {
  onSelect?: (skill: Skill) => void;
  onShowDetail?: (skill: Skill) => void;
  initialData?: Skill[];
}

export function HallOfFame({ onSelect: _onSelect, onShowDetail, initialData }: Props) {
  const { t } = useI18n();
  const [items, setItems] = useState<Skill[]>(initialData ?? []);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (initialData && initialData.length > 0) setItems(initialData);
  }, [initialData]);

  useEffect(() => {
    if (items.length > 0) return;
    fetchMostStarred(10).then(setItems).catch(console.error);
  }, [items.length]);

  if (items.length === 0) return null;

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  const podiumColors = [
    { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', rank: 'var(--ps-gradient-warm)' },
    { bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.3)', rank: 'linear-gradient(135deg, #94a3b8, #64748b)' },
    { bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.3)', rank: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
  ];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" style={{ color: 'var(--ps-neon-amber)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--ps-text-primary)' }}>{t("hallOfFame.title")}</h2>
        <span className="text-sm hidden sm:inline" style={{ color: 'var(--ps-text-muted)' }}>{t("hallOfFame.subtitle")}</span>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {top3.map((skill, i) => (
          <div
            key={skill.id}
            onClick={() => onShowDetail?.(skill)}
            className="rounded-xl p-5 transition-all cursor-pointer hover:-translate-y-0.5"
            style={{
              background: podiumColors[i].bg,
              border: `2px solid ${podiumColors[i].border}`,
              boxShadow: `0 0 20px ${podiumColors[i].border}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-sm text-white"
                style={{ background: podiumColors[i].rank }}>{i + 1}</span>
              <ScoreBadge score={skill.score} size="sm" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={20} height={20} className="w-5 h-5 rounded-full" />
              <span className="text-xs" style={{ color: 'var(--ps-text-muted)' }}>{skill.author_name}</span>
            </div>
            <h3
              onClick={(e) => { e.stopPropagation(); window.open(skill.repo_url, "_blank", "noopener"); }}
              className="font-bold truncate cursor-pointer transition-colors"
              style={{ color: 'var(--ps-text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
            >
              {skill.repo_name}
            </h3>
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--ps-text-muted)' }}>{skill.description || "No description"}</p>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <Star className="w-4 h-4" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
              <strong style={{ color: 'var(--ps-text-primary)' }}>{skill.stars.toLocaleString()}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* 4-10 Compact List */}
      <div className={`ps-card overflow-hidden${!expanded ? " hidden sm:block" : ""}`} style={{ borderRadius: 'var(--ps-radius-card)' }}>
        {rest.map((skill, i) => (
          <div
            key={skill.id}
            onClick={() => onShowDetail?.(skill)}
            className="flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer"
            style={{ borderBottom: i < rest.length - 1 ? '1px solid var(--ps-border)' : 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span className="text-sm font-bold w-6 text-center" style={{ color: 'var(--ps-text-muted)' }}>{i + 4}</span>
            <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={28} height={28} className="w-7 h-7 rounded-full" />
            <div className="flex-1 min-w-0">
              <span
                onClick={(e) => { e.stopPropagation(); window.open(skill.repo_url, "_blank", "noopener"); }}
                className="font-medium text-sm cursor-pointer transition-colors"
                style={{ color: 'var(--ps-text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
              >
                {skill.repo_name}
              </span>
              <span className="text-xs ml-2" style={{ color: 'var(--ps-text-muted)' }}>{skill.author_name}</span>
            </div>
            <span className="ps-badge-purple hidden sm:inline">{skill.category}</span>
            <div className="flex items-center gap-1 text-sm w-20 justify-end" style={{ color: 'var(--ps-text-secondary)' }}>
              <Star className="w-3.5 h-3.5" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
              {formatStars(skill.stars)}
            </div>
          </div>
        ))}
      </div>
      {rest.length > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="sm:hidden w-full py-2.5 mt-2 text-xs font-medium cursor-pointer"
          style={{ color: 'var(--ps-neon-cyan)' }}
        >
          {t("common.showAll").replace("{count}", String(rest.length + 3))}
        </button>
      )}
    </section>
  );
}
