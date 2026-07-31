import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
    return "dark";
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored || "system";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<Theme>("system");

  React.useEffect(() => {
    setTheme(getStoredTheme());
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(getStoredTheme());
    media?.addEventListener?.("change", onChange);
    return () => media?.removeEventListener?.("change", onChange);
  }, []);

  const cycle = () => {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    applyTheme(next);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click to switch.`}
      title={`Theme: ${theme}`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
