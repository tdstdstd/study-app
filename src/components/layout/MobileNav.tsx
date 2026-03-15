"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Timer, BookOpen, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/session", label: "Сессия", icon: Timer },
  { href: "/subjects", label: "Предметы", icon: BookOpen },
  { href: "/leaderboard", label: "Топ", icon: Trophy },
  { href: "/profile", label: "Профиль", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-secondary lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors",
                isActive ? "text-accent" : "text-text-muted"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}