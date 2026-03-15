"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { SESSION_CONSTRAINTS } from "@/lib/constants";
import { getRandomQuote } from "@/lib/quotes";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function startSession(subjectId: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  // Проверяем, что предмет принадлежит пользователю
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId: user.id },
  });
  if (!subject) return { success: false, error: "Предмет не найден" };

  // Проверяем, что нет активной сессии
  const active = await prisma.session.findFirst({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
  });
  if (active) return { success: false, error: "У вас уже есть активная сессия" };

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      subjectId,
      startTime: new Date(),
      status: "ACTIVE",
    },
  });

  return { success: true, data: { id: session.id } };
}

export async function pauseSession(sessionId: string): Promise<ActionResult> {
  const user = await requireUser();

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: "ACTIVE" },
  });
  if (!session) return { success: false, error: "Сессия не найдена" };

  await prisma.$transaction([
    prisma.session.update({
      where: { id: sessionId },
      data: { status: "PAUSED" },
    }),
    prisma.sessionPauseLog.create({
      data: { sessionId, pausedAt: new Date() },
    }),
  ]);

  return { success: true, data: undefined };
}

export async function resumeSession(sessionId: string): Promise<ActionResult> {
  const user = await requireUser();

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: "PAUSED" },
  });
  if (!session) return { success: false, error: "Сессия не найдена" };

  // Закрываем последний PauseLog
  const lastPause = await prisma.sessionPauseLog.findFirst({
    where: { sessionId, resumedAt: null },
    orderBy: { pausedAt: "desc" },
  });

  if (lastPause) {
    await prisma.sessionPauseLog.update({
      where: { id: lastPause.id },
      data: { resumedAt: new Date() },
    });
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "ACTIVE" },
  });

  return { success: true, data: undefined };
}

export async function completeSession(
  sessionId: string,
  note?: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: { in: ["ACTIVE", "PAUSED"] } },
    include: { pauseLogs: true },
  });
  if (!session) return { success: false, error: "Сессия не найдена" };

  const now = new Date();

  // Если была на паузе — закрываем последний PauseLog
  if (session.status === "PAUSED") {
    const lastPause = await prisma.sessionPauseLog.findFirst({
      where: { sessionId, resumedAt: null },
      orderBy: { pausedAt: "desc" },
    });
    if (lastPause) {
      await prisma.sessionPauseLog.update({
        where: { id: lastPause.id },
        data: { resumedAt: now },
      });
    }
  }

  // Пересчитываем паузы
  const pauseLogs = await prisma.sessionPauseLog.findMany({
    where: { sessionId },
  });

  let totalPauseMs = 0;
  for (const p of pauseLogs) {
    const end = p.resumedAt || now;
    totalPauseMs += end.getTime() - p.pausedAt.getTime();
  }

  const totalMs = now.getTime() - session.startTime.getTime();
  const activeDurationSec = Math.max(0, Math.floor((totalMs - totalPauseMs) / 1000));
  const totalPauseSec = Math.floor(totalPauseMs / 1000);

  // Антифрод: валидация
  if (activeDurationSec < SESSION_CONSTRAINTS.MIN_DURATION_SECONDS) {
    // Отменяем слишком короткую сессию
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "CANCELLED", endTime: now },
    });
    return { success: false, error: "Сессия слишком короткая (минимум 1 минута)" };
  }

  if (activeDurationSec > SESSION_CONSTRAINTS.MAX_DURATION_SECONDS) {
    return { success: false, error: "Длительность сессии превышает 24 часа" };
  }

  const quote = getRandomQuote();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      endTime: now,
      duration: activeDurationSec,
      totalPauseTime: totalPauseSec,
      status: "COMPLETED",
      note: note?.slice(0, 2000) || null,
      quoteText: `${quote.text}${quote.author ? ` — ${quote.author}` : ""}`,
    },
  });

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true, data: { id: sessionId } };
}

export async function cancelSession(sessionId: string): Promise<ActionResult> {
  const user = await requireUser();

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: { in: ["ACTIVE", "PAUSED"] } },
  });
  if (!session) return { success: false, error: "Сессия не найдена" };

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CANCELLED", endTime: new Date() },
  });

  return { success: true, data: undefined };
}

export async function addSessionStatus(
  sessionId: string,
  label: string
): Promise<ActionResult> {
  const user = await requireUser();

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: { in: ["ACTIVE", "PAUSED"] } },
  });
  if (!session) return { success: false, error: "Сессия не найдена" };

  await prisma.sessionStatusLog.create({
    data: { sessionId, label },
  });

  return { success: true, data: undefined };
}

export async function getSessionById(sessionId: string) {
  const user = await requireUser();
  return prisma.session.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      subject: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      statusLogs: { orderBy: { timestamp: "asc" } },
      pauseLogs: { orderBy: { pausedAt: "asc" } },
    },
  });
}

export async function getUserSessions(params?: {
  subjectId?: string;
  limit?: number;
  offset?: number;
}) {
  const user = await requireUser();
  return prisma.session.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
      ...(params?.subjectId ? { subjectId: params.subjectId } : {}),
    },
    include: {
      subject: true,
    },
    orderBy: { createdAt: "desc" },
    take: params?.limit || 50,
    skip: params?.offset || 0,
  });
}

export async function updateSessionImage(sessionId: string, imageUrl: string): Promise<ActionResult> {
  const user = await requireUser();

  const session = await prisma.session.findFirst({
  where: { id: sessionId, userId: user.id, status: { in: ["ACTIVE", "PAUSED"] } },
  include: { pauseLogs: true },
});
  if (!session) return { success: false, error: "Сессия не найдена" };

  await prisma.session.update({
    where: { id: sessionId },
    data: { imageUrl },
  });

  return { success: true, data: undefined };
}