import type { ExportOptions, ExportStrategy } from "./types";
import { formatDuration } from "../utils";

// Генерация PDF на клиенте через jsPDF
// Этот модуль возвращает данные для клиентской генерации
export const pdfExporter: ExportStrategy = {
  extension: "pdf",
  mimeType: "application/pdf",

  async generate(options: ExportOptions): Promise<string> {
    // Возвращаем JSON-строку для передачи на клиент
    // Клиент использует jsPDF для финальной генерации
    return JSON.stringify(options);
  },
};

// Клиентская функция генерации PDF
export async function generatePdfClient(options: ExportOptions): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`Учебный отчёт — ${options.userName}`, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Экспортировано: ${new Date().toLocaleDateString("ru-RU")}`, 14, 28);

  let yPos = 35;

  // Stats
  if (options.stats) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Общая статистика", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Показатель", "Значение"]],
      body: [
        ["Общее время", formatDuration(options.stats.totalDuration)],
        ["Всего сессий", options.stats.totalSessions.toString()],
        ["Рекорд", formatDuration(options.stats.longestSession)],
        ["Среднее время", formatDuration(options.stats.averageDuration)],
      ],
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Sessions table
  doc.setFontSize(14);
  doc.text("Сессии", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Дата", "Предмет", "Длительность"]],
    body: options.sessions.map((s) => [s.date, s.subjectName, formatDuration(s.duration)]),
    theme: "grid",
    headStyles: { fillColor: [99, 102, 241] },
  });

  return doc.output("blob");
}