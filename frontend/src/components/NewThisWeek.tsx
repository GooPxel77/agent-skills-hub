import { useEffect, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { fetchNewThisWeek } from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import type { Skill } from "../types/skill";
import { formatStars, timeAgo } from "../utils/time";

interface Props {
  onShowDetail?: (skill: Skill) => void;
}

export function NewThisWeek({ onShowDetail }: Props) {
  const { t } = useI18n();
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
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--ps-neon-green)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--ps-text-primary)' }}>{t("newThisWeek.title")}</h2>
        </div>
        <div className="ps-card p-8 text-center" style={{ color: 'var(--ps-text-muted)' }}>
          {t("detail.loading")}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: 'var(--ps-neon-green)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--ps-text-primary)' }}>{t("newThisWeek.title")}</h2>
        <span className="text-sm hidden sm:inline" style={{ color: 'var(--ps-text-muted)' }}>{t("newThisWeek.subtitle")}</span>
      </div>
      <div className="ps-card overflow-hidden" style={{ borderRadius: 'var(--ps-radius-card)' }}>
        {items.map((skill, i) => (
          <div
            key={skill.id}
            onClick={() => onShowDetail?.(skill)}
            className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer group"
            style={{ borderBottom: i < items.length - 1 ? '1px solid var(--ps-border)' : 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 211, 238, 0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span className="text-sm font-bold w-6 text-center" style={{ color: i < 3 ? 'var(--ps-neon-green)' : 'var(--ps-text-muted)' }}>
              {i + 1}
            </span>
            <img src={skill.author_avatar_url} alt={skill.author_name} loading="lazy" width={28} height={28} className="w-7 h-7 rounded-full" style={{ border: '1px solid var(--ps-border)' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={(e) => { e.stopPropagation(); window.open(skill.repo_url, "_blank", "noopener"); }}
                  className="font-medium text-sm truncate cursor-pointer transition-colors"
                  style={{ color: 'var(--ps-text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-primary)'}
                >
                  {skill.repo_name}
                </span>
                <span className="ps-badge-new shrink-0" style={{ fontSize: '9px', fontWeight: 700 }}>NEW</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--ps-text-muted)' }}>{skill.author_name}</span>
            </div>
            <span className="ps-badge-purple hidden md:inline">{skill.category}</span>
            <div className="flex items-center gap-1 text-sm w-16 justify-end" style={{ color: 'var(--ps-text-secondary)' }}>
              <Star className="w-3 h-3" style={{ color: 'var(--ps-neon-amber)', fill: 'var(--ps-neon-amber)' }} />
              {formatStars(skill.stars)}
            </div>
            <span className="text-xs w-14 text-right hidden sm:block" style={{ color: 'var(--ps-neon-green)' }}>
              {timeAgo(skill.first_seen)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
