"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Timer, BookOpen, History,
  Trophy, User, Settings, Download, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/session", label: "Сессия", icon: Timer },
  { href: "/subjects", label: "Предметы", icon: BookOpen },
  { href: "/history", label: "История", icon: History },
  { href: "/leaderboard", label: "Лидерборд", icon: Trophy },
  { href: "/profile", label: "Профиль", icon: User },
  { href: "/export", label: "Экспорт", icon: Download },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-bg-secondary flex flex-col max-lg:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Timer size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary">StudyTracker</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-accent-muted text-accent"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border space-y-3">
        <ThemeSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-bg-tertiary transition-all w-full"
        >
          <LogOut size={20} />
          Выйти
        </button>
      </div>
    </aside>
  );
}