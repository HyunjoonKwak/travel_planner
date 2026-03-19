"use client";

import { useState } from "react";
import { MapPin, Clock, X, Volume2, Star, Trophy, ExternalLink, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/hooks/use-speech";
import type { FoodSpot } from "@/types/food";
import { FOOD_CATEGORY_CONFIG } from "@/types/food";

interface FoodDetailProps {
  spot: FoodSpot;
  onClose: () => void;
  onAddToSchedule?: (spot: FoodSpot) => void;
}

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} type="button">
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              n <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function FoodDetail({ spot, onClose, onAddToSchedule }: FoodDetailProps) {
  const { speak } = useSpeech();
  const [myRating, setMyRating] = useState(spot.myRating ?? 0);
  const [myReview, setMyReview] = useState(spot.myReview ?? "");
  const config = FOOD_CATEGORY_CONFIG[spot.category];

  function handleSpeak() {
    if (spot.orderPhrase) {
      speak(spot.orderPhrase);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-bold">{spot.name}</h2>
            <Badge variant="secondary">
              {config.icon} {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{spot.nameJa}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {spot.award && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
          <Trophy className="h-4 w-4 shrink-0" />
          <span>{spot.award}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{spot.area}</p>
            <p className="text-xs text-muted-foreground">{spot.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{spot.hours}</p>
            {spot.closedDay && (
              <p className="text-xs text-muted-foreground">휴무: {spot.closedDay}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.addressJa || spot.address)} ${encodeURIComponent(spot.nameJa)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-3 py-2.5 text-sm text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
        >
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="flex-1 font-medium">지도 보기</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
        {onAddToSchedule && (
          <Button
            variant="default"
            size="sm"
            className="h-auto gap-1.5 px-3"
            onClick={() => onAddToSchedule(spot)}
          >
            <CalendarPlus className="h-4 w-4" />
            일정에 추가
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{spot.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">/ 5.0</span>
        </div>
        <span className="text-sm font-medium">{spot.priceRange}</span>
      </div>

      {spot.googleRating !== undefined && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-3.5 w-3.5",
                      n <= Math.round(spot.googleRating!)
                        ? "fill-blue-500 text-blue-500"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {spot.googleRating.toFixed(1)}
              </span>
              {spot.googleReviewCount !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({spot.googleReviewCount.toLocaleString()}개 리뷰)
                </span>
              )}
            </div>
            {spot.placeId && (
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${spot.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Google Maps에서 보기
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-2">추천 메뉴</h3>
        <div className="space-y-2">
          {spot.recommendedMenu.map((menu) => (
            <div
              key={menu.nameJa}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span>{menu.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">{menu.nameJa}</span>
              </div>
              {menu.price && (
                <span className="text-muted-foreground font-medium">{menu.price}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {spot.orderPhrase && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">주문 문구</h3>
            <div className="bg-muted rounded-lg px-4 py-3">
              <p className="text-base font-medium mb-1">{spot.orderPhrase}</p>
              {spot.orderPhraseReading && (
                <p className="text-xs text-muted-foreground">
                  {spot.orderPhraseReading}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full gap-2"
              onClick={handleSpeak}
            >
              <Volume2 className="h-4 w-4" />
              일본어로 듣기
            </Button>
          </div>
        </>
      )}

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">나의 리뷰</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">별점</Label>
            <StarSelector value={myRating} onChange={setMyRating} />
          </div>
          <div>
            <Label htmlFor="review" className="text-xs text-muted-foreground mb-2 block">
              메모
            </Label>
            <Textarea
              id="review"
              value={myReview}
              onChange={(e) => setMyReview(e.target.value)}
              placeholder="방문 후기를 남겨보세요"
              rows={3}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
