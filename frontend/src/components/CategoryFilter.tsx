import type { CategoryCount } from "../types/skill";

interface Props {
  categories: CategoryCount[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className="ps-btn text-sm cursor-pointer"
        style={{
          background: !selected ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
          color: !selected ? '#0a0e1a' : 'var(--ps-text-secondary)',
          border: !selected ? 'none' : '1px solid var(--ps-border)',
          fontWeight: !selected ? 600 : 400,
        }}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className="ps-btn text-sm cursor-pointer"
          style={{
            background: selected === cat.name ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
            color: selected === cat.name ? '#0a0e1a' : 'var(--ps-text-secondary)',
            border: selected === cat.name ? 'none' : '1px solid var(--ps-border)',
            fontWeight: selected === cat.name ? 600 : 400,
          }}
        >
          {cat.name}
          <span className="ml-1 opacity-70">{cat.count}</span>
        </button>
      ))}
    </div>
  );
}
