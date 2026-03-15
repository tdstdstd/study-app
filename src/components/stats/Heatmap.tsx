"use client";

import type { DailyStats } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  data: DailyStats[];
}

export function Heatmap({ data }: Props) {
  // Генерируем последние 90 дней
  const days: { date: string; level: number; duration: number }[] = [];
  const dataMap = new Map(data.map((d) => [d.date, d.totalDuration]));
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const duration = dataMap.get(dateStr) || 0;

    let level = 0;
    if (duration > 0) level = 1;
    if (duration > 1800) level = 2;  // > 30 мин
    if (duration > 3600) level = 3;  // > 1 час
    if (duration > 7200) level = 4;  // > 2 часа

    days.push({ date: dateStr, level, duration });
  }

  const levelColors = [
    "bg-bg-tertiary",
    "bg-accent/20",
    "bg-accent/40",
    "bg-accent/60",
    "bg-accent",
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {days.map((d) => (
          <div
            key={d.date}
            className={cn(
              "w-3 h-3 rounded-sm transition-colors",
              levelColors[d.level]
            )}
            title={`${d.date}: ${Math.round(d.duration / 60)} мин`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
        <span>Меньше</span>
        {levelColors.map((c, i) => (
          <div key={i} className={cn("w-3 h-3 rounded-sm", c)} />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
}