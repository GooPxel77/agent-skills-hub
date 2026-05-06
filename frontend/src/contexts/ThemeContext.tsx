import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type ThemeSetting = "system" | "light" | "dark";
type EffectiveTheme = "light" | "dark";

interface ThemeCtx {
  setting: ThemeSetting;
  effective: EffectiveTheme;
  setSetting: (s: ThemeSetting) => void;
}

const Ctx = createContext<ThemeCtx>(null!);

function getSystemTheme(): EffectiveTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialSetting(): ThemeSetting {
  const stored = localStorage.getItem("theme") as ThemeSetting | null;
  if (stored === "system" || stored === "light" || stored === "dark") return stored;
  return "system";
}

function resolveEffective(setting: ThemeSetting): EffectiveTheme {
  if (setting === "system") return getSystemTheme();
  return setting;
}

function applyTheme(effective: EffectiveTheme) {
  document.documentElement.dataset.theme = effective;
  // Keep legacy .dark class in sync for any Tailwind dark: utilities still used
  document.documentElement.classList.toggle("dark", effective === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [setting, setSettingState] = useState<ThemeSetting>(getInitialSetting);
  const [effective, setEffective] = useState<EffectiveTheme>(() => resolveEffective(getInitialSetting()));
  const mqRef = useRef<MediaQueryList | null>(null);

  const apply = (s: ThemeSetting) => {
    const eff = resolveEffective(s);
    setEffective(eff);
    applyTheme(eff);
  };

  // Apply on mount and whenever setting changes
  useEffect(() => {
    apply(setting);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting]);

  // Listen for OS preference changes only when in system mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mqRef.current = mq;
    const handler = () => {
      if (setting === "system") apply("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setting]);

  const setSetting = (s: ThemeSetting) => {
    setSettingState(s);
    localStorage.setItem("theme", s);
  };

  return (
    <Ctx.Provider value={{ setting, effective, setSetting }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
