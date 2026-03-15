"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { subjectSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
  const user = await requireUser();
  return prisma.subject.findMany({
    where: { userId: user.id },
    include: { _count: { select: { sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSubject(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
    icon: formData.get("icon") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = subjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

    const subject = await prisma.subject.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      icon: parsed.data.icon,
      description: parsed.data.description,
      user: { connect: { id: user.id } },
    },
  });
  revalidatePath("/subjects");
  return { success: true, data: { id: subject.id } };
}

export async function updateSubject(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
    icon: formData.get("icon") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = subjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const subject = await prisma.subject.findFirst({
    where: { id, userId: user.id },
  });
  if (!subject) return { success: false, error: "Предмет не найден" };

  await prisma.subject.update({ where: { id }, data: parsed.data });
  revalidatePath("/subjects");
  return { success: true, data: undefined };
}

export async function deleteSubject(id: string): Promise<ActionResult> {
  const user = await requireUser();

  const subject = await prisma.subject.findFirst({
    where: { id, userId: user.id },
  });
  if (!subject) return { success: false, error: "Предмет не найден" };

  await prisma.subject.delete({ where: { id } });
  revalidatePath("/subjects");
  return { success: true, data: undefined };
}