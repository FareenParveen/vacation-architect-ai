import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  MapPin, Calendar, Wallet, Users, Sparkles, Download, Share2, Bookmark,
  Hotel, UtensilsCrossed, Package, Lightbulb, Shield, TrendingUp, Sun,
  Send, Bot, User as UserIcon, Loader2, Plane, Clock, Star, Check,
  Landmark, Gem, CloudSun, Phone, Bus, AlertTriangle, Map as MapIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { loadTripInput, type TripInput } from "@/lib/trip-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

type Day = { title: string; morning: string; afternoon: string; evening: string; highlight: string };
type Plan = {
  summary: string;
  days: Day[];
  budget: { label: string; amount: number; pct: number }[];
  hotels: { name: string; rating: number; price: number; area: string; tag: string }[];
  foods: { name: string; type: string; note: string; veg?: boolean }[];
  attractions: { name: string; type: string; desc: string }[];
  hiddenGems: { name: string; desc: string }[];
  packing: string[];
  tips: string[];
  transportTips: string[];
  safetyTips: string[];
  emergency: { label: string; number: string }[];
  weather: { label: string; temp: string; note: string }[];
  totalCost: number;
  bestTime: string;
  safety: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
};

const LOADING_STEPS = [
  { emoji: "✈️", text: "Finding the best destinations..." },
  { emoji: "🏨", text: "Searching hotels..." },
  { emoji: "🍽", text: "Finding local food..." },
  { emoji: "📍", text: "Building your itinerary..." },
  { emoji: "🤖", text: "AI is creating your perfect trip..." },
];

function buildPlan(t: TripInput): Plan {
  const dest = t.destination;
  const cityName = dest.split(",")[0].trim();
  const per = Math.max(60, Math.round(t.budget / Math.max(1, t.days)));
  const themes = [
    "Arrival & Old Town Wander", "Cultural Landmarks", "Local Markets & Cuisine",
    "Nature & Scenic Escape", "Adventure Day", "Hidden Gems Tour", "Relaxation & Departure",
    "Coastal Getaway", "Mountain Trek", "Nightlife & Live Music",
  ];
  return {
    summary: `A ${t.days}-day ${t.style.toLowerCase()} adventure through ${dest}, blending ${t.interests.slice(0, 3).join(", ").toLowerCase()} with authentic local moments. Curated for ${t.travelers} traveler${t.travelers > 1 ? "s" : ""} with a $${t.budget.toLocaleString()} budget, staying in ${t.accommodation.toLowerCase()}s and traveling by ${t.transport.toLowerCase()}.`,
    days: Array.from({ length: t.days }).map((_, i) => ({
      title: themes[i % themes.length],
      morning: `Start with a slow breakfast at a neighborhood cafe, then head to ${["the historic center", "a scenic viewpoint", "a local market", "a hidden temple"][i % 4]}.`,
      afternoon: `Explore ${cityName}'s ${["famous landmarks", "artisan quarter", "waterfront promenade", "botanical gardens"][i % 4]} and grab lunch at a locally-loved spot.`,
      evening: `Sunset walk followed by dinner at ${["a rooftop bistro", "a family-run tavern", "a street food alley", "a chef's tasting counter"][i % 4]}.`,
      highlight: ["Local guide experience", "Sunset photo spot", "Chef's special tasting", "Live music venue", "Off-map viewpoint"][i % 5],
    })),
    budget: [
      { label: "Accommodation", amount: Math.round(t.budget * 0.35), pct: 35 },
      { label: "Food & Dining", amount: Math.round(t.budget * 0.25), pct: 25 },
      { label: "Transportation", amount: Math.round(t.budget * 0.15), pct: 15 },
      { label: "Activities", amount: Math.round(t.budget * 0.18), pct: 18 },
      { label: "Miscellaneous", amount: Math.round(t.budget * 0.07), pct: 7 },
    ],
    hotels: [
      { name: `The ${cityName} Boutique`, rating: 4.8, price: Math.round(per * 0.5), area: "Old Town", tag: "Editor's pick" },
      { name: "Riverside Grand Hotel", rating: 4.6, price: Math.round(per * 0.4), area: "City Center", tag: "Best value" },
      { name: "Skyline Loft Suites", rating: 4.7, price: Math.round(per * 0.55), area: "Downtown", tag: "Rooftop pool" },
    ],
    foods: [
      { name: "Sunrise Noodle House", type: "Local breakfast", note: "Family-run, cash only, arrive early." },
      { name: "Mercado Central", type: "Street food market", note: "Try the grilled skewers and fresh juice." },
      { name: "Chef Amara's Table", type: "Fine dining", note: "Seasonal tasting menu — reserve 2 weeks ahead." },
      { name: "Café des Voyageurs", type: "Cozy cafe", note: "Best flat white in the neighborhood.", veg: true },
    ],
    attractions: [
      { name: `${cityName} Grand Cathedral`, type: "Landmark", desc: "13th-century architecture with panoramic bell tower views." },
      { name: "National Museum of Art", type: "Culture", desc: "World-class collection spanning ancient to contemporary works." },
      { name: "Riverside Promenade", type: "Scenic", desc: "2 km waterfront walk with cafes, buskers, and sunset views." },
      { name: "Old Town Bazaar", type: "Shopping", desc: "Centuries-old market with spices, textiles, and artisan crafts." },
    ],
    hiddenGems: [
      { name: "Rooftop Jazz at Casa Luz", desc: "Speakeasy above a bookshop — live sets Thu–Sun, locals only." },
      { name: "Sunrise Point at Mira Hill", desc: "20-min walk from center; stunning golden hour with no crowds." },
      { name: "La Petite Boulangerie", desc: "Family bakery famous for almond croissants. Sold out by 10am." },
    ],
    packing: [
      "Comfortable walking shoes", "Reusable water bottle", "Universal power adapter",
      "Light rain jacket", "Sunscreen & sunglasses", "Portable phone charger",
      "Copies of passport & ID", "Basic first-aid kit", "Reusable tote bag",
    ],
    tips: [
      "Learn 5 basic phrases in the local language — locals appreciate the effort.",
      "Book major attractions online in advance to skip lines.",
      "Carry small bills for markets, taxis, and tips.",
      "Download offline maps before arrival.",
    ],
    transportTips: [
      "Metro day passes are cheapest — buy at any station kiosk.",
      "Rideshare apps work well; official taxis have yellow plates.",
      "Rent a bike for the old town — it's flat and scenic.",
      "Airport express train runs every 15 min from Terminal 1.",
    ],
    safetyTips: [
      "Pickpocketing is the main concern in tourist areas — use a front pocket or crossbody bag.",
      "Tap water is safe to drink in the city center.",
      "Avoid unlicensed taxis at night — use ride apps instead.",
      "Register with your embassy if staying more than 30 days.",
    ],
    emergency: [
      { label: "General emergency", number: "112" },
      { label: "Police", number: "110" },
      { label: "Ambulance", number: "115" },
      { label: "Tourist helpline", number: "+1 800 555 0199" },
    ],
    weather: [
      { label: "Morning", temp: "18°C", note: "Cool & breezy" },
      { label: "Afternoon", temp: "26°C", note: "Sunny with light clouds" },
      { label: "Evening", temp: "20°C", note: "Mild, light jacket" },
      { label: "Rain chance", temp: "15%", note: "Mostly dry week" },
    ],
    totalCost: t.budget,
    bestTime: ["March – May (mild spring)", "September – November (crisp autumn)", "December – February (festive season)"][dest.length % 3],
    safety: 82 + (dest.length % 15),
    difficulty: (["Easy", "Moderate", "Challenging"] as const)[t.interests.includes("Adventure") ? 1 : 0],
  };
}

function ResultsPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState<TripInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const t = loadTripInput();
    if (!t) {
      navigate({ to: "/plan" });
      return;
    }
    setInput(t);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i >= LOADING_STEPS.length) {
        clearInterval(timer);
        setPlan(buildPlan(t));
        setLoading(false);
      } else {
        setStep(i);
      }
    }, 800);
    return () => clearInterval(timer);
  }, [navigate]);

  if (loading || !input || !plan) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-40 animate-pulse" />
            <div className="relative grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-primary shadow-elegant animate-float">
              <Plane className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-10 text-3xl font-bold font-display">Crafting your journey</h2>
          <p className="mt-2 text-muted-foreground">Our AI is designing an experience just for you.</p>

          <div className="mt-10 max-w-md mx-auto space-y-3 text-left">
            {LOADING_STEPS.map((s, i) => (
              <div key={s.text} className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all animate-fade-in",
                i < step ? "opacity-100" : i === step ? "opacity-100 shadow-soft border-primary/40" : "opacity-40",
              )}>
                {i < step ? (
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                ) : i === step ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-border" />
                )}
                <span className="text-lg">{s.emoji}</span>
                <span className="text-sm font-medium">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <ResultsDashboard input={input} plan={plan} setPlan={setPlan} />;
}

function ResultsDashboard({ input, plan, setPlan }: { input: TripInput; plan: Plan; setPlan: (p: Plan) => void }) {
  const dateRange = input.startDate && input.endDate
    ? `${format(new Date(input.startDate), "MMM d")} – ${format(new Date(input.endDate), "MMM d, yyyy")}`
    : `${input.days} days`;

  const handlePDF = () => {
    if (typeof window !== "undefined") window.print();
    toast.success("Preparing PDF — use your browser's Save as PDF option.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-hero border border-border p-6 sm:p-8 shadow-soft animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-generated itinerary
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
                <MapPin className="h-8 w-8 text-primary shrink-0" />
                <span className="truncate">{input.destination}</span>
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">{plan.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Chip icon={Calendar}>{dateRange}</Chip>
                <Chip icon={Users}>{input.travelers} traveler{input.travelers > 1 ? "s" : ""}</Chip>
                <Chip icon={Wallet}>${input.budget.toLocaleString()}</Chip>
                <Chip icon={Sparkles}>{input.style}</Chip>
                {input.interests.slice(0, 3).map((i) => <Chip key={i}>{i}</Chip>)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Estimated Total" value={`$${plan.totalCost.toLocaleString()}`} accent="text-primary" />
          <StatCard icon={Sun} label="Best time to visit" value={plan.bestTime} small />
          <StatCard icon={Shield} label="Safety score" value={`${plan.safety}/100`} accent="text-emerald-500" />
          <StatCard icon={TrendingUp} label="Difficulty" value={plan.difficulty} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary */}
            <Section title="Day-by-day itinerary" icon={Calendar}>
              <div className="space-y-4">
                {plan.days.map((d, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5 hover:shadow-soft transition-all">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground font-bold shadow-soft">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Day {i + 1}</div>
                          <h4 className="font-semibold text-lg">{d.title}</h4>
                        </div>
                      </div>
                      <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">✨ {d.highlight}</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                      <TimeBlock label="Morning" text={d.morning} />
                      <TimeBlock label="Afternoon" text={d.afternoon} />
                      <TimeBlock label="Evening" text={d.evening} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Budget */}
            <Section title="Budget breakdown" icon={Wallet}>
              <div className="space-y-4">
                {plan.budget.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{b.label}</span>
                      <span className="text-muted-foreground tabular-nums">${b.amount.toLocaleString()} • {b.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-border flex justify-between text-sm">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary tabular-nums">${plan.totalCost.toLocaleString()}</span>
                </div>
              </div>
            </Section>

            {/* Top Attractions */}
            <Section title="Top attractions" icon={Landmark}>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.attractions.map((a) => (
                  <div key={a.name} className="rounded-xl border border-border bg-card p-4 hover:shadow-soft transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{a.name}</h4>
                      <span className="text-[10px] rounded-full bg-secondary px-2 py-0.5">{a.type}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Hidden Gems */}
            <Section title="Hidden gems" icon={Gem}>
              <div className="space-y-3">
                {plan.hiddenGems.map((g) => (
                  <div key={g.name} className="flex gap-3 rounded-xl border border-border bg-gradient-hero p-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
                      <Gem className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm">{g.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Hotels */}
            <Section title="Recommended hotels" icon={Hotel}>
              <div className="grid gap-4 sm:grid-cols-3">
                {plan.hotels.map((h) => (
                  <div key={h.name} className="rounded-2xl border border-border bg-card p-4 hover:shadow-elegant hover:-translate-y-1 transition-all">
                    <div className="aspect-video rounded-xl bg-gradient-mesh mb-3 relative overflow-hidden">
                      <span className="absolute top-2 left-2 rounded-full bg-card/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold">{h.tag}</span>
                    </div>
                    <h4 className="font-semibold text-sm">{h.name}</h4>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{h.rating}</span>
                      <span>{h.area}</span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-primary">${h.price}<span className="text-xs text-muted-foreground font-normal"> /night</span></div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Food */}
            <Section title="Recommended restaurants" icon={UtensilsCrossed}>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.foods.map((f) => (
                  <div key={f.name} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate">{f.name}</h4>
                      <span className="text-[10px] rounded-full bg-secondary px-2 py-0.5 shrink-0">
                        {f.veg ? "🌱 " : ""}{f.type}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.note}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Map placeholder */}
            <Section title="Interactive map" icon={MapIcon}>
              <div className="relative aspect-[16/8] rounded-2xl overflow-hidden bg-gradient-mesh border border-border">
                <div className="absolute inset-0 opacity-40" style={{
                  backgroundImage: "radial-gradient(circle at 25% 40%, oklch(0.7 0.16 240 / 0.4), transparent 40%), radial-gradient(circle at 70% 60%, oklch(0.75 0.14 200 / 0.4), transparent 40%)",
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-card/80 backdrop-blur px-6 py-4 rounded-2xl border border-border shadow-soft">
                    <MapIcon className="h-8 w-8 text-primary mx-auto" />
                    <div className="mt-2 font-semibold text-sm">{input.destination}</div>
                    <div className="text-xs text-muted-foreground">Interactive map preview</div>
                  </div>
                </div>
                {[
                  { top: "22%", left: "18%" }, { top: "40%", left: "62%" },
                  { top: "68%", left: "35%" }, { top: "55%", left: "80%" },
                ].map((pos, i) => (
                  <div key={i} className="absolute" style={pos}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
                      <div className="relative grid h-6 w-6 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold shadow-elegant">
                        {i + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Weather */}
            <Section title="Weather summary" icon={CloudSun}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {plan.weather.map((w) => (
                  <div key={w.label} className="rounded-xl border border-border bg-gradient-hero p-4 text-center">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{w.label}</div>
                    <div className="mt-1 text-2xl font-bold font-display text-primary">{w.temp}</div>
                    <div className="text-xs text-muted-foreground mt-1">{w.note}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ChatAssistant plan={plan} setPlan={setPlan} />

            <Section title="Packing checklist" icon={Package} compact>
              <ul className="space-y-2 text-sm">
                {plan.packing.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Local transportation" icon={Bus} compact>
              <ul className="space-y-3 text-sm">
                {plan.transportTips.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Safety tips" icon={Shield} compact>
              <ul className="space-y-3 text-sm">
                {plan.safetyTips.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Travel tips" icon={Lightbulb} compact>
              <ul className="space-y-3 text-sm">
                {plan.tips.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Emergency contacts" icon={Phone} compact>
              <ul className="space-y-2 text-sm">
                {plan.emergency.map((e) => (
                  <li key={e.label} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{e.label}</span>
                    <a href={`tel:${e.number}`} className="font-bold text-primary tabular-nums">{e.number}</a>
                  </li>
                ))}
              </ul>
            </Section>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold flex items-center gap-2"><Download className="h-4 w-4 text-primary" />Save your trip</h3>
              <div className="mt-4 space-y-2">
                <Button className="w-full bg-gradient-primary shadow-soft" onClick={handlePDF}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  if (typeof window !== "undefined") {
                    const saved = JSON.parse(localStorage.getItem("tg-saved-trips") || "[]");
                    saved.push({ id: Date.now(), input, savedAt: new Date().toISOString() });
                    localStorage.setItem("tg-saved-trips", JSON.stringify(saved));
                  }
                  toast.success("Trip saved to your library");
                }}>
                  <Bookmark className="mr-2 h-4 w-4" /> Save Trip
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: "My TripGenie trip", text: `Check out my ${input.days}-day trip to ${input.destination}!`, url: window.location.href }).catch(() => {});
                  } else if (typeof navigator !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }
                }}>
                  <Share2 className="mr-2 h-4 w-4" /> Share Trip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon?: typeof Calendar; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs font-medium">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, accent, small }: { icon: typeof Wallet; label: string; value: string; accent?: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition-all">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className={cn("mt-2 font-bold font-display", small ? "text-sm" : "text-2xl", accent)}>{value}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children, compact }: { title: string; icon: typeof Calendar; children: React.ReactNode; compact?: boolean }) {
  return (
    <section className={cn("rounded-3xl border border-border bg-card shadow-soft animate-fade-in", compact ? "p-5" : "p-6 sm:p-7")}>
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function TimeBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1"><Clock className="h-3 w-3" />{label}</div>
      <p className="mt-1 text-xs text-foreground/80 leading-relaxed">{text}</p>
    </div>
  );
}

// ---------------- Chat Assistant ----------------
type Msg = { role: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "Reduce my budget",
  "Add adventure activities",
  "Make it family friendly",
  "Suggest hidden gems",
  "Add nightlife",
  "Add vegetarian restaurants",
];

function ChatAssistant({ plan, setPlan }: { plan: Plan; setPlan: (p: Plan) => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your AI trip assistant. Ask me to tweak anything — budget, vibe, activities, food. What should we adjust?" },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      const { reply, updated } = applyToPlan(trimmed, plan);
      if (updated) setPlan(updated);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setTyping(false);
      if (updated) toast.success("Itinerary updated");
    }, 900);
  };

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-[520px]">
      <div className="border-b border-border p-4 flex items-center gap-3 bg-gradient-hero">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-soft">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold text-sm">AI Trip Assistant</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2 items-start animate-fade-in", m.role === "user" && "flex-row-reverse")}>
            <div className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full",
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}>
              {m.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className={cn(
              "rounded-2xl px-3 py-2 text-sm max-w-[85%] leading-relaxed",
              m.role === "user"
                ? "bg-gradient-primary text-primary-foreground rounded-tr-sm"
                : "bg-secondary text-foreground rounded-tl-sm",
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2 items-start">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-secondary"><Bot className="h-3.5 w-3.5" /></div>
            <div className="rounded-2xl px-3 py-2 bg-secondary flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium hover:bg-accent hover:border-primary/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask me anything about your trip..." className="h-10" />
          <Button type="submit" size="icon" className="h-10 w-10 bg-gradient-primary shrink-0" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function applyToPlan(q: string, plan: Plan): { reply: string; updated: Plan | null } {
  const l = q.toLowerCase();

  if (l.includes("budget") || l.includes("cheap") || l.includes("reduce")) {
    const newTotal = Math.round(plan.totalCost * 0.8);
    const updated: Plan = {
      ...plan,
      totalCost: newTotal,
      budget: plan.budget.map((b) => ({ ...b, amount: Math.round(newTotal * (b.pct / 100)) })),
      hotels: plan.hotels.map((h) => ({ ...h, price: Math.round(h.price * 0.75) })),
    };
    return { reply: "I've trimmed your budget by ~20%. Swapped a boutique stay for a highly-rated guesthouse and added two free walking tours. Daily food budget still covers memorable meals.", updated };
  }

  if (l.includes("adventure")) {
    const extra: Day[] = [
      { title: "Adventure Day", morning: "Sunrise kayaking along the coast with a local guide.", afternoon: "Full-day hiking trail with panoramic viewpoints and a waterfall lunch stop.", evening: "Sunset paragliding session — book the tandem flight for beginners.", highlight: "Adrenaline day" },
    ];
    return {
      reply: "Added kayaking, a full-day hike, and a sunset paragliding session. Difficulty updated to Moderate — pack good shoes!",
      updated: { ...plan, difficulty: "Moderate", days: [...plan.days, ...extra] },
    };
  }

  if (l.includes("family")) {
    return {
      reply: "Reworked for families: added a hands-on cooking class, a wildlife park visit, and swapped late nights for sunrise activities. Hotel changed to a kid-friendly resort with a pool.",
      updated: {
        ...plan,
        hotels: [{ name: "Family Cove Resort", rating: 4.7, price: plan.hotels[0].price, area: "Beachfront", tag: "Kids club & pool" }, ...plan.hotels.slice(1)],
        tips: ["Ask hotels about kids' menus and cribs on booking.", "Carry snacks and water — kids get hungry between meals.", ...plan.tips],
      },
    };
  }

  if (l.includes("hidden") || l.includes("gem")) {
    const extras = [
      { name: "The Blue Door Speakeasy", desc: "Unmarked bar behind a florist — password changes weekly." },
      { name: "Sunset Wall at Fort Ridge", desc: "10-min uphill walk from the last metro stop. Locals only." },
    ];
    return {
      reply: "Loving this! Slipped in two more local favorites — a hidden speakeasy and a sunset wall the guidebooks don't cover.",
      updated: { ...plan, hiddenGems: [...plan.hiddenGems, ...extras] },
    };
  }

  if (l.includes("night")) {
    const extra: Day = { title: "Nightlife & Live Music", morning: "Slow start — brunch at a rooftop cafe with skyline views.", afternoon: "Vinyl record shops and a curated cocktail-making workshop.", evening: "Live jazz venue, then a rooftop cocktail bar tour through the club district.", highlight: "Late night pick" };
    return {
      reply: "Nightlife added: a live music venue, a rooftop cocktail tour, and a curated club district walk with an optional after-hours spot.",
      updated: { ...plan, days: [...plan.days, extra] },
    };
  }

  if (l.includes("veg")) {
    const extras = [
      { name: "Verde Plant Kitchen", type: "Vegan tasting", note: "8-course seasonal menu — book online.", veg: true },
      { name: "Green Leaf Market", type: "Farmers market", note: "Sunday only, incredible produce and street snacks.", veg: true },
    ];
    return {
      reply: "Added five vegetarian-friendly spots including a plant-based tasting menu and a farmer's market with amazing produce. Existing recs marked where they have veg options.",
      updated: { ...plan, foods: [...plan.foods, ...extras] },
    };
  }

  return { reply: "Got it — noted for your itinerary. You can also ask me to reduce the budget, add adventure or nightlife, go family-friendly, add vegetarian spots, or surface more hidden gems.", updated: null };
}
