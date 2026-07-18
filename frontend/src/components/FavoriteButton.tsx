import { Bookmark } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

interface Props {
  skillId: number;
  size?: "sm" | "md";
}

export function FavoriteButton({ skillId, size = "md" }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(skillId);
  const sz = size === "sm" ? "w-7 h-7 rounded" : "w-9 h-9 rounded-lg";
  const iconSz = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(skillId);
      }}
      className={`
        ${sz} flex items-center justify-center border transition-all duration-200 ease-out cursor-pointer
        hover:scale-105 active:scale-95
        ${active 
          ? "bg-[rgba(0,240,255,0.06)] text-[var(--ps-neon-cyan)] border-[var(--ps-neon-cyan)]/40 shadow-[0_0_12px_rgba(0,240,255,0.1)]" 
          : "bg-[var(--ps-bg-elevated)] text-[var(--ps-text-secondary)] border-[var(--ps-border)] hover:border-[var(--ps-border-glow)] hover:text-[var(--ps-text-primary)]"
        }
      `}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Bookmark className={`${iconSz} transition-transform`} fill={active ? "currentColor" : "none"} strokeWidth={1.5} />
    </button>
  );
}
