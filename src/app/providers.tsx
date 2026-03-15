"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { initTheme } from "@/stores/theme-store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initTheme();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}