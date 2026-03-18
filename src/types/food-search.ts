export interface GooglePlaceResult {
  readonly placeId: string;
  readonly name: string;
  readonly nameJa?: string;
  readonly rating: number;
  readonly userRatingsTotal: number;
  readonly address: string;
  readonly priceLevel?: number;
  readonly types: ReadonlyArray<string>;
  readonly lat: number;
  readonly lng: number;
  readonly photoUrl?: string;
  readonly openNow?: boolean;
}

export interface FoodSearchRequest {
  readonly query: string;
  readonly location?: string;
}

export interface FoodSearchResponse {
  readonly results: ReadonlyArray<GooglePlaceResult>;
  readonly status: "OK" | "ZERO_RESULTS" | "ERROR" | "NEED_MORE_INPUT" | "NO_API_KEY";
}
