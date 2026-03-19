/** Normalize Korean/Japanese text for case-insensitive search */
export function normalizeKo(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "");
}

/** Safely parse a JSON string[] from a nullable DB column */
export function parseDestinations(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
