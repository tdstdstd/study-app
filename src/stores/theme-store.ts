"use client";

import { create } from "zustand";

type Theme = "light" | "dark" | "blue" | "black";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    set({ theme });
  },
}));

// Инициализация темы на клиенте
export function initTheme(savedTheme?: string) {
  const theme = (savedTheme || localStorage.getItem("theme") || "dark") as Theme;
  document.documentElement.setAttribute("data-theme", theme);
  useThemeStore.getState().setTheme(theme);
}