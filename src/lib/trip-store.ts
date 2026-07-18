export type TripInput = {
  destination: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  days: number;
  budget: number;
  travelers: number;
  style: string;
  interests: string[];
  transport: string;
  accommodation: string;
};

const KEY = "tg-trip-input";

export function saveTripInput(input: TripInput) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(input));
}

export function loadTripInput(): TripInput | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TripInput;
  } catch {
    return null;
  }
}

export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.max(1, Math.round((d2 - d1) / 86400000) + 1);
}
