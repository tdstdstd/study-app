export interface ExportOptions {
  format: "md" | "pdf" | "csv" | "json"; // Расширяемый список
  sessions: ExportSession[];
  stats?: ExportStatsData;
  includeNotes: boolean;
  userName: string;
}

export interface ExportSession {
  subjectName: string;
  subjectColor: string;
  duration: number;
  date: string;
  note?: string | null;
}

export interface ExportStatsData {
  totalDuration: number;
  totalSessions: number;
  longestSession: number;
  averageDuration: number;
}

// Стратегия для расширяемости
export interface ExportStrategy {
  generate(options: ExportOptions): string | Uint8Array | Promise<string | Uint8Array>;
  mimeType: string;
  extension: string;
}