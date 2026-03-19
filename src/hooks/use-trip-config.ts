"use client";

import { getCityById } from "@/lib/data/destinations";

export interface FlightInfo {
  readonly airline: string;
  readonly flightNumber: string;
  readonly departureAirport: string;
  readonly arrivalAirport: string;
  readonly departureTime: string;
  readonly arrivalTime: string;
  readonly date: string;
  readonly confirmationCode?: string;
}

export interface HotelInfo {
  readonly name: string;
  readonly nameJa?: string;
  readonly address: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly confirmationCode?: string;
  readonly phone?: string;
  readonly mapUrl?: string;
}

export interface BudgetConfig {
  readonly totalBudget: number;
  readonly categories: {
    readonly food: number;
    readonly transport: number;
    readonly shopping: number;
    readonly accommodation: number;
    readonly sightseeing: number;
    readonly other: number;
  };
}

export interface TripConfig {
  readonly country: string;
  readonly destinations: ReadonlyArray<string>;
  readonly theme: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly onboarded: boolean;
  readonly outboundFlight?: FlightInfo;
  readonly returnFlight?: FlightInfo;
  readonly hotel?: HotelInfo;
  readonly budget?: BudgetConfig;
}

const DEFAULT_CONFIG: TripConfig = {
  country: "",
  destinations: [],
  theme: "",
  startDate: "",
  endDate: "",
  onboarded: false,
  outboundFlight: undefined,
  returnFlight: undefined,
  hotel: undefined,
  budget: undefined,
};

function safeJsonParse<T>(value: string | null | undefined): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function tripToConfig(trip: {
  country: string | null;
  destinations: string | null;
  theme: string | null;
  startDate: string | null;
  endDate: string | null;
  outboundFlight: string | null;
  returnFlight: string | null;
  hotel: string | null;
  budget: string | null;
}): TripConfig {
  const rawDestinations = safeJsonParse<string[]>(trip.destinations);
  return {
    country: trip.country ?? "",
    destinations: Array.isArray(rawDestinations) ? rawDestinations : [],
    theme: trip.theme ?? "",
    startDate: trip.startDate ?? "",
    endDate: trip.endDate ?? "",
    onboarded: true,
    outboundFlight: safeJsonParse<FlightInfo>(trip.outboundFlight),
    returnFlight: safeJsonParse<FlightInfo>(trip.returnFlight),
    hotel: safeJsonParse<HotelInfo>(trip.hotel),
    budget: safeJsonParse<BudgetConfig>(trip.budget),
  };
}

// Cached active trip - set by pages that call useActiveTrip
let _cachedTrip: (Parameters<typeof tripToConfig>[0] & { name?: string; id?: string }) | null = null;

export function setActiveTripCache(trip: typeof _cachedTrip) {
  _cachedTrip = trip;
}

export function useTripConfig() {
  const config: TripConfig = _cachedTrip
    ? tripToConfig(_cachedTrip)
    : DEFAULT_CONFIG;

  function getTripName(): string {
    if (_cachedTrip?.name) {
      return String(_cachedTrip.name);
    }

    const cityNames = config.destinations
      .map((id) => getCityById(id)?.name)
      .filter(Boolean)
      .join("·");

    if (!cityNames && !config.theme) {
      return "여행 플래너";
    }
    if (cityNames && config.theme) {
      return `${cityNames} ${config.theme}`;
    }
    if (cityNames) {
      return `${cityNames} 여행`;
    }
    return `${config.theme} 여행`;
  }

  function getAppTitle(): string {
    const name = getTripName();
    if (name === "여행 플래너") {
      return "여행 플래너";
    }
    return name;
  }

  return { config, getTripName, getAppTitle };
}
