import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const passwordHash = await bcrypt.hash("demo123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@studytracker.app" },
    update: {},
    create: {
      email: "demo@studytracker.app",
      name: "Demo User",
      passwordHash,
    },
  });

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: { userId: user.id, name: "Математика", color: "#6366f1", icon: "calculator" },
    }),
    prisma.subject.create({
      data: { userId: user.id, name: "Программирование", color: "#22c55e", icon: "code" },
    }),
    prisma.subject.create({
      data: { userId: user.id, name: "Английский", color: "#f59e0b", icon: "globe" },
    }),
  ]);

  // Create some sessions
  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    const subj = subjects[i % subjects.length];
    const duration = 1800 + Math.floor(Math.random() * 5400); // 30 min to 2 hours
    const startTime = new Date(now - (i + 1) * 86400000 + Math.random() * 36000000);
    const endTime = new Date(startTime.getTime() + duration * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        subjectId: subj.id,
        startTime,
        endTime,
        duration,
        totalPauseTime: Math.floor(Math.random() * 300),
        status: "COMPLETED",
        note: i % 3 === 0 ? "Продуктивная сессия, разобрал новую тему." : null,
        quoteText: "Дорогу осилит идущий. — Древняя пословица",
      },
    });
  }

  // Seed quotes
  const quotes = [
    { text: "Образование — самое мощное оружие.", author: "Нельсон Мандела" },
    { text: "Знание — сила.", author: "Фрэнсис Бэкон" },
    { text: "Учиться никогда не поздно." },
  ];

  for (const q of quotes) {
    await prisma.quote.create({ data: q });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());