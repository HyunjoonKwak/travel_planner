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

const FALLBACK_CURRENCY: CurrencyInfo = CURRENCIES.JPY;

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const code = COUNTRY_CURRENCY[countryCode.toUpperCase()];
  return code ? (CURRENCIES[code] ?? FALLBACK_CURRENCY) : FALLBACK_CURRENCY;
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES[code.toUpperCase()] ?? FALLBACK_CURRENCY;
}

export function formatCurrency(amount: number, code: string): string {
  const info = getCurrencyInfo(code);
  return `${info.symbol}${amount.toLocaleString()}`;
}

export function convertToKRW(
  amount: number,
  fromCode: string,
  rate: number,
): number {
  return Math.round(amount * rate);
}

export function convertFromKRW(
  amountKRW: number,
  toCode: string,
  rate: number,
): number {
  return Math.round(amountKRW / rate);
}

// ---------------------------------------------------------------------------
// Backward-compatible helpers (deprecated)
// ---------------------------------------------------------------------------

const DEFAULT_RATE = 8.9;

/** @deprecated Use convertToKRW instead */
export function jpyToKrw(jpy: number, rate: number = DEFAULT_RATE): number {
  return Math.round(jpy * rate);
}

/** @deprecated Use convertFromKRW instead */
export function krwToJpy(krw: number, rate: number = DEFAULT_RATE): number {
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
