"use client";

import { Star, MapPin, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FoodSpot } from "@/types/food";
import { FOOD_CATEGORY_CONFIG } from "@/types/food";

interface FoodCardProps {
  spot: FoodSpot;
  onClick: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export function FoodCard({ spot, onClick }: FoodCardProps) {
  const config = FOOD_CATEGORY_CONFIG[spot.category];

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md active:scale-[0.98]",
        spot.visited && "opacity-70"
      )}
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-semibold text-sm leading-tight truncate">
                {spot.name}
              </span>
              {spot.visited && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                  방문완료
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{spot.nameJa}</p>
          </div>
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shrink-0">
            {config.icon} {config.label}
          </Badge>
        </div>

        {spot.award && (
          <div className="flex items-center gap-1 mb-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1">
            <Trophy className="h-3 w-3 shrink-0" />
            <span className="truncate">{spot.award}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{spot.area}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {spot.googleRating !== undefined && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                <span>Google {spot.googleRating.toFixed(1)}</span>
                {spot.googleReviewCount !== undefined && (
                  <span className="text-muted-foreground">
                    ({spot.googleReviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}
            <StarRating rating={spot.rating} />
          </div>
        </div>

        <div className="mt-2 text-xs font-medium text-foreground">
          {spot.priceRange}
        </div>

        {spot.recommendedMenu.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {spot.recommendedMenu.slice(0, 2).map((menu) => (
              <span
                key={menu.nameJa}
                className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
              >
                {menu.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
