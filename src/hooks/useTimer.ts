"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/session-store";

export function useTimer() {
  const phase = useSessionStore((s) => s.phase);
  const tick = useSessionStore((s) => s.tick);
  const tickPause = useSessionStore((s) => s.tickPause);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (phase === "running") {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else if (phase === "paused") {
      intervalRef.current = setInterval(() => tickPause(), 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, tick, tickPause]);
}