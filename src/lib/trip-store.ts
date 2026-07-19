export type Currency = "USD" | "INR" | "EUR" | "AED" | "GBP" | "JPY";

export const CURRENCIES: { code: Currency; symbol: string; rate: number; label: string }[] = [
  { code: "USD", symbol: "$", rate: 1, label: "US Dollar" },
  { code: "INR", symbol: "₹", rate: 83, label: "Indian Rupee" },
  { code: "EUR", symbol: "€", rate: 0.92, label: "Euro" },
  { code: "AED", symbol: "د.إ", rate: 3.67, label: "UAE Dirham" },
  { code: "GBP", symbol: "£", rate: 0.79, label: "British Pound" },
  { code: "JPY", symbol: "¥", rate: 155, label: "Japanese Yen" },
];

export function formatMoney(amountUsd: number, currency: Currency): string {
  const c = CURRENCIES.find((x) => x.code === currency) ?? CURRENCIES[0];
  const val = Math.round(amountUsd * c.rate);
  return `${c.symbol}${val.toLocaleString()}`;
}

export type TripInput = {
  destination: string;
  fromCountry: string;
  toCountry: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number; // stored in USD
  currency: Currency;
  travelers: number;
  style: string;
  interests: string[];
  transport: string;
  accommodation: string;
  accessibility: string[];
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
