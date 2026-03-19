export interface CurrencyInfo {
  readonly code: string;
  readonly symbol: string;
  readonly name: string;
  readonly unit: number;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  JPY: { code: "JPY", symbol: "¥", name: "엔", unit: 100 },
  TWD: { code: "TWD", symbol: "NT$", name: "대만달러", unit: 1 },
  THB: { code: "THB", symbol: "฿", name: "바트", unit: 1 },
  VND: { code: "VND", symbol: "₫", name: "동", unit: 10000 },
  KRW: { code: "KRW", symbol: "₩", name: "원", unit: 1 },
};

const COUNTRY_CURRENCY: Record<string, string> = {
  JP: "JPY",
  TW: "TWD",
  TH: "THB",
  VN: "VND",
};

// Approximate default exchange rates: 1 unit of currency → KRW
const DEFAULT_RATES_TO_KRW: Record<string, number> = {
  JPY: 9.4,    // 1 JPY = 9.4 KRW
  THB: 40,     // 1 THB = 40 KRW
  TWD: 44,     // 1 TWD = 44 KRW
  VND: 0.058,  // 1 VND = 0.058 KRW
  KRW: 1,
};

const FALLBACK_CURRENCY: CurrencyInfo = CURRENCIES.JPY;

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const code = COUNTRY_CURRENCY[countryCode.toUpperCase()];
  return code ? (CURRENCIES[code] ?? FALLBACK_CURRENCY) : FALLBACK_CURRENCY;
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES[code.toUpperCase()] ?? FALLBACK_CURRENCY;
}

export function getDefaultRate(fromCode: string): number {
  return DEFAULT_RATES_TO_KRW[fromCode.toUpperCase()] ?? 1;
}

export function formatCurrency(amount: number, code: string): string {
  const info = getCurrencyInfo(code);
  const rounded = Math.round(amount);
  return `${info.symbol}${rounded.toLocaleString()}`;
}

export function convertToKRW(amount: number, fromCode: string, rate?: number): number {
  const effectiveRate = rate ?? getDefaultRate(fromCode);
  return Math.round(amount * effectiveRate);
}

export function convertFromKRW(amountKRW: number, toCode: string, rate?: number): number {
  const effectiveRate = rate ?? getDefaultRate(toCode);
  if (effectiveRate === 0) return 0;
  return Math.round(amountKRW / effectiveRate);
}

export function convertCurrency(amount: number, fromCode: string, toCode: string): number {
  if (fromCode === toCode) return amount;
  const krw = convertToKRW(amount, fromCode);
  return convertFromKRW(krw, toCode);
}

// ---------------------------------------------------------------------------
// Backward-compatible helpers (deprecated)
// ---------------------------------------------------------------------------

/** @deprecated Use convertToKRW instead */
export function jpyToKrw(jpy: number, rate: number = getDefaultRate("JPY")): number {
  return Math.round(jpy * rate);
}

/** @deprecated Use convertFromKRW instead */
export function krwToJpy(krw: number, rate: number = getDefaultRate("JPY")): number {
  return Math.round(krw / rate);
}

/** @deprecated Use formatCurrency(amount, "JPY") instead */
export function formatJPY(amount: number): string {
  return formatCurrency(amount, "JPY");
}

/** @deprecated Use formatCurrency(amount, "KRW") instead */
export function formatKRW(amount: number): string {
  return formatCurrency(amount, "KRW");
}
