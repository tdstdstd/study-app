"use client";

import { create } from "zustand";

export type SessionPhase = "idle" | "selecting" | "running" | "paused" | "completed";

interface StatusLogEntry {
  label: string;
  emoji?: string;
  timestamp: number; // seconds from start
}

interface SessionStore {
  phase: SessionPhase;
  subjectId: string | null;
  subjectName: string | null;
  serverSessionId: string | null;
  elapsedSeconds: number;
  pauseSeconds: number;
  statusLogs: StatusLogEntry[];
  currentStatus: string | null;

  setPhase: (phase: SessionPhase) => void;
  setSubject: (id: string, name: string) => void;
  setServerSessionId: (id: string) => void;
  tick: () => void;
  tickPause: () => void;
  addStatusLog: (label: string, emoji?: string) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  phase: "idle",
  subjectId: null,
  subjectName: null,
  serverSessionId: null,
  elapsedSeconds: 0,
  pauseSeconds: 0,
  statusLogs: [],
  currentStatus: null,

  setPhase: (phase) => set({ phase }),
  setSubject: (id, name) => set({ subjectId: id, subjectName: name }),
  setServerSessionId: (id) => set({ serverSessionId: id }),
  tick: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
  tickPause: () => set((s) => ({ pauseSeconds: s.pauseSeconds + 1 })),
  addStatusLog: (label, emoji) => {
    const elapsed = get().elapsedSeconds;
    set((s) => ({
      statusLogs: [...s.statusLogs, { label, emoji, timestamp: elapsed }],
      currentStatus: label,
    }));
  },
  reset: () =>
    set({
      phase: "idle",
      subjectId: null,
      subjectName: null,
      serverSessionId: null,
      elapsedSeconds: 0,
      pauseSeconds: 0,
      statusLogs: [],
      currentStatus: null,
    }),
}));