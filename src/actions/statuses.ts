"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { customStatusSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";

export async function getCustomStatuses() {
  const user = await requireUser();
  return prisma.customStatus.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function createCustomStatus(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = customStatusSchema.safeParse({
    label: formData.get("label"),
    emoji: formData.get("emoji") || undefined,
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    await prisma.customStatus.create({
    data: {
      label: parsed.data.label,
      emoji: parsed.data.emoji,
      user: { connect: { id: user.id } },
    },
  });

  return { success: true, data: undefined };
}

export async function deleteCustomStatus(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const status = await prisma.customStatus.findFirst({
    where: { id, userId: user.id },
  });
  if (!status) return { success: false, error: "Статус не найден" };

  await prisma.customStatus.delete({ where: { id } });
  return { success: true, data: undefined };
}