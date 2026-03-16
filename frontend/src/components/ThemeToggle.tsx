import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-all cursor-pointer"
      style={{
        color: 'var(--ps-text-secondary)',
        background: 'var(--ps-bg-elevated)',
        border: '1px solid var(--ps-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--ps-border-glow)';
        e.currentTarget.style.color = 'var(--ps-neon-cyan)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--ps-border)';
        e.currentTarget.style.color = 'var(--ps-text-secondary)';
      }}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
