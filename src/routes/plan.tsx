import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Users, Wallet, Compass, Sparkles, ArrowRight, Plane, Car, Train, Bus, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { saveTripInput } from "@/lib/trip-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  component: PlanPage,
});

const INTERESTS = [
  { id: "Adventure", emoji: "🧗" },
  { id: "Beaches", emoji: "🏖️" },
  { id: "Mountains", emoji: "🏔️" },
  { id: "Food", emoji: "🍜" },
  { id: "Shopping", emoji: "🛍️" },
  { id: "History", emoji: "🏛️" },
  { id: "Nature", emoji: "🌿" },
  { id: "Nightlife", emoji: "🌃" },
  { id: "Wildlife", emoji: "🦁" },
];

const TRANSPORTS = [
  { id: "Flight", icon: Plane },
  { id: "Train", icon: Train },
  { id: "Car", icon: Car },
  { id: "Bus", icon: Bus },
  { id: "Cruise", icon: Ship },
];

function PlanPage() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState(2000);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("Couple");
  const [interests, setInterests] = useState<string[]>(["Food", "Nature"]);
  const [transport, setTransport] = useState("Flight");

  const toggle = (id: string) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }
    if (interests.length === 0) {
      toast.error("Pick at least one interest");
      return;
    }
    saveTripInput({ destination: destination.trim(), days, budget, travelers, style, interests, transport });
    navigate({ to: "/results" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 lg:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Trip Planner
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">Design your perfect journey</h1>
          <p className="mt-3 text-muted-foreground">Tell us a bit about your dream trip — the AI does the rest.</p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-card shadow-elegant p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Destination + Days */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />Destination</Label>
              <Input placeholder="e.g. Kyoto, Japan" value={destination} onChange={(e) => setDestination(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />Number of days</Label>
              <div className="flex items-center gap-3">
                <Slider value={[days]} onValueChange={(v) => setDays(v[0])} min={1} max={30} step={1} className="flex-1" />
                <div className="w-14 text-center rounded-lg bg-secondary py-2 font-semibold text-sm tabular-nums">{days}</div>
              </div>
            </div>
          </div>

          {/* Budget + Travelers */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-primary" />Budget (USD)</Label>
              <div className="flex items-center gap-3">
                <Slider value={[budget]} onValueChange={(v) => setBudget(v[0])} min={200} max={20000} step={100} className="flex-1" />
                <div className="w-24 text-center rounded-lg bg-secondary py-2 font-semibold text-sm tabular-nums">${budget.toLocaleString()}</div>
              </div>
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
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Solo", "Couple", "Family", "Friends", "Business"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    onClick={() => toggle(i.id)}
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

          {/* Transport */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Preferred transportation</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TRANSPORTS.map((t) => {
                const active = transport === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTransport(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all",
                      active
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <t.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium">{t.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={submit} size="lg" className="w-full h-14 text-base bg-gradient-primary shadow-elegant hover:shadow-glow transition-all group">
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Trip
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
