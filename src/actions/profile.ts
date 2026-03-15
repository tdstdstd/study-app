"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";
import type { ActionResult, OverallStats } from "@/types";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const user = await requireUser();
  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      theme: true,
      createdAt: true,
    },
  });
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/profile");
  return { success: true, data: undefined };
}

export async function updateUserTheme(theme: string): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { theme } });
  return { success: true, data: undefined };
}

export async function getStats(): Promise<OverallStats> {
  const user = await requireUser();

  const sessions = await prisma.session.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });

  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalSessions = sessions.length;
  const longestSession = sessions.reduce((max, s) => Math.max(max, s.duration || 0), 0);
  const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

  // Subject stats
  const subjectMap = new Map<string, { name: string; color: string; duration: number; count: number }>();
  for (const s of sessions) {
    const existing = subjectMap.get(s.subjectId) || {
      name: s.subject.name,
      color: s.subject.color,
      duration: 0,
      count: 0,
    };
    existing.duration += s.duration || 0;
    existing.count += 1;
    subjectMap.set(s.subjectId, existing);
  }

  const subjectStats = Array.from(subjectMap.entries()).map(([id, v]) => ({
    subjectId: id,
    subjectName: v.name,
    subjectColor: v.color,
    totalDuration: v.duration,
    sessionsCount: v.count,
  }));

  // Daily stats (last 90 days)
  const dailyMap = new Map<string, { duration: number; count: number }>();
  for (const s of sessions) {
    const day = s.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(day) || { duration: 0, count: 0 };
    existing.duration += s.duration || 0;
    existing.count += 1;
    dailyMap.set(day, existing);
  }

  const dailyStats = Array.from(dailyMap.entries())
    .map(([date, v]) => ({
      date,
      totalDuration: v.duration,
      sessionsCount: v.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  const checkDate = new Date();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dailyMap.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr === today) {
      // Сегодня ещё нет сессии — проверяем вчера
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalDuration,
    totalSessions,
    longestSession,
    averageDuration,
    currentStreak,
    subjectStats,
    dailyStats,
  };
}