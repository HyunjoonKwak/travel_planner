"use client";

import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";
import { useTripConfig } from "@/hooks/use-trip-config";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "홈",
  "/schedule": "일정",
  "/food": "맛집",
  "/journal": "일기",
  "/learn": "학습",
  "/expense": "가계부",
  "/checklist": "준비물",
  "/settings": "설정",
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path)) {
      return title;
    }
  }
  return "";
}

export function Header() {
  const pathname = usePathname();
  const { getTripName } = useTripConfig();
  const pageTitle = getPageTitle(pathname);
  const displayTitle = pageTitle || getTripName();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-12 items-center justify-between px-4 safe-top">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-base truncate">{displayTitle}</h1>
        </div>
      </div>
    </header>
  );
}
