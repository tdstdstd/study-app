import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markdownExporter } from "@/lib/export/markdown";
import type { ExportOptions, ExportSession, ExportStatsData } from "@/lib/export/types";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl.searchParams;
  const format = url.get("format") || "md";
  const includeStats = url.get("includeStats") !== "false";
  const includeNotes = url.get("includeNotes") !== "false";
  const subjectIdsRaw = url.get("subjectIds");
  const dateFrom = url.get("dateFrom");
  const dateTo = url.get("dateTo");

  const subjectIds = subjectIdsRaw ? subjectIdsRaw.split(",") : undefined;

  // Fetch sessions
  const sessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
      ...(subjectIds ? { subjectId: { in: subjectIds } } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
            },
          }
        : {}),
    },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });

  const exportSessions: ExportSession[] = sessions.map((s) => ({
    subjectName: s.subject.name,
    subjectColor: s.subject.color,
    duration: s.duration || 0,
    date: formatDate(s.createdAt),
    note: s.note,
  }));

  let stats: ExportStatsData | undefined;
  if (includeStats) {
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const longestSession = sessions.reduce((max, s) => Math.max(max, s.duration || 0), 0);
    stats = {
      totalDuration,
      totalSessions: sessions.length,
      longestSession,
      averageDuration: sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
    };
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  const options: ExportOptions = {
    format: format as any,
    sessions: exportSessions,
    stats,
    includeNotes,
    userName: profile?.name || "Пользователь",
  };

  if (format === "md") {
    const content = markdownExporter.generate(options) as string;
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="study-report.md"',
      },
    });
  }

  // Для PDF — возвращаем JSON для клиентской генерации
  return NextResponse.json(options);
}