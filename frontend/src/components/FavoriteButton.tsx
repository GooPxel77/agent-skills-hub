import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

interface Props {
  skillId: number;
  size?: "sm" | "md";
}

export function FavoriteButton({ skillId, size = "md" }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(skillId);
  const sz = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSz = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(skillId);
      }}
      className={`${sz} flex items-center justify-center rounded-lg transition-all cursor-pointer`}
      style={{
        background: active ? 'rgba(236, 72, 153, 0.1)' : 'var(--ps-bg-elevated)',
        color: active ? 'var(--ps-neon-pink)' : 'var(--ps-text-secondary)',
        border: active ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid var(--ps-border)',
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={iconSz} fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 2} />
    </button>
  );
}
