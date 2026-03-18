import type { FoodSpot, LegacyFoodSpot, LegacyFoodCategory } from "@/types/food";
import { LEGACY_CATEGORY_MAP } from "@/types/food";
import { OSAKA_FOOD_SPOTS } from "./food-spots";
import { KYOTO_FOOD_SPOTS } from "./food-kyoto";

const CITY_FOOD_MAP: Record<string, ReadonlyArray<LegacyFoodSpot>> = {
  osaka: OSAKA_FOOD_SPOTS,
  kyoto: KYOTO_FOOD_SPOTS,
};

function normalizeLegacySpot(spot: LegacyFoodSpot): FoodSpot {
  const category = LEGACY_CATEGORY_MAP[spot.category as LegacyFoodCategory] ?? "other";
  return { ...spot, category };
}

export function getFoodSpotsForCities(
  cityIds: ReadonlyArray<string>
): ReadonlyArray<FoodSpot> {
  return cityIds.flatMap((id) => {
    const spots = CITY_FOOD_MAP[id];
    if (!spots) return [];
    return spots.map(normalizeLegacySpot);
  });
}

export function getAvailableFoodCities(): ReadonlyArray<string> {
  return Object.keys(CITY_FOOD_MAP);
}
