import { Trophy, Clock, Calendar } from "lucide-react";
import { getLeaderboard } from "@/actions/leaderboard";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const entries = await getLeaderboard({ period: "all", limit: 50 });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <Header title="Лидерборд" description="Самые длинные учебные сессии" />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-text-muted font-medium py-3 px-2">#</th>
                <th className="text-left text-xs text-text-muted font-medium py-3 px-2">Пользователь</th>
                <th className="text-left text-xs text-text-muted font-medium py-3 px-2">Предмет</th>
                <th className="text-left text-xs text-text-muted font-medium py-3 px-2">
                  <Clock size={14} className="inline mr-1" />
                  Время
                </th>
                <th className="text-left text-xs text-text-muted font-medium py-3 px-2">
                  <Calendar size={14} className="inline mr-1" />
                  Дата
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-bg-tertiary transition-colors",
                    i < 3 && "bg-accent-muted/30"
                  )}
                >
                  <td className="py-3 px-2 text-lg">
                    {i < 3 ? medals[i] : <span className="text-sm text-text-muted">{i + 1}</span>}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm">
                        {entry.userName[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{entry.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge color={entry.subjectColor}>{entry.subjectName}</Badge>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-mono font-semibold text-accent">
                      {formatDuration(entry.duration)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-text-muted">
                    {formatDate(entry.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <p className="text-center py-8 text-text-muted">Пока нет записей в лидерборде</p>
        )}
      </Card>
    </div>
  );
}