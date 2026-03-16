import { useEffect, useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import { fetchRecentlyUpdated } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill } from "../types/skill";
import { formatStars, timeAgo } from "../utils/time";
import { ProjectTypeBadge } from "./ProjectTypeBadge";

interface Props {
  onSelect?: (skill: Skill) => void;
  onShowDetail?: (skill: Skill) => void;
  initialData?: Skill[];
}

export function RecentlyUpdated({ onSelect: _onSelect, onShowDetail, initialData }: Props) {
  const { t } = useI18n();
  const [items, setItems] = useState<Skill[]>(initialData ?? []);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (initialData && initialData.length > 0) setItems(initialData);
  }, [initialData]);

  useEffect(() => {
    if (items.length > 0) return;
    fetchRecentlyUpdated(8).then(setItems).catch(console.error);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5" style={{ color: 'var(--ps-neon-green)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--ps-text-primary)' }}>{t("recentlyUpdated.title")}</h2>
        <span className="text-sm hidden sm:inline" style={{ color: 'var(--ps-text-muted)' }}>{t("recentlyUpdated.subtitle")}</span>
      </div>
      <div className="ps-card overflow-hidden" style={{ borderRadius: 'var(--ps-radius-card)' }}>
        {items.map((skill, i) => (
          <div
            key={skill.id}
            onClick={() => onShowDetail?.(skill)}
            className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer group${i >= 4 && !expanded ? " hidden sm:flex" : ""}`}
            style={{ borderBottom: i < items.length - 1 ? '1px solid var(--ps-border)' : 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 211, 238, 0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={36} height={36} className="w-9 h-9 rounded-full" style={{ border: '1px solid var(--ps-border)' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  onClick={(e) => { e.stopPropagation(); window.open(skill.repo_url, "_blank", "noopener"); }}
                  className="font-semibold text-sm truncate cursor-pointer transition-colors"
                  style={{ color: 'var(--ps-text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-green)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
                >
                  {skill.repo_name}
                </span>
                <ProjectTypeBadge type={skill.project_type} />
                {skill.language && (
                  <span className="ps-badge hidden sm:inline" style={{ fontSize: '10px' }}>{skill.language}</span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--ps-text-muted)' }}>{skill.author_name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--ps-text-secondary)' }}>
              <Star className="w-3 h-3" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
              {formatStars(skill.stars)}
            </div>
            <span className="flex items-center gap-1 text-xs font-medium whitespace-nowrap" style={{ color: 'var(--ps-neon-green)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--ps-neon-green)' }} />
              {timeAgo(skill.last_commit_at)}
            </span>
          </div>
        ))}
      </div>
      {items.length > 4 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="sm:hidden w-full py-2.5 mt-2 text-xs font-medium cursor-pointer"
          style={{ color: 'var(--ps-neon-cyan)' }}
        >
          {t("common.showAll").replace("{count}", String(items.length))}
        </button>
      )}
    </section>
  );
}
