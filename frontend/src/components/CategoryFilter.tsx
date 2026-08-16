import type { CategoryCount } from "../types/skill";
import { CATEGORY_GUIDE_MAP } from "../data/categories";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  categories: CategoryCount[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  const { lang } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className="ps-btn text-xs sm:text-sm cursor-pointer"
        style={{
          background: !selected ? "var(--ps-gradient-neon)" : "var(--ps-bg-elevated)",
          color: !selected ? "#0a0e1a" : "var(--ps-text-secondary)",
          border: !selected ? "none" : "1px solid var(--ps-border)",
          fontWeight: !selected ? 600 : 400,
        }}
      >
        All
      </button>
      {categories.map((cat) => {
        const meta = CATEGORY_GUIDE_MAP[cat.name];
        const tooltip = meta
          ? lang === "zh"
            ? `${meta.title_zh}: ${meta.scene_zh}`
            : `${meta.title_en}: ${meta.scene_en}`
          : cat.name;

        return (
          <button
            key={cat.name}
            onClick={() => onSelect(cat.name)}
            title={tooltip}
            className="ps-btn text-xs sm:text-sm cursor-pointer"
            style={{
              background:
                selected === cat.name
                  ? "var(--ps-gradient-neon)"
                  : "var(--ps-bg-elevated)",
              color:
                selected === cat.name ? "#0a0e1a" : "var(--ps-text-secondary)",
              border:
                selected === cat.name ? "none" : "1px solid var(--ps-border)",
              fontWeight: selected === cat.name ? 600 : 400,
            }}
          >
            {meta ? (lang === "zh" ? meta.title_zh : meta.title_en) : cat.name}
            <span className="ml-1 opacity-70 font-mono text-[10px]">{cat.count}</span>
          </button>
        );
      })}
    </div>
  );
}
