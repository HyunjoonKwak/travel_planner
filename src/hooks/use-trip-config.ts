"use client";

import { useLocalStorage } from "./use-local-storage";
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

// Legacy shape stored in localStorage before migration
interface LegacyTripConfig extends Omit<TripConfig, "country" | "destinations"> {
  readonly destination?: string;
  readonly country?: string;
  readonly destinations?: ReadonlyArray<string>;
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

function migrateLegacy(raw: LegacyTripConfig): TripConfig {
  return {
    country: raw.country ?? "",
    destinations: raw.destinations ?? [],
    theme: raw.theme ?? "",
    startDate: raw.startDate ?? "",
    endDate: raw.endDate ?? "",
    onboarded: raw.onboarded ?? false,
    outboundFlight: raw.outboundFlight,
    returnFlight: raw.returnFlight,
    hotel: raw.hotel,
    budget: raw.budget,
  };
}

export function useTripConfig() {
  const [rawConfig, setConfig] = useLocalStorage<LegacyTripConfig>(
    "trip-config",
    DEFAULT_CONFIG,
  );

  const config: TripConfig = migrateLegacy(rawConfig);

  function updateConfig(updates: Partial<TripConfig>) {
    setConfig((prev) => ({ ...prev, ...updates }));
  }

  function getTripName(): string {
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

  return { config, updateConfig, getTripName, getAppTitle };
}
