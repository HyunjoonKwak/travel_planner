import { format, differenceInDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function getDday(targetDate: string): number {
  const target = parseISO(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(target, today);
}

export function formatDateKo(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "M월 d일 (EEE)", { locale: ko });
}

export function formatTime(time: string): string {
  return time;
}

export function getWeekday(date: string): string {
  return format(parseISO(date), "EEE", { locale: ko });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
