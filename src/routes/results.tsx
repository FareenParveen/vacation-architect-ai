import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin, Calendar, Wallet, Users, Sparkles, Download, Share2, Bookmark,
  Hotel, UtensilsCrossed, Package, Lightbulb, Shield, TrendingUp, Sun,
  Send, Bot, User as UserIcon, Loader2, Plane, Clock, Star, Check,
  Landmark, Gem, CloudSun, Phone, Bus, AlertTriangle, Map as MapIcon,
  Volume2, RefreshCw, Wifi, Coffee, Car as CarIcon, Waves, Droplets,
  Wind, Sunrise, Sunset, Leaf, Baby, User as SoloIcon, Accessibility,
  Building2, Train, Zap, Heart, Camera, ThermometerSun,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { loadTripInput, formatMoney, type TripInput, type Currency } from "@/lib/trip-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
});

// ---------- Image helpers (deterministic Unsplash-source style via picsum with seeds) ----------
const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

type Day = { title: string; morning: string; afternoon: string; evening: string; highlight: string };
type Hotel = { name: string; rating: number; price: number; area: string; tag: string; amenities: string[]; distance: string; image: string };
type Restaurant = { name: string; cuisine: string; rating: number; cost: number; dishes: string[]; veg: boolean; image: string };
type Attraction = { name: string; type: string; desc: string; hours: string; fee: number; duration: string; bestTime: string; image: string };
type Plan = {
  summary: string;
  smartScore: number;
  overview: string;
  days: Day[];
  budget: { label: string; amount: number; pct: number }[];
  flights: { from: string; to: string; airline: string; duration: string; price: number; stops: string }[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  attractions: Attraction[];
  hiddenGems: { name: string; desc: string }[];
  packing: string[];
  tips: string[];
  transportTips: string[];
  safetyTips: string[];
  cultureTips: string[];
  emergency: { label: string; number: string; icon: typeof Phone }[];
  weather: { temp: number; feelsLike: number; humidity: number; wind: number; rain: number; uv: number; sunrise: string; sunset: string; condition: string };
  totalCost: number;
  dailyCost: number;
  bestTime: string;
  safety: number;
  walking: string;
  crowd: "Low" | "Moderate" | "High";
  accessibilityScore: number;
  familyScore: number;
  soloScore: number;
  carbonKg: number;
  aiInsights: string[];
  heroImage: string;
};

const LOADING_STEPS = [
  { emoji: "🤖", text: "Understanding your travel preferences..." },
  { emoji: "🌍", text: "Searching destinations..." },
  { emoji: "✈️", text: "Finding flights..." },
  { emoji: "🏨", text: "Finding hotels..." },
  { emoji: "🍽️", text: "Discovering restaurants..." },
  { emoji: "📍", text: "Building optimized itinerary..." },
  { emoji: "🌦️", text: "Checking weather..." },
  { emoji: "💱", text: "Calculating local currency..." },
  { emoji: "🧳", text: "Creating packing checklist..." },
  { emoji: "⭐", text: "Finding hidden gems..." },
  { emoji: "✨", text: "Almost done..." },
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
  const kidFriendly = t.accessibility.includes("Kids Friendly");
  return {
    heroImage: img(`${cityName}-hero`, 1600, 700),
    summary: `A ${t.days}-day ${t.style.toLowerCase()} adventure through ${dest}, blending ${t.interests.slice(0, 3).join(", ").toLowerCase()} with authentic local moments. Curated for ${t.travelers} traveler${t.travelers > 1 ? "s" : ""}, staying in ${t.accommodation.toLowerCase()}s and traveling by ${t.transport.toLowerCase()}.`,
    smartScore: 82 + (dest.length % 15),
    overview: `${cityName} is a captivating blend of tradition and modernity, known for its warm hospitality, rich culinary scene, and remarkable landmarks. Expect a mix of iconic sights, walkable neighborhoods, and unforgettable local flavors.`,
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
    flights: [
      { from: t.fromCountry || "Your city", to: cityName, airline: "SkyWings Airlines", duration: "8h 45m", price: Math.round(t.budget * 0.18), stops: "Non-stop" },
      { from: t.fromCountry || "Your city", to: cityName, airline: "Global Air", duration: "11h 20m", price: Math.round(t.budget * 0.12), stops: "1 stop" },
    ],
    hotels: [
      { name: `The ${cityName} Boutique`, rating: 4.8, price: Math.round(per * 0.5), area: "Old Town", tag: "Editor's pick", amenities: ["Pool", "WiFi", "Breakfast", "Parking"], distance: "0.8 km from center", image: img(`hotel-${cityName}-1`) },
      { name: "Riverside Grand Hotel", rating: 4.6, price: Math.round(per * 0.4), area: "City Center", tag: "Best value", amenities: ["WiFi", "Breakfast", "Gym"], distance: "0.3 km from center", image: img(`hotel-${cityName}-2`) },
      { name: "Skyline Loft Suites", rating: 4.7, price: Math.round(per * 0.55), area: "Downtown", tag: "Rooftop pool", amenities: ["Pool", "WiFi", "Bar", "Parking"], distance: "1.2 km from center", image: img(`hotel-${cityName}-3`) },
    ],
    restaurants: [
      { name: "Sunrise Noodle House", cuisine: "Local", rating: 4.7, cost: 15, dishes: ["Hand-pulled noodles", "Braised pork"], veg: false, image: img(`food-${cityName}-1`) },
      { name: "Mercado Central", cuisine: "Street food", rating: 4.9, cost: 10, dishes: ["Grilled skewers", "Fresh juice"], veg: true, image: img(`food-${cityName}-2`) },
      { name: "Chef Amara's Table", cuisine: "Fine dining", rating: 4.8, cost: 85, dishes: ["Tasting menu", "Wine pairing"], veg: false, image: img(`food-${cityName}-3`) },
      { name: "Café des Voyageurs", cuisine: "Cafe", rating: 4.5, cost: 12, dishes: ["Flat white", "Almond croissant"], veg: true, image: img(`food-${cityName}-4`) },
    ],
    attractions: [
      { name: `${cityName} Grand Cathedral`, type: "Landmark", desc: "13th-century architecture with panoramic bell tower views.", hours: "9:00 – 18:00", fee: 12, duration: "2 hours", bestTime: "Early morning", image: img(`attr-${cityName}-1`) },
      { name: "National Museum of Art", type: "Culture", desc: "World-class collection spanning ancient to contemporary works.", hours: "10:00 – 20:00", fee: 18, duration: "3 hours", bestTime: "Weekday afternoon", image: img(`attr-${cityName}-2`) },
      { name: "Riverside Promenade", type: "Scenic", desc: "2 km waterfront walk with cafes, buskers, and sunset views.", hours: "Open 24h", fee: 0, duration: "1.5 hours", bestTime: "Sunset", image: img(`attr-${cityName}-3`) },
      { name: "Old Town Bazaar", type: "Shopping", desc: "Centuries-old market with spices, textiles, and artisan crafts.", hours: "8:00 – 22:00", fee: 0, duration: "2 hours", bestTime: "Late morning", image: img(`attr-${cityName}-4`) },
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
      "Pickpocketing is the main concern in tourist areas — use a crossbody bag.",
      "Tap water is safe to drink in the city center.",
      "Avoid unlicensed taxis at night — use ride apps instead.",
      "Register with your embassy if staying more than 30 days.",
    ],
    cultureTips: [
      "Greet elders first — a slight bow is appreciated.",
      "Remove shoes before entering homes and some temples.",
      "Tipping ~10% is common but not mandatory in restaurants.",
      "Dress modestly at religious sites — cover shoulders and knees.",
    ],
    emergency: [
      { label: "Police", number: "110", icon: Shield },
      { label: "Hospital", number: "112", icon: Heart },
      { label: "Ambulance", number: "115", icon: Zap },
      { label: "Embassy", number: "+1 800 555 0100", icon: Building2 },
      { label: "Tourist Helpline", number: "+1 800 555 0199", icon: Phone },
    ],
    weather: {
      temp: 24, feelsLike: 26, humidity: 62, wind: 12, rain: 15, uv: 6,
      sunrise: "06:12", sunset: "19:48", condition: "Sunny with light clouds",
    },
    totalCost: t.budget,
    dailyCost: Math.round(t.budget / Math.max(1, t.days)),
    bestTime: ["March – May (mild spring)", "September – November (crisp autumn)", "December – February (festive season)"][dest.length % 3],
    safety: 82 + (dest.length % 15),
    walking: "~5.2 km/day",
    crowd: (["Low", "Moderate", "High"] as const)[dest.length % 3],
    accessibilityScore: t.accessibility.includes("Wheelchair Friendly") ? 88 : 72,
    familyScore: kidFriendly ? 92 : 78,
    soloScore: t.style === "Solo" ? 94 : 80,
    carbonKg: Math.round(t.days * 45 + (t.transport === "Flight" ? 800 : 200)),
    aiInsights: [
      `You save approximately ${formatMoney(Math.round(t.budget * 0.08), t.currency)} by travelling on weekdays.`,
      "This itinerary avoids heavy traffic hotspots between 5–7pm.",
      "Best photography spots (sunset viewpoint & old town alleys) are included.",
      "Weather is ideal — mostly sunny with low rain probability.",
      `This plan strongly matches your interests: ${t.interests.slice(0, 3).join(", ")}.`,
    ],
  };
}

function ResultsPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState<TripInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [regenKey, setRegenKey] = useState(0);

  useEffect(() => {
    const t = loadTripInput();
    if (!t) {
      navigate({ to: "/plan" });
      return;
    }
    setInput(t);
    setLoading(true);
    setStep(0);
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
    }, 550);
    return () => clearInterval(timer);
  }, [navigate, regenKey]);

  const regenerate = () => {
    setPlan(null);
    setRegenKey((k) => k + 1);
    toast.success("Regenerating your itinerary...");
  };

  if (loading || !input || !plan) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-40 animate-pulse" />
            <div className="relative grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-primary shadow-elegant animate-float">
              <Plane className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-10 text-3xl font-bold font-display">Crafting your journey</h2>
          <p className="mt-2 text-muted-foreground">Our AI is designing an experience just for you.</p>

          <div className="mt-10 max-w-md mx-auto space-y-2.5 text-left">
            {LOADING_STEPS.map((s, i) => (
              <div key={s.text} className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all",
                i < step ? "opacity-100" : i === step ? "opacity-100 shadow-soft border-primary/40 scale-[1.02]" : "opacity-40",
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

  return <ResultsDashboard input={input} plan={plan} setPlan={setPlan} onRegenerate={regenerate} />;
}

function ResultsDashboard({ input, plan, setPlan, onRegenerate }: { input: TripInput; plan: Plan; setPlan: (p: Plan) => void; onRegenerate: () => void }) {
  const cur = input.currency;
  const dateRange = input.startDate && input.endDate
    ? `${format(new Date(input.startDate), "MMM d")} – ${format(new Date(input.endDate), "MMM d, yyyy")}`
    : `${input.days} days`;

  const handlePDF = () => {
    if (typeof window !== "undefined") window.print();
    toast.success("Preparing PDF — use your browser's Save as PDF option.");
  };

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return toast.error("Voice not supported in this browser");
    }
    const u = new SpeechSynthesisUtterance(`Your ${input.days} day trip to ${input.destination}. ${plan.summary}`);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    toast.success("Reading your trip aloud...");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant animate-fade-in">
          <img src={plan.heroImage} alt={input.destination} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="relative p-6 sm:p-10 min-h-[280px] sm:min-h-[340px] flex flex-col justify-end text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1 text-xs font-medium w-fit">
              <Sparkles className="h-3.5 w-3.5" /> AI-generated itinerary
            </div>
            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-2">
              <MapPin className="h-7 w-7 shrink-0" />
              <span className="truncate">{input.destination}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-white/90 leading-relaxed text-sm sm:text-base">{plan.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <HeroChip icon={Calendar}>{dateRange}</HeroChip>
              <HeroChip icon={Users}>{input.travelers} traveler{input.travelers > 1 ? "s" : ""}</HeroChip>
              <HeroChip icon={Wallet}>{formatMoney(input.budget, cur)}</HeroChip>
              <HeroChip icon={Sparkles}>{input.style}</HeroChip>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={handlePDF} className="bg-gradient-primary shadow-soft"><Download className="mr-1.5 h-4 w-4" />PDF</Button>
          <Button size="sm" variant="outline" onClick={() => {
            if (typeof window !== "undefined") {
              const saved = JSON.parse(localStorage.getItem("tg-saved-trips") || "[]");
              saved.push({ id: Date.now(), input, savedAt: new Date().toISOString() });
              localStorage.setItem("tg-saved-trips", JSON.stringify(saved));
            }
            toast.success("Trip saved to your library");
          }}><Bookmark className="mr-1.5 h-4 w-4" />Save</Button>
          <Button size="sm" variant="outline" onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({ title: "My TripGenie trip", text: `${input.days}-day trip to ${input.destination}!`, url: window.location.href }).catch(() => {});
            } else if (typeof navigator !== "undefined") {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied");
            }
          }}><Share2 className="mr-1.5 h-4 w-4" />Share</Button>
          <Button size="sm" variant="outline" onClick={onRegenerate}><RefreshCw className="mr-1.5 h-4 w-4" />Regenerate</Button>
          <Button size="sm" variant="outline" onClick={speak}><Volume2 className="mr-1.5 h-4 w-4" />Listen to My Trip</Button>
        </div>

        {/* Smart score band */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard icon={Sparkles} label="Travel Smart Score" value={`${plan.smartScore}`} suffix="/100" color="from-primary to-primary-glow" />
          <ScoreCard icon={Shield} label="Safety Score" value={`${plan.safety}`} suffix="/100" color="from-emerald-500 to-teal-400" />
          <ScoreCard icon={Accessibility} label="Accessibility" value={`${plan.accessibilityScore}`} suffix="/100" color="from-blue-500 to-sky-400" />
          <ScoreCard icon={Leaf} label="Carbon Footprint" value={`${plan.carbonKg}`} suffix=" kg CO₂" color="from-lime-500 to-emerald-400" />
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <MiniStat icon={Wallet} label="Total" value={formatMoney(plan.totalCost, cur)} />
          <MiniStat icon={TrendingUp} label="Daily avg" value={formatMoney(plan.dailyCost, cur)} />
          <MiniStat icon={CarIcon} label="Walking" value={plan.walking} />
          <MiniStat icon={Users} label="Crowd" value={plan.crowd} />
          <MiniStat icon={Baby} label="Family" value={`${plan.familyScore}/100`} />
          <MiniStat icon={SoloIcon} label="Solo" value={`${plan.soloScore}/100`} />
          <MiniStat icon={Sun} label="Best time" value={plan.bestTime.split(" (")[0]} />
          <MiniStat icon={ThermometerSun} label="Weather" value={`${plan.weather.temp}°C`} />
        </div>

        {/* Destination overview */}
        <Section title="Destination overview" icon={Landmark} className="mt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{plan.overview}</p>
        </Section>

        {/* AI Insights */}
        <Section title="AI Insights" icon={Sparkles} className="mt-6" gradient>
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.aiInsights.map((i, idx) => (
              <div key={idx} className="flex gap-3 rounded-xl bg-card/70 backdrop-blur border border-border p-3 hover:-translate-y-0.5 transition-all">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed">{i}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Flights */}
            <Section title="Flights summary" icon={Plane}>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.flights.map((f, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 hover:shadow-soft transition-all">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{f.airline}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5">{f.stops}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">{f.from}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Origin</div>
                      </div>
                      <div className="flex-1 mx-3 flex items-center gap-1">
                        <div className="h-px flex-1 bg-border" />
                        <Plane className="h-3.5 w-3.5 text-primary rotate-90" />
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{f.to}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Destination</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{f.duration}</span>
                      <span className="font-bold text-primary">{formatMoney(f.price, cur)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Itinerary */}
            <Section title="Day-by-day itinerary" icon={Calendar}>
              <div className="space-y-4">
                {plan.days.map((d, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5 hover:shadow-soft hover:-translate-y-0.5 transition-all">
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
                      <span className="text-muted-foreground tabular-nums">{formatMoney(b.amount, cur)} • {b.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-border flex justify-between text-sm">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary tabular-nums">{formatMoney(plan.totalCost, cur)}</span>
                </div>
              </div>
            </Section>

            {/* Hotels */}
            <Section title="Hotel recommendations" icon={Hotel}>
              <div className="grid gap-4 sm:grid-cols-2">
                {plan.hotels.map((h) => (
                  <HotelCard key={h.name} h={h} currency={cur} />
                ))}
              </div>
            </Section>

            {/* Restaurants */}
            <Section title="Restaurant recommendations" icon={UtensilsCrossed}>
              <div className="grid gap-4 sm:grid-cols-2">
                {plan.restaurants.map((r) => (
                  <RestaurantCard key={r.name} r={r} currency={cur} />
                ))}
              </div>
            </Section>

            {/* Attractions */}
            <Section title="Top tourist attractions" icon={Landmark}>
              <div className="grid gap-4 sm:grid-cols-2">
                {plan.attractions.map((a) => (
                  <AttractionCard key={a.name} a={a} currency={cur} />
                ))}
              </div>
            </Section>

            {/* Hidden Gems */}
            <Section title="Hidden gems" icon={Gem}>
              <div className="space-y-3">
                {plan.hiddenGems.map((g) => (
                  <div key={g.name} className="flex gap-3 rounded-xl border border-border bg-gradient-hero p-4 hover:-translate-y-0.5 transition-all">
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

            {/* Map */}
            <Section title="Google Maps preview" icon={MapIcon}>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-mesh border border-border">
                <div className="absolute inset-0 opacity-70" style={{
                  backgroundImage: `
                    linear-gradient(oklch(0.85 0.1 245 / 0.15) 1px, transparent 1px),
                    linear-gradient(90deg, oklch(0.85 0.1 245 / 0.15) 1px, transparent 1px),
                    radial-gradient(circle at 25% 40%, oklch(0.7 0.16 240 / 0.35), transparent 45%),
                    radial-gradient(circle at 70% 60%, oklch(0.75 0.14 200 / 0.35), transparent 45%)
                  `,
                  backgroundSize: "40px 40px, 40px 40px, 100% 100%, 100% 100%",
                }} />
                {[
                  { top: "18%", left: "22%", label: "Hotel", icon: Hotel, color: "bg-blue-500" },
                  { top: "38%", left: "58%", label: "Restaurant", icon: UtensilsCrossed, color: "bg-orange-500" },
                  { top: "62%", left: "30%", label: "Attraction", icon: Landmark, color: "bg-primary" },
                  { top: "50%", left: "78%", label: "Restaurant", icon: UtensilsCrossed, color: "bg-orange-500" },
                  { top: "78%", left: "60%", label: "Airport", icon: Plane, color: "bg-slate-700" },
                  { top: "28%", left: "82%", label: "Railway", icon: Train, color: "bg-emerald-600" },
                ].map((m, i) => (
                  <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: m.top, left: m.left }}>
                    <div className="relative group">
                      <div className={cn("absolute inset-0 rounded-full animate-ping opacity-40", m.color)} />
                      <div className={cn("relative grid h-9 w-9 place-items-center rounded-full text-white shadow-elegant", m.color)}>
                        <m.icon className="h-4 w-4" />
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 rounded bg-card px-2 py-0.5 text-[10px] font-medium shadow-soft border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.label}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="absolute bottom-3 right-3 rounded-lg bg-card/90 backdrop-blur border border-border px-3 py-1.5 text-[10px] font-medium shadow-soft">
                  Interactive preview • {input.destination}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                {[["Hotel", "bg-blue-500"], ["Restaurant", "bg-orange-500"], ["Attraction", "bg-primary"], ["Airport", "bg-slate-700"], ["Railway", "bg-emerald-600"]].map(([l, c]) => (
                  <span key={l} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium">
                    <span className={cn("h-2 w-2 rounded-full", c)} /> {l}
                  </span>
                ))}
              </div>
            </Section>

            {/* Weather widget */}
            <Section title="Weather" icon={CloudSun}>
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 border border-border p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-5xl font-black font-display text-primary tabular-nums">{plan.weather.temp}°</div>
                    <div className="text-sm text-muted-foreground mt-1">{plan.weather.condition}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Feels like {plan.weather.feelsLike}°C</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 flex-1 min-w-[220px]">
                    <WeatherStat icon={Droplets} label="Humidity" value={`${plan.weather.humidity}%`} />
                    <WeatherStat icon={Wind} label="Wind" value={`${plan.weather.wind} km/h`} />
                    <WeatherStat icon={CloudSun} label="Rain" value={`${plan.weather.rain}%`} />
                    <WeatherStat icon={Sun} label="UV" value={`${plan.weather.uv}`} />
                    <WeatherStat icon={Sunrise} label="Sunrise" value={plan.weather.sunrise} />
                    <WeatherStat icon={Sunset} label="Sunset" value={plan.weather.sunset} />
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ChatAssistant plan={plan} setPlan={setPlan} currency={cur} />

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
                    <span className="text-primary mt-0.5">•</span><span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Cultural etiquette" icon={Camera} compact>
              <ul className="space-y-3 text-sm">
                {plan.cultureTips.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                    <span className="text-primary mt-0.5">•</span><span>{t}</span>
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
                    <span className="text-primary mt-0.5">•</span><span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Emergency contacts" icon={Phone} compact>
              <ul className="space-y-2 text-sm">
                {plan.emergency.map((e) => (
                  <li key={e.label} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 hover:bg-secondary transition-colors">
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <e.icon className="h-3.5 w-3.5 text-primary" />{e.label}
                    </span>
                    <a href={`tel:${e.number}`} className="font-bold text-primary tabular-nums text-xs">{e.number}</a>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

// ---------------- UI helpers ----------------
function HeroChip({ icon: Icon, children }: { icon?: typeof Calendar; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1 text-xs font-medium text-white">
      {Icon && <Icon className="h-3.5 w-3.5" />}{children}
    </span>
  );
}

function ScoreCard({ icon: Icon, label, value, suffix, color }: { icon: typeof Wallet; label: string; value: string; suffix: string; color: string }) {
  return (
    <div className={cn("rounded-2xl p-5 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all text-white bg-gradient-to-br", color)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-90">
        <Icon className="h-4 w-4" />{label}
      </div>
      <div className="mt-2 font-black font-display text-3xl">
        {value}<span className="text-sm font-medium opacity-80">{suffix}</span>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 hover:shadow-soft transition-all">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />{label}
      </div>
      <div className="mt-1 font-bold text-sm truncate">{value}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children, compact, className, gradient }: { title: string; icon: typeof Calendar; children: React.ReactNode; compact?: boolean; className?: string; gradient?: boolean }) {
  return (
    <section className={cn(
      "rounded-3xl border border-border shadow-soft animate-fade-in",
      gradient ? "bg-gradient-hero" : "bg-card",
      compact ? "p-5" : "p-6 sm:p-7",
      className,
    )}>
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

function WeatherStat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card/70 border border-border px-3 py-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wide">{label}</div>
        <div className="text-sm font-bold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  Pool: Waves, WiFi: Wifi, Breakfast: Coffee, Parking: CarIcon, Gym: TrendingUp, Bar: UtensilsCrossed,
};

function HotelCard({ h, currency }: { h: Hotel; currency: Currency }) {
  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all">
      <div className="relative aspect-video overflow-hidden">
        <img src={h.image} alt={h.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <span className="absolute top-2 left-2 rounded-full bg-card/90 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold shadow-soft">{h.tag}</span>
        <span className="absolute top-2 right-2 rounded-full bg-black/60 text-white backdrop-blur px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{h.rating}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-sm truncate">{h.name}</h4>
        <div className="mt-0.5 text-xs text-muted-foreground">{h.area} · {h.distance}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {h.amenities.map((a) => {
            const Icon = AMENITY_ICONS[a] ?? Check;
            return (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
                <Icon className="h-3 w-3 text-primary" />{a}
              </span>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-bold text-primary">{formatMoney(h.price, currency)}<span className="text-[10px] text-muted-foreground font-normal"> /night</span></div>
          <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5">Book later</Button>
        </div>
      </div>
    </div>
  );
}

function RestaurantCard({ r, currency }: { r: Restaurant; currency: Currency }) {
  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all">
      <div className="relative aspect-video overflow-hidden">
        <img src={r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <span className="absolute top-2 left-2 rounded-full bg-card/90 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold">{r.cuisine}</span>
        {r.veg && (
          <span className="absolute top-2 right-2 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-bold">🌱 Veg</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm truncate">{r.name}</h4>
          <span className="inline-flex items-center gap-1 text-xs shrink-0"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{r.rating}</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Popular: <span className="text-foreground/80">{r.dishes.join(", ")}</span>
        </div>
        <div className="mt-3 text-sm font-bold text-primary">
          ~ {formatMoney(r.cost, currency)}<span className="text-[10px] text-muted-foreground font-normal"> /person</span>
        </div>
      </div>
    </div>
  );
}

function AttractionCard({ a, currency }: { a: Attraction; currency: Currency }) {
  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all">
      <div className="relative aspect-video overflow-hidden">
        <img src={a.image} alt={a.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <span className="absolute top-2 left-2 rounded-full bg-card/90 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold">{a.type}</span>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-sm">{a.name}</h4>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{a.desc}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
            <div className="text-muted-foreground text-[10px] uppercase font-semibold">Hours</div>
            <div className="font-medium">{a.hours}</div>
          </div>
          <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
            <div className="text-muted-foreground text-[10px] uppercase font-semibold">Entry</div>
            <div className="font-medium">{a.fee === 0 ? "Free" : formatMoney(a.fee, currency)}</div>
          </div>
          <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
            <div className="text-muted-foreground text-[10px] uppercase font-semibold">Duration</div>
            <div className="font-medium">{a.duration}</div>
          </div>
          <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
            <div className="text-muted-foreground text-[10px] uppercase font-semibold">Best time</div>
            <div className="font-medium">{a.bestTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Chat Assistant ----------------
type Msg = { role: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "Reduce my budget",
  "Add adventure activities",
  "Add nightlife",
  "Make it kid friendly",
  "Suggest vegetarian restaurants",
  "Avoid crowded places",
  "Shorten the trip",
  "Luxury version",
  "Budget version",
];

function ChatAssistant({ plan, setPlan, currency }: { plan: Plan; setPlan: (p: Plan) => void; currency: Currency }) {
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
      const { reply, updated } = applyToPlan(trimmed, plan, currency);
      if (updated) setPlan(updated);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setTyping(false);
      if (updated) toast.success("Itinerary updated");
    }, 800);
  };

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden flex flex-col h-[560px]">
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

function applyToPlan(q: string, plan: Plan, _currency: Currency): { reply: string; updated: Plan | null } {
  const l = q.toLowerCase();

  if (l.includes("shorten")) {
    if (plan.days.length <= 2) return { reply: "Trip is already at minimum length.", updated: null };
    return { reply: "Trimmed the last day and rebalanced the highlights.", updated: { ...plan, days: plan.days.slice(0, -1) } };
  }

  if (l.includes("luxury")) {
    const factor = 1.5;
    return {
      reply: "Upgraded to luxury: 5-star boutique stays, chef's tasting menus, and private guided tours.",
      updated: {
        ...plan,
        totalCost: Math.round(plan.totalCost * factor),
        budget: plan.budget.map((b) => ({ ...b, amount: Math.round(b.amount * factor) })),
        hotels: plan.hotels.map((h) => ({ ...h, price: Math.round(h.price * 1.8), tag: "Luxury" })),
      },
    };
  }

  if (l.includes("budget") || l.includes("cheap") || l.includes("reduce")) {
    const newTotal = Math.round(plan.totalCost * 0.8);
    return {
      reply: "Trimmed budget by ~20%: swapped a boutique stay for a highly-rated guesthouse and added two free walking tours.",
      updated: {
        ...plan, totalCost: newTotal,
        budget: plan.budget.map((b) => ({ ...b, amount: Math.round(newTotal * (b.pct / 100)) })),
        hotels: plan.hotels.map((h) => ({ ...h, price: Math.round(h.price * 0.75) })),
      },
    };
  }

  if (l.includes("adventure")) {
    const extra: Day = { title: "Adventure Day", morning: "Sunrise kayaking with a local guide.", afternoon: "Full-day hike with waterfall lunch stop.", evening: "Sunset paragliding — tandem option for beginners.", highlight: "Adrenaline day" };
    return { reply: "Added kayaking, a hike, and paragliding. Pack good shoes!", updated: { ...plan, days: [...plan.days, extra] } };
  }

  if (l.includes("kid") || l.includes("family")) {
    return {
      reply: "Reworked for families: hands-on cooking class, wildlife park, and a kid-friendly resort with a pool.",
      updated: {
        ...plan, familyScore: Math.min(98, plan.familyScore + 10),
        hotels: [{ ...plan.hotels[0], name: "Family Cove Resort", area: "Beachfront", tag: "Kids club & pool", amenities: ["Pool", "WiFi", "Breakfast", "Parking"] }, ...plan.hotels.slice(1)],
      },
    };
  }

  if (l.includes("night")) {
    const extra: Day = { title: "Nightlife & Live Music", morning: "Slow brunch at a rooftop cafe.", afternoon: "Vinyl shops and cocktail-making workshop.", evening: "Live jazz venue, then a rooftop bar tour.", highlight: "Late night pick" };
    return { reply: "Nightlife added: live music, rooftop cocktails, and a club district walk.", updated: { ...plan, days: [...plan.days, extra] } };
  }

  if (l.includes("veg")) {
    const extras: Restaurant[] = [
      { name: "Green Bowl Kitchen", cuisine: "Vegetarian", rating: 4.7, cost: 18, dishes: ["Buddha bowl", "Miso soup"], veg: true, image: img("veg-1") },
      { name: "Herb & Grain", cuisine: "Plant-based", rating: 4.8, cost: 22, dishes: ["Cauliflower steak", "Tahini bowl"], veg: true, image: img("veg-2") },
    ];
    return { reply: "Added two top-rated vegetarian spots to your list.", updated: { ...plan, restaurants: [...extras, ...plan.restaurants] } };
  }

  if (l.includes("crowd") || l.includes("avoid")) {
    return { reply: "Rescheduled crowded spots for early morning and swapped one busy market for a quieter neighborhood tour.", updated: { ...plan, crowd: "Low" } };
  }

  if (l.includes("hidden") || l.includes("gem")) {
    const extras = [
      { name: "The Blue Door Speakeasy", desc: "Unmarked bar behind a florist — password changes weekly." },
      { name: "Sunset Wall at Fort Ridge", desc: "10-min uphill walk from the last metro stop. Locals only." },
    ];
    return { reply: "Slipped in two more local favorites — a hidden speakeasy and a sunset wall.", updated: { ...plan, hiddenGems: [...plan.hiddenGems, ...extras] } };
  }

  return { reply: "Try: 'reduce budget', 'add adventure', 'add nightlife', 'make it kid friendly', 'suggest vegetarian restaurants', 'avoid crowded places', 'shorten the trip', 'luxury version'.", updated: null };
}
