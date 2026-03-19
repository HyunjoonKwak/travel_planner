"use client";

import { Star, MapPin, ExternalLink, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SavedAttraction {
  readonly placeId: string;
  readonly name: string;
  readonly nameJa: string;
  readonly address: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly city: string;
  readonly cityName: string;
  readonly googleMapsUrl?: string;
  readonly openNow?: boolean;
  readonly lat?: number;
  readonly lng?: number;
  readonly source: "recommendation" | "user";
}

interface AttractionCardProps {
  attraction: SavedAttraction;
  onSchedule: (a: SavedAttraction) => void;
  scheduled: boolean;
}

export function AttractionCard({
  attraction,
  onSchedule,
  scheduled,
}: AttractionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-sm truncate">
                {attraction.name}
              </span>
              {attraction.openNow !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1 py-0 shrink-0",
                    attraction.openNow
                      ? "text-green-600 border-green-300"
                      : "text-muted-foreground"
                  )}
                >
                  {attraction.openNow ? "영업중" : "영업종료"}
                </Badge>
              )}
            </div>
            {attraction.nameJa && attraction.nameJa !== attraction.name && (
              <p className="text-xs text-muted-foreground">
                {attraction.nameJa}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {attraction.cityName}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
          {attraction.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {attraction.rating.toFixed(1)}
              </span>
              {attraction.reviewCount > 0 && (
                <span>({attraction.reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-1 mb-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{attraction.address}</span>
        </div>

        <div className="flex gap-2">
          {attraction.googleMapsUrl && (
            <a
              href={attraction.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                지도 보기
              </Button>
            </a>
          )}
          <Button
            variant={scheduled ? "secondary" : "default"}
            size="sm"
            className="flex-1 h-7 text-xs gap-1"
            onClick={() => onSchedule(attraction)}
          >
            <CalendarPlus className="h-3 w-3" />
            {scheduled ? "날짜 선택" : "일정에 추가"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AttractionSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-7 flex-1 bg-muted rounded animate-pulse" />
          <div className="h-7 flex-1 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
