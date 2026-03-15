import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(50),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Введите название").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Некорректный цвет"),
  icon: z.string().min(1),
  description: z.string().max(500).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(50),
});

export const sessionNoteSchema = z.object({
  note: z.string().max(2000).optional(),
});

export const customStatusSchema = z.object({
  label: z.string().min(1, "Введите название").max(50),
  emoji: z.string().max(4).optional(),
});

export const exportSchema = z.object({
  format: z.enum(["md", "pdf"]),
  subjectIds: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  includeStats: z.boolean().default(true),
  includeNotes: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
export type CustomStatusInput = z.infer<typeof customStatusSchema>;