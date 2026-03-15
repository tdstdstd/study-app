import type { ExportOptions, ExportStrategy } from "./types";
import { formatDuration } from "../utils";

export const markdownExporter: ExportStrategy = {
  extension: "md",
  mimeType: "text/markdown",

  generate(options: ExportOptions): string {
    const lines: string[] = [];

    lines.push(`# Учебный отчёт — ${options.userName}`);
    lines.push(`*Экспортировано: ${new Date().toLocaleDateString("ru-RU")}*`);
    lines.push("");

    if (options.stats) {
      lines.push("## 📊 Общая статистика");
      lines.push("");
      lines.push(`| Показатель | Значение |`);
      lines.push(`|---|---|`);
      lines.push(`| Общее время | ${formatDuration(options.stats.totalDuration)} |`);
      lines.push(`| Всего сессий | ${options.stats.totalSessions} |`);
      lines.push(`| Рекорд | ${formatDuration(options.stats.longestSession)} |`);
      lines.push(`| Среднее время | ${formatDuration(options.stats.averageDuration)} |`);
      lines.push("");
    }

    lines.push("## 📝 Сессии");
    lines.push("");
    lines.push("| Дата | Предмет | Длительность |");
    lines.push("|---|---|---|");

    for (const s of options.sessions) {
      const row = `| ${s.date} | ${s.subjectName} | ${formatDuration(s.duration)} |`;
      lines.push(row);
    }

    if (options.includeNotes) {
      const withNotes = options.sessions.filter((s) => s.note);
      if (withNotes.length > 0) {
        lines.push("");
        lines.push("## 💬 Заметки");
        lines.push("");
        for (const s of withNotes) {
          lines.push(`### ${s.date} — ${s.subjectName}`);
          lines.push(s.note!);
          lines.push("");
        }
      }
    }

    return lines.join("\n");
  },
};