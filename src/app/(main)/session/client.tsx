"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Square, X, MessageSquare } from "lucide-react";
import { useSessionStore } from "@/stores/session-store";
import { useTimer } from "@/hooks/useTimer";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
  addSessionStatus,
} from "@/actions/sessions";
import { DEFAULT_STATUSES } from "@/lib/constants";
import { formatTimerDisplay, cn } from "@/lib/utils";

interface Props {
  subjects: { id: string; name: string; color: string; icon: string }[];
  customStatuses: { id: string; label: string; emoji: string | null }[];
}

export function SessionClient({ subjects, customStatuses }: Props) {
  const store = useSessionStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useTimer();

  const allStatuses = [
    ...DEFAULT_STATUSES,
    ...customStatuses.map((s) => ({ label: s.label, emoji: s.emoji || "📌" })),
  ];

  const handleStart = useCallback(async (subjectId: string, subjectName: string) => {
    setLoading(true);
    setError("");
    const result = await startSession(subjectId);
    if (result.success) {
      store.setSubject(subjectId, subjectName);
      store.setServerSessionId(result.data.id);
      store.setPhase("running");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [store]);


  const handlePause = useCallback(async () => {
    if (!store.serverSessionId) return;
    await pauseSession(store.serverSessionId);
    store.setPhase("paused");
  }, [store]);

  const handleResume = useCallback(async () => {
    if (!store.serverSessionId) return;
    await resumeSession(store.serverSessionId);
    store.setPhase("running");
  }, [store]);

  const handleCancel = useCallback(async () => {
    if (!store.serverSessionId) return;
    if (!confirm("Отменить сессию?")) return;
    await cancelSession(store.serverSessionId);
    store.reset();
  }, [store]);

  const handleComplete = useCallback(async () => {
  if (!store.serverSessionId) {
    setError("Нет активной сессии");
    return;
  }
  
  setLoading(true);
  setError("");
  
  try {
    const result = await completeSession(store.serverSessionId, note);
    
    console.log("Complete result:", result); // для отладки
    
    if (result.success) {
      store.setPhase("completed");
      store.reset();
      router.push(`/session/${result.data.id}`);
    } else {
      setError(result.error);
      console.error("Complete error:", result.error);
    }
  } catch (err) {
    console.error("Complete exception:", err);
    setError("Ошибка при завершении сессии");
  }
  
  setLoading(false);
  setShowComplete(false);
}, [store, note, router]);

  const handleStatusSelect = useCallback(async (label: string, emoji: string) => {
    if (!store.serverSessionId) return;
    store.addStatusLog(label, emoji);
    await addSessionStatus(store.serverSessionId, `${emoji} ${label}`);
  }, [store]);

  // === PHASE: idle — выбор предмета ===
  if (store.phase === "idle" || store.phase === "selecting") {
    if (subjects.length === 0) {
      return (
        <EmptyState
          title="Нет предметов"
          description="Сначала создайте хотя бы один предмет"
          action={
            <Button onClick={() => router.push("/subjects")}>Создать предмет</Button>
          }
        />
      );
    }

    return (
      <div>
        <CardTitle className="mb-4">Выберите предмет</CardTitle>
        {error && <p className="text-sm text-danger mb-4">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card
              key={s.id}
              hover
              onClick={() => handleStart(s.id, s.name)}
              className={cn("cursor-pointer", loading && "pointer-events-none opacity-50")}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: s.color }}
                >
                  📚
                </div>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-xs text-text-muted">Нажми чтобы начать</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // === PHASE: running / paused — таймер ===
  return (
    <div className="flex flex-col items-center">
      {/* Subject badge */}
      <div className="mb-8 text-center">
        <p className="text-sm text-text-muted mb-1">
          {store.phase === "paused" ? "На паузе" : "Идёт сессия"}
        </p>
        <h2 className="text-xl font-bold">{store.subjectName}</h2>
      </div>

      {/* Timer */}
      <div className="mb-8">
        <div
          className={cn(
            "timer-display text-6xl lg:text-8xl font-bold tracking-wider",
            store.phase === "paused" ? "text-text-muted animate-pulse" : "text-accent"
          )}
        >
          {formatTimerDisplay(store.elapsedSeconds)}
        </div>
        {store.pauseSeconds > 0 && (
          <p className="text-center text-sm text-text-muted mt-2">
            Пауза: {formatTimerDisplay(store.pauseSeconds)}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-10">
        {store.phase === "running" ? (
          <Button variant="secondary" size="lg" onClick={handlePause}>
            <Pause size={20} />
            Пауза
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={handleResume}>
            <Play size={20} />
            Продолжить
          </Button>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowComplete(true)}
        >
          <Square size={20} />
          Завершить
        </Button>

        <Button variant="ghost" size="lg" onClick={handleCancel}>
          <X size={20} />
        </Button>
      </div>

      {/* Status Picker */}
      <Card className="w-full max-w-lg">
        <CardTitle className="text-base mb-3">Как идёт процесс?</CardTitle>
        {store.currentStatus && (
          <p className="text-sm text-accent mb-3">Сейчас: {store.currentStatus}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <button
              key={s.label}
              onClick={() => handleStatusSelect(s.label, s.emoji)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border border-border transition-all",
                "hover:bg-accent-muted hover:border-accent",
                store.currentStatus === s.label && "bg-accent-muted border-accent text-accent"
              )}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Status log */}
        {store.statusLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2">История статусов:</p>
            <div className="space-y-1">
              {store.statusLogs.map((log, i) => (
                <p key={i} className="text-xs text-text-secondary">
                  <span className="text-text-muted">{formatTimerDisplay(log.timestamp)}</span>
                  {" — "}
                  {log.emoji} {log.label}
                </p>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Complete Modal */}
      <Modal open={showComplete} onClose={() => setShowComplete(false)} title="Завершить сессию">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Длительность: <strong>{formatTimerDisplay(store.elapsedSeconds)}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Заметка (необязательно)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary resize-none h-24 focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Что изучал, какие выводы..."
              maxLength={2000}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowComplete(false)}
            >
              Отмена
            </Button>
            <Button
              className="flex-1"
              loading={loading}
              onClick={handleComplete}
            >
              Завершить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}