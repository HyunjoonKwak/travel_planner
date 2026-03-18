"use client";

import { MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES, getCitiesByCountry } from "@/lib/data/destinations";
import { cn } from "@/lib/utils";

interface DestinationSelectorProps {
  readonly country: string;
  readonly destinations: ReadonlyArray<string>;
  readonly onCountryChange: (code: string) => void;
  readonly onDestinationsChange: (ids: ReadonlyArray<string>) => void;
}

export function DestinationSelector({
  country,
  destinations,
  onCountryChange,
  onDestinationsChange,
}: DestinationSelectorProps) {
  const cities = getCitiesByCountry(country);

  function handleCountrySelect(code: string) {
    // Reset destinations when country changes
    if (code !== country) {
      onDestinationsChange([]);
    }
    onCountryChange(code);
  }

  function handleCityToggle(cityId: string) {
    const isSelected = destinations.includes(cityId);
    if (isSelected) {
      onDestinationsChange(destinations.filter((id) => id !== cityId));
    } else {
      onDestinationsChange([...destinations, cityId]);
    }
  }

  function handleRemoveCity(cityId: string) {
    onDestinationsChange(destinations.filter((id) => id !== cityId));
  }

  const selectedCities = destinations
    .map((id) => cities.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Country selector */}
      <div>
        <p className="text-sm font-medium mb-2 text-muted-foreground">국가 선택</p>
        <div className="grid grid-cols-2 gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCountrySelect(c.code)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                country === c.code
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <span className="text-2xl">{c.flag}</span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    country === c.code ? "text-primary" : "",
                  )}
                >
                  {c.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.cities.length}개 도시
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* City selector */}
      {country && cities.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            도시 선택 (복수 선택 가능)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cities.map((city) => {
              const selected = destinations.includes(city.id);
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCityToggle(city.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {selected && (
                      <svg
                        className="h-2.5 w-2.5 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        selected ? "text-primary" : "",
                      )}
                    >
                      {city.name}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {city.nameLocal}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected cities pills */}
      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCities.map((city) => {
            if (!city) return null;
            return (
              <Badge
                key={city.id}
                variant="secondary"
                className="gap-1 pr-1 pl-2 py-1 text-xs"
              >
                {city.name}
                <button
                  type="button"
                  onClick={() => handleRemoveCity(city.id)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  aria-label={`${city.name} 제거`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
