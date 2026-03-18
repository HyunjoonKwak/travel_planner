const DEFAULT_RATE = 8.9;

export function jpyToKrw(jpy: number, rate: number = DEFAULT_RATE): number {
  return Math.round(jpy * rate);
}

export function krwToJpy(krw: number, rate: number = DEFAULT_RATE): number {
  return Math.round(krw / rate);
}

export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}
