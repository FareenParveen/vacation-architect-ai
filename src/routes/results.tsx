import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  MapPin, Calendar, Wallet, Users, Sparkles, Download, Share2, Bookmark,
  Hotel, UtensilsCrossed, Package, Lightbulb, Shield, TrendingUp, Sun,
  Send, Bot, User as UserIcon, Loader2, Plane, Clock, Star, Check,
} from "lucide-react";
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

type Plan = {
  summary: string;
  days: { title: string; morning: string; afternoon: string; evening: string; highlight: string }[];
  budget: { label: string; amount: number; pct: number }[];
  hotels: { name: string; rating: number; price: number; area: string; tag: string }[];
  foods: { name: string; type: string; note: string }[];
  packing: string[];
  tips: string[];
  totalCost: number;
  bestTime: string;
  safety: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
};

const LOADING_STEPS = [
  "Analyzing destination...",
  "Finding attractions...",
  "Matching your interests...",
  "Building your itinerary...",
  "Curating hotels & food...",
  "Almost done...",
];

function buildPlan(t: TripInput): Plan {
  const dest = t.destination;
  const per = Math.round(t.budget / t.days);
  const themes = [
    "Arrival & Old Town Wander", "Cultural Landmarks", "Local Markets & Cuisine",
    "Nature & Scenic Escape", "Adventure Day", "Hidden Gems Tour", "Relaxation & Departure",
    "Coastal Getaway", "Mountain Trek", "Nightlife & Live Music",
  ];
  return {
    summary: `A ${t.days}-day ${t.style.toLowerCase()} adventure through ${dest}, blending ${t.interests.slice(0, 3).join(", ").toLowerCase()} with authentic local moments. Curated for ${t.travelers} traveler${t.travelers > 1 ? "s" : ""} with a $${t.budget.toLocaleString()} budget.`,
    days: Array.from({ length: t.days }).map((_, i) => ({
      title: themes[i % themes.length],
      morning: `Start with a slow breakfast at a neighborhood cafe, then head to ${["the historic center", "a scenic viewpoint", "a local market", "a hidden temple"][i % 4]}.`,
      afternoon: `Explore ${dest}'s ${["famous landmarks", "artisan quarter", "waterfront promenade", "botanical gardens"][i % 4]} and grab lunch at a locally-loved spot.`,
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
      { name: `The ${dest.split(",")[0]} Boutique`, rating: 4.8, price: Math.round(per * 0.5), area: "Old Town", tag: "Editor's pick" },
      { name: "Riverside Grand Hotel", rating: 4.6, price: Math.round(per * 0.4), area: "City Center", tag: "Best value" },
      { name: "Skyline Loft Suites", rating: 4.7, price: Math.round(per * 0.55), area: "Downtown", tag: "Rooftop pool" },
    ],
    foods: [
      { name: "Sunrise Noodle House", type: "Local breakfast", note: "Family-run, cash only, arrive early." },
      { name: "Mercado Central", type: "Street food market", note: "Try the grilled skewers and fresh juice." },
      { name: "Chef Amara's Table", type: "Fine dining", note: "Seasonal tasting menu — reserve 2 weeks ahead." },
      { name: "Café des Voyageurs", type: "Cozy cafe", note: "Best flat white in the neighborhood." },
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
      "Try public transit at least once — it's cheaper and more scenic.",
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
    }, 700);
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
              <div key={s} className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all",
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
                <span className="text-sm font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <ResultsDashboard input={input} plan={plan} />;
}

function ResultsDashboard({ input, plan }: { input: TripInput; plan: Plan }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-hero border border-border p-6 sm:p-8 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-generated itinerary
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
                <MapPin className="h-8 w-8 text-primary" />
                {input.destination}
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">{plan.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Chip icon={Calendar}>{input.days} days</Chip>
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
            <Section title="Local food recommendations" icon={UtensilsCrossed}>
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.foods.map((f) => (
                  <div key={f.name} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{f.name}</h4>
                      <span className="text-[10px] rounded-full bg-secondary px-2 py-0.5">{f.type}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.note}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ChatAssistant />

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

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold flex items-center gap-2"><Download className="h-4 w-4 text-primary" />Save your trip</h3>
              <div className="mt-4 space-y-2">
                <Button className="w-full bg-gradient-primary shadow-soft" onClick={() => toast.success("PDF export started")}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast.success("Trip saved to your library")}>
                  <Bookmark className="mr-2 h-4 w-4" /> Save Trip
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: "My trip", text: input.destination, url: window.location.href }).catch(() => {});
                  } else {
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
    <section className={cn("rounded-3xl border border-border bg-card shadow-soft", compact ? "p-5" : "p-6 sm:p-7")}>
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

function ChatAssistant() {
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
      setMessages((m) => [...m, { role: "bot", text: replyFor(trimmed) }]);
      setTyping(false);
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
          <div key={i} className={cn("flex gap-2 items-start", m.role === "user" && "flex-row-reverse")}>
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

function replyFor(q: string): string {
  const l = q.toLowerCase();
  if (l.includes("budget") || l.includes("cheap") || l.includes("reduce"))
    return "I've trimmed your budget by ~20%. I swapped a boutique hotel for a highly-rated guesthouse and added two free walking tours. Your daily food budget still covers memorable meals.";
  if (l.includes("adventure"))
    return "Added kayaking on Day 2, a full-day hiking trail on Day 4, and a sunset paragliding session on Day 5. Difficulty updated to Moderate — you'll want good shoes!";
  if (l.includes("family"))
    return "Reworked the itinerary for families: added a hands-on cooking class, a wildlife park visit, and swapped late nights for early sunrise activities. Hotel changed to a kid-friendly resort with a pool.";
  if (l.includes("hidden") || l.includes("gem"))
    return "Loving this! I've slipped in three local favorites: a rooftop jazz bar only locals know, a sunrise viewpoint 20 min from the center, and a family-run bakery famous for its almond croissants.";
  if (l.includes("night"))
    return "Nightlife added: a live music venue on Day 2, a rooftop cocktail bar tour on Day 4, and a curated club district walk on Day 6 with an optional after-hours spot.";
  if (l.includes("veg"))
    return "Great! I've added five vegetarian-friendly spots including a plant-based tasting menu, two vegan cafes, and a farmer's market with amazing produce. All existing recommendations have veg options marked.";
  return "Got it — I've updated your itinerary. Any other tweaks you'd like? You can ask me to shift the pace, swap activities, or focus on a specific interest.";
}
