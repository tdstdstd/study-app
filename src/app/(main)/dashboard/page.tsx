import { Timer, BookOpen, TrendingUp, Flame } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { getStats } from "@/actions/profile";
import { getUserSessions } from "@/actions/sessions";
import { formatDuration, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, recentSessions] = await Promise.all([
    getStats(),
    getUserSessions({ limit: 5 }),
  ]);

  const statCards = [
    {
      label: "Общее время",
      value: formatDuration(stats.totalDuration),
      icon: Timer,
      color: "#6366f1",
    },
    {
      label: "Сессий",
      value: stats.totalSessions.toString(),
      icon: BookOpen,
      color: "#22c55e",
    },
    {
      label: "Рекорд",
      value: formatDuration(stats.longestSession),
      icon: TrendingUp,
      color: "#f59e0b",
    },
    {
      label: "Серия дней",
      value: `${stats.currentStreak} дн.`,
      icon: Flame,
      color: "#ef4444",
    },
  ];

  return (
    <div>
      <Header title="Главная" description="Обзор вашей учебной активности" />

      {/* Quick Start */}
      <Card className="mb-8 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold">Готов учиться?</h2>
            <p className="text-sm text-text-secondary mt-1">Запусти новую сессию прямо сейчас</p>
          </div>
          <Link href="/session">
            <Button size="lg">
              <Timer size={20} />
              Начать сессию
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${s.color}20` }}
              >
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Subject Distribution */}
      {stats.subjectStats.length > 0 && (
        <Card className="mb-8">
          <CardTitle>Время по предметам</CardTitle>
          <div className="mt-4 space-y-3">
            {stats.subjectStats.map((s) => {
              const pct = stats.totalDuration > 0
                ? Math.round((s.totalDuration / stats.totalDuration) * 100)
                : 0;
              return (
                <div key={s.subjectId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: s.subjectColor }}
                      />
                      {s.subjectName}
                    </span>
                    <span className="text-text-muted">
                      {formatDuration(s.totalDuration)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: s.subjectColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Последние сессии</CardTitle>
          <Link href="/history" className="text-sm text-accent hover:underline">
            Все →
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">Пока нет завершённых сессий</p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/session/${s.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: s.subject.color }}
                  />
                  <div>
                    <p className="text-sm font-medium">{s.subject.name}</p>
                    <p className="text-xs text-text-muted">{formatDateTime(s.createdAt)}</p>
                  </div>
                </div>
                <Badge color={s.subject.color}>{formatDuration(s.duration || 0)}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}