export interface RecommendationResult {
  placeId: string;
  name: string;
  nameJa: string;
  nameLocal?: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  city: string;
  cityName: string;
  lat: number;
  lng: number;
  types: string[];
  googleMapsUrl?: string;
  openNow?: boolean;
  category: "food" | "attraction";
}

export interface RecommendationResponse {
  results: RecommendationResult[];
  status: "OK" | "ERROR" | "NO_API_KEY";
  cached?: boolean;
}
