"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  UtensilsCrossed,
  BookOpen,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MoreMenu } from "./more-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "홈", icon: Home },
  { href: "/schedule", label: "일정", icon: CalendarDays },
  { href: "/food", label: "맛집", icon: UtensilsCrossed },
  { href: "/journal", label: "일기", icon: BookOpen },
  { href: "/learn", label: "학습", icon: GraduationCap },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around safe-bottom">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 min-w-[48px] min-h-[48px] justify-center transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "fill-primary/20")}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger
            render={
              <button className="flex flex-col items-center gap-1 px-3 py-2 min-w-[48px] min-h-[48px] justify-center text-muted-foreground hover:text-foreground transition-colors" />
            }
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">더보기</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <MoreMenu />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
