import { getProfile, getStats } from "@/actions/profile";
import { Header } from "@/components/layout/Header";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatDuration, formatDate } from "@/lib/utils";
import { ProfileEditor } from "./editor";
import { Heatmap } from "@/components/stats/Heatmap";

export default async function ProfilePage() {
  const [profile, stats] = await Promise.all([getProfile(), getStats()]);

  if (!profile) return null;

  return (
    <div>
      <Header title="Профиль" />

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent">
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-text-muted">{profile.email}</p>
            <p className="text-xs text-text-muted">С нами с {formatDate(profile.createdAt)}</p>
          </div>
        </div>

        <ProfileEditor name={profile.name || ""} />
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Общее время", value: formatDuration(stats.totalDuration) },
          { label: "Всего сессий", value: stats.totalSessions.toString() },
          { label: "Рекорд", value: formatDuration(stats.longestSession) },
          { label: "Среднее", value: formatDuration(stats.averageDuration) },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="text-lg font-bold mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="mb-6">
        <CardTitle>Календарь активности</CardTitle>
        <div className="mt-4">
          <Heatmap data={stats.dailyStats} />
        </div>
      </Card>

      {/* Subject Stats */}
      {stats.subjectStats.length > 0 && (
        <Card>
          <CardTitle>Статистика по предметам</CardTitle>
          <div className="mt-4 space-y-4">
            {stats.subjectStats
              .sort((a, b) => b.totalDuration - a.totalDuration)
              .map((s) => (
                <div key={s.subjectId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: s.subjectColor }}
                    />
                    <div>
                      <p className="font-medium text-sm">{s.subjectName}</p>
                      <p className="text-xs text-text-muted">{s.sessionsCount} сессий</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold">
                    {formatDuration(s.totalDuration)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}