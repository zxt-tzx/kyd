import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = useCallback(() => {
    const nextTheme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const ThemeIcon =
    theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : SunMoonIcon;

  const themeText =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return {
    theme,
    themeText,
    ThemeIcon,
    handleThemeChange,
  };
}
