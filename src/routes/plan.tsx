import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  MapPin, CalendarIcon, Users, Wallet, Compass, Sparkles, ArrowRight, Globe,
  Plane, Car, Train, Bus, Hotel, Home, Tent, Building2, Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { saveTripInput, daysBetween, CURRENCIES, type Currency, formatMoney } from "@/lib/trip-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  component: PlanPage,
});

const INTERESTS = [
  { id: "Adventure", emoji: "🧗" },
  { id: "Nature", emoji: "🌿" },
  { id: "History", emoji: "🏛️" },
  { id: "Shopping", emoji: "🛍️" },
  { id: "Nightlife", emoji: "🌃" },
  { id: "Food", emoji: "🍜" },
  { id: "Photography", emoji: "📸" },
  { id: "Wildlife", emoji: "🦁" },
  { id: "Mountains", emoji: "🏔️" },
  { id: "Beaches", emoji: "🏖️" },
];

const TRANSPORTS = [
  { id: "Flight", icon: Plane },
  { id: "Train", icon: Train },
  { id: "Bus", icon: Bus },
  { id: "Car", icon: Car },
];

const STAYS = [
  { id: "Hostel", icon: Tent },
  { id: "Hotel", icon: Hotel },
  { id: "Resort", icon: Building2 },
  { id: "Villa", icon: Home },
  { id: "Apartment", icon: Building2 },
];

const STYLES = ["Solo", "Couple", "Family", "Friends", "Business", "Luxury", "Backpacking"];

const ACCESSIBILITY = ["Wheelchair Friendly", "Senior Citizen", "Kids Friendly"];

const POPULAR_DESTS = ["Kyoto, Japan", "Paris, France", "Bali, Indonesia", "Dubai, UAE", "New York, USA", "Santorini, Greece"];

function PlanPage() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d;
  });
  const [budget, setBudget] = useState(2000);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Couple");
  const [interests, setInterests] = useState<string[]>(["Food", "Nature"]);
  const [transport, setTransport] = useState("Flight");
  const [accommodation, setAccommodation] = useState("Hotel");
  const [accessibility, setAccessibility] = useState<string[]>([]);

  const days = startDate && endDate ? daysBetween(startDate.toISOString(), endDate.toISOString()) : 0;

  const toggle = (id: string, list: string[], set: (v: string[]) => void) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const suggestions = destination.length > 0
    ? POPULAR_DESTS.filter((p) => p.toLowerCase().includes(destination.toLowerCase())).slice(0, 5)
    : POPULAR_DESTS.slice(0, 5);

  const submit = () => {
    if (!destination.trim()) return toast.error("Please enter a destination");
    if (!startDate || !endDate) return toast.error("Please choose your dates");
    if (endDate < startDate) return toast.error("End date must be after start date");
    if (interests.length === 0) return toast.error("Pick at least one interest");
    saveTripInput({
      destination: destination.trim(),
      fromCountry: fromCountry.trim(),
      toCountry: toCountry.trim() || destination.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days,
      budget,
      currency,
      travelers,
      style,
      interests,
      transport,
      accommodation,
      accessibility,
    });
    navigate({ to: "/results" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 lg:py-16">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Trip Planner
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">Design your perfect journey</h1>
          <p className="mt-3 text-muted-foreground">Tell us about your dream trip — our AI does the rest in seconds.</p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-card shadow-elegant p-6 sm:p-8 lg:p-10 space-y-8 animate-fade-in">
          {/* Destination with autocomplete */}
          <div className="space-y-2 relative">
            <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />Destination</Label>
            <Input
              placeholder="Search a city or country…"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              className="h-12"
            />
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-popover shadow-elegant overflow-hidden animate-fade-in">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => { setDestination(s); setShowSuggest(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent text-left"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* From / To countries */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" />Travel from (country)</Label>
              <Input placeholder="e.g. India" value={fromCountry} onChange={(e) => setFromCountry(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" />Destination country</Label>
              <Input placeholder="e.g. Japan" value={toCountry} onChange={(e) => setToCountry(e.target.value)} className="h-12" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-primary" />Start date</Label>
              <DateField value={startDate} onChange={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-primary" />End date</Label>
              <DateField value={endDate} onChange={setEndDate} />
            </div>
          </div>
          {days > 0 && (
            <div className="text-xs text-muted-foreground -mt-4">
              Trip length: <span className="font-semibold text-foreground">{days} day{days > 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Budget + Currency + Travelers */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-primary" />Budget</Label>
              <div className="flex items-center gap-3">
                <Slider value={[budget]} onValueChange={(v) => setBudget(v[0])} min={200} max={20000} step={100} className="flex-1" />
                <div className="w-28 text-center rounded-lg bg-secondary py-2 font-semibold text-sm tabular-nums">{formatMoney(budget, currency)}</div>
              </div>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="h-10 mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" />Travelers</Label>
              <div className="flex items-center gap-3">
                <Slider value={[travelers]} onValueChange={(v) => setTravelers(v[0])} min={1} max={12} step={1} className="flex-1" />
                <div className="w-14 text-center rounded-lg bg-secondary py-2 font-semibold text-sm tabular-nums">{travelers}</div>
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Compass className="h-4 w-4 text-primary" />Travel style</Label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => {
                const active = style === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft scale-105"
                        : "border-border bg-background hover:bg-accent hover:border-primary/40",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">What interests you? <span className="text-muted-foreground font-normal">(pick as many as you like)</span></Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const active = interests.includes(i.id);
                return (
                  <button
                    type="button"
                    key={i.id}
                    onClick={() => toggle(i.id, interests, setInterests)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft scale-105"
                        : "border-border bg-background hover:bg-accent hover:border-primary/40",
                    )}
                  >
                    <span>{i.emoji}</span>
                    {i.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accommodation */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Accommodation preference</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {STAYS.map((s) => {
                const active = accommodation === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setAccommodation(s.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all",
                      active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:bg-accent",
                    )}
                  >
                    <s.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium">{s.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transport */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Preferred transportation</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRANSPORTS.map((t) => {
                const active = transport === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTransport(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all",
                      active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:bg-accent",
                    )}
                  >
                    <t.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium">{t.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Accessibility className="h-4 w-4 text-primary" />Accessibility requirements</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESSIBILITY.map((a) => {
                const active = accessibility.includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggle(a, accessibility, setAccessibility)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft"
                        : "border-border bg-background hover:bg-accent hover:border-primary/40",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={submit} size="lg" className="w-full h-14 text-base bg-gradient-primary shadow-elegant hover:shadow-glow transition-all group">
            <Sparkles className="mr-2 h-5 w-5" />
            Generate AI Trip
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function DateField({ value, onChange }: { value: Date | undefined; onChange: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-12 w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}
