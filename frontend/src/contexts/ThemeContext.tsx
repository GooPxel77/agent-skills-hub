import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemeSetting = "light" | "dark";
interface ThemeCtx {
  setting: ThemeSetting;
  effective: ThemeSetting;
  setSetting: (s: ThemeSetting) => void;
}
const Ctx = createContext<ThemeCtx>(null!);
function getInitialSetting(): ThemeSetting {
  try { return localStorage.getItem("theme") === "dark" ? "dark" : "light"; }
  catch { return "light"; }
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<ThemeSetting>(getInitialSetting);
  useEffect(() => {
    document.documentElement.dataset.theme = setting;
    document.documentElement.classList.toggle("dark", setting === "dark");
    document.documentElement.style.colorScheme = setting;
    try { localStorage.setItem("theme", setting); } catch { /* Storage may be unavailable. */ }
  }, [setting]);
  return <Ctx.Provider value={{ setting, effective: setting, setSetting }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
