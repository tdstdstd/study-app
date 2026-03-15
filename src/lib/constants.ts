export const SESSION_CONSTRAINTS = {
  MIN_DURATION_SECONDS: 60,
  MAX_DURATION_SECONDS: 86400, // 24 hours
  MAX_PAUSE_DURATION_SECONDS: 43200, // 12 hours
  MAX_SINGLE_SESSION_HOURS: 24,
} as const;

export const DEFAULT_STATUSES = [
  { label: "Бодро", emoji: "⚡" },
  { label: "Хороший фокус", emoji: "🎯" },
  { label: "Отлично идёт", emoji: "🔥" },
  { label: "Нормально", emoji: "👍" },
  { label: "Устал", emoji: "😴" },
  { label: "Отвлекаюсь", emoji: "🤯" },
  { label: "Тяжело", emoji: "😰" },
] as const;

export const SUBJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#f59e0b", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#64748b", "#84cc16",
] as const;

export const SUBJECT_ICONS = [
  "book", "code", "flask", "calculator", "globe",
  "music", "palette", "brain", "dumbbell", "pen-tool",
  "languages", "microscope", "laptop", "lightbulb", "graduation-cap",
] as const;

export const THEMES = [
  { id: "light", label: "Светлая", icon: "sun" },
  { id: "dark", label: "Тёмная", icon: "moon" },
  { id: "blue", label: "Синяя", icon: "droplets" },
  { id: "black", label: "Чёрная", icon: "circle" },
] as const;