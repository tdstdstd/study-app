"use client";

import { Sun, Moon, Droplets, Circle } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";
import { THEMES } from "@/lib/constants";

const icons = {
  sun: Sun,
  moon: Moon,
  droplets: Droplets,
  circle: Circle,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-bg-tertiary">
      {THEMES.map((t) => {
        const Icon = icons[t.icon as keyof typeof icons];
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={cn(
              "p-2 rounded-md transition-all",
              theme === t.id
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            )}
            title={t.label}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}