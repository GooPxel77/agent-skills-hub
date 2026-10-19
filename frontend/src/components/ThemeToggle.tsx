import { RiSunLine, RiMoonLine } from "@remixicon/react";
import { useTheme } from "../contexts/ThemeContext";
import { useI18n } from "../i18n/I18nContext";

export function ThemeToggle() {
  const { setting, setSetting } = useTheme();
  const { lang } = useI18n();
  const dark = setting === "dark";
  const label = lang === "zh" ? (dark ? "切換為淺色" : "切換為深色") : (dark ? "Switch to light mode" : "Switch to dark mode");
  return (
    <button type="button" onClick={() => setSetting(dark ? "light" : "dark")}
      className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
      style={{ color: "var(--ps-text-secondary)", background: "var(--ps-bg-elevated)", border: "1px solid var(--ps-border)" }}
      aria-label={label} title={label}>
      {dark ? <RiSunLine className="w-5 h-5" /> : <RiMoonLine className="w-5 h-5" />}
    </button>
  );
}
