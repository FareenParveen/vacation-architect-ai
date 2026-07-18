export type TripInput = {
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  style: string;
  interests: string[];
  transport: string;
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
