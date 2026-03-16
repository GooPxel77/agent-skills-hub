import { Scale } from "lucide-react";
import { useCompare } from "../hooks/useCompare";
import type { Skill } from "../types/skill";

interface Props {
  skill: Skill;
  size?: "sm" | "md";
}

export function CompareButton({ skill, size = "md" }: Props) {
  const { isInCompare, toggleCompare, items, maxCompare } = useCompare();
  const active = isInCompare(skill.id);
  const disabled = !active && items.length >= maxCompare;
  const sz = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSz = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleCompare(skill);
      }}
      disabled={disabled}
      className={`${sz} flex items-center justify-center rounded-lg transition-all cursor-pointer`}
      style={{
        background: active ? 'rgba(0, 240, 255, 0.1)' : 'var(--ps-bg-elevated)',
        color: active ? 'var(--ps-neon-cyan)' : disabled ? 'var(--ps-text-muted)' : 'var(--ps-text-secondary)',
        border: active ? '1px solid var(--ps-border-glow)' : '1px solid var(--ps-border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      title={active ? "Remove from compare" : disabled ? "Max 3 skills" : "Add to compare"}
    >
      <Scale className={iconSz} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}
