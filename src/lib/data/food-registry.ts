import type { FoodSpot } from "@/types/food";
import { OSAKA_FOOD_SPOTS } from "./food-spots";
import { KYOTO_FOOD_SPOTS } from "./food-kyoto";

const CITY_FOOD_MAP: Record<string, ReadonlyArray<FoodSpot>> = {
  osaka: OSAKA_FOOD_SPOTS,
  kyoto: KYOTO_FOOD_SPOTS,
};

export function getFoodSpotsForCities(
  cityIds: ReadonlyArray<string>
): ReadonlyArray<FoodSpot> {
  return cityIds.flatMap((id) => CITY_FOOD_MAP[id] ?? []);
}

export function getAvailableFoodCities(): ReadonlyArray<string> {
  return Object.keys(CITY_FOOD_MAP);
}
