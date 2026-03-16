import { useI18n } from "../i18n/I18nContext";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className="px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer"
      style={{
        border: '1px solid var(--ps-border)',
        background: 'var(--ps-bg-elevated)',
        color: 'var(--ps-text-secondary)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ps-border-glow)'; e.currentTarget.style.color = 'var(--ps-neon-cyan)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ps-border)'; e.currentTarget.style.color = 'var(--ps-text-secondary)'; }}
    >
      {lang === "zh" ? "EN" : "中文"}
    </button>
  );
}
