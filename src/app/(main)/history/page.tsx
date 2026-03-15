import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { getUserSessions } from "@/actions/sessions";
import { getSubjects } from "@/actions/subjects";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDuration, formatDateTime } from "@/lib/utils";

export default async function HistoryPage() {
  const sessions = await getUserSessions({ limit: 100 });

  return (
    <div>
      <Header title="История сессий" description="Все ваши завершённые учебные сессии" />

      {sessions.length === 0 ? (
        <EmptyState
          title="Нет завершённых сессий"
          description="Начните первую учебную сессию"
          action={
            <Link href="/session">
              <button className="px-4 py-2 bg-accent text-white rounded-lg">
                Начать сессию
              </button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link key={s.id} href={`/session/${s.id}`}>
              <Card hover className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: s.subject.color }}
                  >
                    📚
                  </div>
                  <div>
                    <h3 className="font-medium">{s.subject.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={12} />
                        {formatDuration(s.duration || 0)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar size={12} />
                        {formatDateTime(s.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge color={s.subject.color}>{formatDuration(s.duration || 0)}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}