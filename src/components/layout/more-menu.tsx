"use client";

import Link from "next/link";
import { Wallet, CheckSquare, Settings, Landmark } from "lucide-react";

const MORE_ITEMS = [
  { href: "/attractions", label: "명소", icon: Landmark, description: "관광 명소 추천" },
  { href: "/expense", label: "가계부", icon: Wallet, description: "여행 지출 관리" },
  { href: "/checklist", label: "준비물", icon: CheckSquare, description: "여행 준비 체크리스트" },
  { href: "/settings", label: "설정", icon: Settings, description: "앱 설정" },
] as const;

export function MoreMenu() {
  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold mb-4 px-2">더보기</h3>
      <div className="space-y-1">
        {MORE_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
