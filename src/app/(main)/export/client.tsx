"use client";

import { useState } from "react";
import { Download, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Props {
  subjects: { id: string; name: string }[];
}

export function ExportClient({ subjects }: Props) {
  const [format, setFormat] = useState<"md" | "pdf">("md");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleExport() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        format,
        includeStats: includeStats.toString(),
        includeNotes: includeNotes.toString(),
      });
      if (selectedSubjects.length > 0) {
        params.set("subjectIds", selectedSubjects.join(","));
      }
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/export?${params}`);

      if (format === "md") {
        const text = await res.text();
        downloadFile(text, "study-report.md", "text/markdown");
      } else {
        // PDF — генерация на клиенте
        const data = await res.json();
        const { generatePdfClient } = await import("@/lib/export/pdf");
        const blob = await generatePdfClient(data);
        downloadBlob(blob, "study-report.pdf");
      }
    } catch (e) {
      console.error("Export error:", e);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Format */}
      <Card>
        <CardTitle>Формат</CardTitle>
        <div className="flex gap-3 mt-4">
          {[
            { id: "md" as const, label: "Markdown", icon: FileText },
            { id: "pdf" as const, label: "PDF", icon: File },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all",
                format === f.id
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-text-secondary hover:border-text-muted"
              )}
            >
              <f.icon size={20} />
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <CardTitle>Фильтры</CardTitle>
        <div className="mt-4 space-y-4">
          {/* Subjects */}
          {subjects.length > 0 && (
            <div>
              <label className="text-sm font-medium text-text-secondary">
                Предметы (пусто = все)
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-all",
                      selectedSubjects.includes(s.id)
                        ? "border-accent bg-accent-muted text-accent"
                        : "border-border text-text-secondary"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">От</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">До</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Include options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Включить статистику</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Включить заметки</span>
            </label>
          </div>
        </div>
      </Card>

      <Button size="lg" onClick={handleExport} loading={loading}>
        <Download size={20} />
        Скачать {format.toUpperCase()}
      </Button>
    </div>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}