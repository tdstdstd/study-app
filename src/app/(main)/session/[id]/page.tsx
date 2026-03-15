import { notFound } from "next/navigation";
import { Clock, Calendar, Pause, MessageSquare, Quote } from "lucide-react";
import { getSessionById } from "@/actions/sessions";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { formatDuration, formatDateTime, formatTimerDisplay } from "@/lib/utils";
import { SessionImageUpload } from "./image-upload";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = await getSessionById(params.id);
  if (!session) notFound();

  return (
    <div>
      <Header title="Детали сессии" />

      {/* Result Card */}
      <Card className="mb-6 relative overflow-hidden">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: session.subject.color }}
        />

        <div className="flex flex-col lg:flex-row gap-6 pt-2">
          {/* Left */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: session.subject.color }}
              >
                📚
              </div>
              <div>
                <h2 className="text-xl font-bold">{session.subject.name}</h2>
                <p className="text-sm text-text-muted">{session.user.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Длительность</p>
                  <p className="font-semibold">{formatDuration(session.duration || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Дата</p>
                  <p className="font-semibold">{formatDateTime(session.createdAt)}</p>
                </div>
              </div>
              {session.totalPauseTime > 0 && (
                <div className="flex items-center gap-2">
                  <Pause size={16} className="text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Паузы</p>
                    <p className="font-semibold">{formatDuration(session.totalPauseTime)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quote */}
            {session.quoteText && (
              <div className="p-4 rounded-lg bg-accent-muted border border-accent/20">
                <div className="flex items-start gap-2">
                  <Quote size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm italic text-text-secondary">{session.quoteText}</p>
                </div>
              </div>
            )}

            {/* Note */}
            {session.note && (
              <div className="p-4 rounded-lg bg-bg-tertiary">
                <div className="flex items-start gap-2">
                  <MessageSquare size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-secondary">{session.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right - Image */}
          <div className="lg:w-64">
            <SessionImageUpload
              sessionId={session.id}
              currentImage={session.imageUrl}
            />
          </div>
        </div>
      </Card>

      {/* Status Log */}
      {session.statusLogs.length > 0 && (
        <Card>
          <CardTitle>Хронология статусов</CardTitle>
          <div className="mt-4 space-y-2">
            {session.statusLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary"
              >
                <span className="text-xs text-text-muted font-mono w-20">
                  {formatDateTime(log.timestamp)}
                </span>
                <Badge>{log.label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}