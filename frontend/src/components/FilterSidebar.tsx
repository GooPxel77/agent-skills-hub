import { useI18n } from "../i18n/I18nContext";
import type { CategoryCount, SkillsQueryParams } from "../types/skill";
import { getScoreColor } from "./ScoreBadge";

interface Props {
  params: SkillsQueryParams;
  onUpdate: (update: Partial<SkillsQueryParams>) => void;
  categories: CategoryCount[];
}

const TIERS = ["S", "A", "B", "C", "D"] as const;
const TIER_SCORES = [80, 65, 50, 35, 0];
const STAR_PRESETS = [
  { label: "100+", value: 100 },
  { label: "500+", value: 500 },
  { label: "1k+", value: 1000 },
  { label: "5k+", value: 5000 },
];

export function FilterSidebar({ params, onUpdate, categories }: Props) {
  const { t } = useI18n();

  const selectedTiers = params.quality_tiers ? params.quality_tiers.split(",") : [];

  const toggleTier = (tier: string) => {
    const current = new Set(selectedTiers);
    if (current.has(tier)) {
      current.delete(tier);
    } else {
      current.add(tier);
    }
    const value = current.size > 0 ? Array.from(current).join(",") : undefined;
    onUpdate({ quality_tiers: value });
  };

  const setMinStars = (value: number | undefined) => {
    onUpdate({ min_stars: params.min_stars === value ? undefined : value });
  };

  return (
    <aside className="w-56 shrink-0 space-y-5">
      {/* Quality Grade */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ps-neon-cyan)' }}>
          {t("filter.qualityGrade")}
        </h4>
        <div className="space-y-1">
          {TIERS.map((tier, i) => (
            <label
              key={tier}
              className="flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer transition-colors"
              style={{ color: 'var(--ps-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ps-bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <input
                type="checkbox"
                checked={selectedTiers.includes(tier)}
                onChange={() => toggleTier(tier)}
                className="w-3.5 h-3.5 rounded cursor-pointer accent-cyan-400"
              />
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${getScoreColor(TIER_SCORES[i])}`}>
                {tier}
              </span>
              <span className="text-xs" style={{ color: 'var(--ps-text-muted)' }}>
                {tier === "S" ? "≥80" : tier === "A" ? "65-79" : tier === "B" ? "50-64" : tier === "C" ? "35-49" : "<35"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Stars Range */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ps-neon-cyan)' }}>
          {t("filter.starsRange")}
        </h4>
        <div className="flex flex-wrap gap-1">
          {STAR_PRESETS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setMinStars(value)}
              className="ps-btn text-xs cursor-pointer"
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: params.min_stars === value ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
                color: params.min_stars === value ? '#0a0e1a' : 'var(--ps-text-secondary)',
                border: params.min_stars === value ? 'none' : '1px solid var(--ps-border)',
                fontWeight: params.min_stars === value ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ps-neon-cyan)' }}>
          {t("table.category")}
        </h4>
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          <button
            onClick={() => onUpdate({ category: undefined })}
            className="w-full text-left px-2 py-1 text-xs rounded transition-colors cursor-pointer"
            style={{
              color: !params.category ? 'var(--ps-neon-cyan)' : 'var(--ps-text-secondary)',
              background: !params.category ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
              fontWeight: !params.category ? 500 : 400,
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onUpdate({ category: params.category === cat.name ? undefined : cat.name })}
              className="w-full text-left px-2 py-1 text-xs rounded transition-colors cursor-pointer flex items-center justify-between"
              style={{
                color: params.category === cat.name ? 'var(--ps-neon-cyan)' : 'var(--ps-text-secondary)',
                background: params.category === cat.name ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                fontWeight: params.category === cat.name ? 500 : 400,
              }}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] shrink-0" style={{ color: 'var(--ps-text-muted)' }}>{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ps-neon-cyan)' }}>
          {t("explore.size").replace(":", "")}
        </h4>
        <div className="flex flex-wrap gap-1">
          {["micro", "small", "medium", "large"].map((s) => (
            <button
              key={s}
              onClick={() => onUpdate({ size_category: params.size_category === s ? undefined : s })}
              className="ps-btn text-xs cursor-pointer"
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: params.size_category === s ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
                color: params.size_category === s ? '#0a0e1a' : 'var(--ps-text-secondary)',
                border: params.size_category === s ? 'none' : '1px solid var(--ps-border)',
                fontWeight: params.size_category === s ? 600 : 400,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ps-neon-cyan)' }}>
          {t("explore.platform").replace(":", "")}
        </h4>
        <div className="flex flex-wrap gap-1">
          {["python", "node", "go", "docker", "claude", "mcp"].map((p) => (
            <button
              key={p}
              onClick={() => onUpdate({ platform: params.platform === p ? undefined : p })}
              className="ps-btn text-xs cursor-pointer"
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: params.platform === p ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
                color: params.platform === p ? '#0a0e1a' : 'var(--ps-text-secondary)',
                border: params.platform === p ? 'none' : '1px solid var(--ps-border)',
                fontWeight: params.platform === p ? 600 : 400,
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
