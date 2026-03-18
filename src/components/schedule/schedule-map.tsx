"use client";

import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MapPlace {
  name: string;
  address?: string;
  time?: string;
}

interface ScheduleMapProps {
  places: MapPlace[];
  className?: string;
}

function buildMapsUrl(place: MapPlace): string {
  const query = place.address ?? place.name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function PlaceRow({ place, index }: { place: MapPlace; index: number }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex flex-col items-center gap-1 min-w-[24px]">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        {place.time && (
          <p className="text-xs text-muted-foreground mb-0.5">{place.time}</p>
        )}
        <p className="text-sm font-medium leading-tight">{place.name}</p>
        {place.address && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{place.address}</p>
        )}
      </div>
      <a
        href={buildMapsUrl(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
      >
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </a>
    </div>
  );
}

function buildRouteUrl(places: MapPlace[]): string {
  if (places.length === 1) {
    return buildMapsUrl(places[0]);
  }
  const origin = encodeURIComponent(places[0].address ?? places[0].name);
  const destination = encodeURIComponent(places[places.length - 1].address ?? places[places.length - 1].name);
  const waypoints = places
    .slice(1, -1)
    .map((p) => encodeURIComponent(p.address ?? p.name))
    .join("|");
  const base = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  return waypoints ? `${base}&waypoints=${waypoints}` : base;
}

export function ScheduleMap({ places, className }: ScheduleMapProps) {
  if (places.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
        <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">표시할 위치가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {places.length === 1 ? "위치" : `${places.length}곳 경로`}
              </span>
            </div>
            {places.length > 1 && (
              <a
                href={buildRouteUrl(places)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Navigation className="h-3 w-3" />
                  경로 보기
                </Button>
              </a>
            )}
          </div>

          <div className="divide-y divide-border/50">
            {places.map((place, index) => (
              <PlaceRow key={`${place.name}-${index}`} place={place} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center px-4">
        * Google Maps API 키 설정 전 링크로 지도를 확인하세요
      </p>
    </div>
  );
}
