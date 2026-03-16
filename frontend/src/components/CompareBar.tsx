import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCompare } from "../hooks/useCompare";
import { useI18n } from "../i18n/I18nContext";

export function CompareBar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { items, removeFromCompare, clearCompare } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(10, 14, 26, 0.9)', borderTop: '1px solid var(--ps-border-glow)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          <span className="text-xs font-medium shrink-0" style={{ color: 'var(--ps-text-secondary)' }}>
            {t("compare.title")} ({items.length}/3)
          </span>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 ps-badge text-xs shrink-0"
            >
              <img src={item.author_avatar_url} alt="" className="w-4 h-4 rounded-full" />
              <span className="font-medium max-w-24 truncate" style={{ color: 'var(--ps-neon-cyan)' }}>{item.repo_name}</span>
              <button
                onClick={() => removeFromCompare(item.id)}
                className="ml-0.5 cursor-pointer transition-colors"
                style={{ color: 'var(--ps-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-pink)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-muted)'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="px-3 py-1.5 text-xs transition-colors cursor-pointer"
            style={{ color: 'var(--ps-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ps-neon-pink)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ps-text-secondary)'}
          >
            {t("compare.clear")}
          </button>
          <button
            onClick={() => {
              const ids = items.map((i) => i.id).join(",");
              navigate(`/compare?ids=${ids}`);
            }}
            disabled={items.length < 2}
            className="ps-btn ps-btn-primary text-xs"
          >
            {t("compare.button")}
          </button>
        </div>
      </div>
    </div>
  );
}
