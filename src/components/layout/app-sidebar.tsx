"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  UtensilsCrossed,
  BookOpen,
  GraduationCap,
  Wallet,
  CheckSquare,
  Settings,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTripConfig } from "@/hooks/use-trip-config";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "홈", icon: Home },
  { href: "/schedule", label: "일정", icon: CalendarDays },
  { href: "/food", label: "맛집", icon: UtensilsCrossed },
  { href: "/journal", label: "일기", icon: BookOpen },
  { href: "/learn", label: "학습", icon: GraduationCap },
  { href: "/expense", label: "가계부", icon: Wallet },
  { href: "/checklist", label: "준비물", icon: CheckSquare },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { getTripName } = useTripConfig();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r bg-sidebar">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Plane className="h-6 w-6 text-primary" />
        <h1 className="font-bold text-lg truncate">{getTripName()}</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
