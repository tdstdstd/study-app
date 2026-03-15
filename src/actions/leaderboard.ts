"use server";

import { prisma } from "@/lib/prisma";
import { SESSION_CONSTRAINTS } from "@/lib/constants";
import type { LeaderboardEntry } from "@/types";

export async function getLeaderboard(params?: {
  period?: "all" | "day" | "week" | "month";
  limit?: number;
}): Promise<LeaderboardEntry[]> {
  const limit = params?.limit || 50;

  let dateFilter: Date | undefined;
  const now = new Date();

  switch (params?.period) {
    case "day":
      dateFilter = new Date(now.getTime() - 86400000);
      break;
    case "week":
      dateFilter = new Date(now.getTime() - 7 * 86400000);
      break;
    case "month":
      dateFilter = new Date(now.getTime() - 30 * 86400000);
      break;
  }

  const sessions = await prisma.session.findMany({
    where: {
      status: "COMPLETED",
      duration: {
        gte: SESSION_CONSTRAINTS.MIN_DURATION_SECONDS,
        lte: SESSION_CONSTRAINTS.MAX_DURATION_SECONDS,
      },
      ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
    },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      subject: { select: { name: true, color: true } },
    },
    orderBy: { duration: "desc" },
    take: limit,
  });

  return sessions.map((s) => ({
    id: s.id,
    userName: s.user.name || "Аноним",
    userAvatar: s.user.avatarUrl,
    subjectName: s.subject.name,
    subjectColor: s.subject.color,
    duration: s.duration || 0,
    date: s.createdAt,
  }));
}