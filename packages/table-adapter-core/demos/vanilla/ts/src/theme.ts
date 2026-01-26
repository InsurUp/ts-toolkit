const THEME_KEY = "table-adapter-vanilla-theme";

export function getInitialTheme(): boolean {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function setTheme(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}
