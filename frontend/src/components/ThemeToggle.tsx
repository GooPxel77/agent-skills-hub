import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useI18n } from "../i18n/I18nContext";

type Option = { value: "system" | "light" | "dark"; labelEn: string; labelZh: string; icon: React.ReactNode };

const OPTIONS: Option[] = [
  { value: "system", labelEn: "System", labelZh: "跟隨系統", icon: <Monitor className="w-3.5 h-3.5" /> },
  { value: "light",  labelEn: "Light",  labelZh: "淺色",     icon: <Sun    className="w-3.5 h-3.5" /> },
  { value: "dark",   labelEn: "Dark",   labelZh: "深色",     icon: <Moon   className="w-3.5 h-3.5" /> },
];

export function ThemeToggle() {
  const { setting, effective, setSetting } = useTheme();
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const headerLabel = lang === "zh" ? "外觀" : "Appearance";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
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
        aria-label={headerLabel}
        title={headerLabel}
      >
        {effective === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-50 py-1"
          style={{
            background: 'var(--ps-bg-surface)',
            border: '1px solid var(--ps-border-strong)',
            boxShadow: 'var(--ps-shadow-soft)',
          }}
        >
          <div
            className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ps-text-muted)' }}
          >
            {headerLabel}
          </div>
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSetting(opt.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer"
              style={{
                color: setting === opt.value ? 'var(--ps-accent-cyan)' : 'var(--ps-text-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--ps-bg-card-hover)';
                (e.currentTarget as HTMLElement).style.color = setting === opt.value ? 'var(--ps-accent-cyan)' : 'var(--ps-text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = setting === opt.value ? 'var(--ps-accent-cyan)' : 'var(--ps-text-secondary)';
              }}
            >
              <span style={{ color: 'var(--ps-text-muted)' }}>{opt.icon}</span>
              <span className="flex-1 text-left">{lang === "zh" ? opt.labelZh : opt.labelEn}</span>
              {setting === opt.value && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
