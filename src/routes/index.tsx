import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Compass, Map, Wallet, Zap, Shield, Globe2, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-travel.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  { icon: Sparkles, title: "AI-Crafted Itineraries", desc: "Personalized day-by-day plans generated in seconds, tuned to your pace and taste." },
  { icon: Wallet, title: "Smart Budget Planner", desc: "Transparent breakdowns for flights, stays, food, and activities — no surprises." },
  { icon: Compass, title: "Local Hidden Gems", desc: "Discover off-the-beaten-path cafes, viewpoints, and experiences locals love." },
  { icon: Shield, title: "Safety Insights", desc: "Real-time safety scores, health tips, and travel advisories for every destination." },
  { icon: MessageCircle, title: "AI Trip Assistant", desc: "Chat naturally to refine your plan — reduce budget, add adventure, go vegetarian." },
  { icon: Globe2, title: "200+ Destinations", desc: "From Tokyo neon nights to Patagonian glaciers — the world is one prompt away." },
];

const STATS = [
  { v: "120k+", l: "Trips Planned" },
  { v: "4.9★", l: "Traveler Rating" },
  { v: "190+", l: "Countries" },
  { v: "< 30s", l: "To Full Itinerary" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Powered by next-generation travel AI
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Plan Your <span className="text-gradient">Dream Trip</span> with AI
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                TripGenie AI crafts personalized travel plans tailored to your budget, interests, and travel style — complete itineraries, local gems, and smart tips in under 30 seconds.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all group h-12 px-6">
                  <Link to="/plan">
                    Start Planning
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6">
                  <a href="#features">See how it works</a>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-4 gap-4 max-w-md">
                {STATS.map((s) => (
                  <div key={s.l}>
                    <div className="text-xl sm:text-2xl font-bold font-display">{s.v}</div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-elegant bg-card">
                <img
                  src={heroImg}
                  alt="Illustrated world map with travel icons"
                  width={1600}
                  height={1200}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-elegant p-4 hidden sm:flex items-center gap-3 max-w-xs">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Kyoto in 7 days</div>
                  <div className="text-xs text-muted-foreground">Generated in 24s • $1,840</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 rounded-2xl bg-card border border-border shadow-elegant p-3 hidden sm:flex items-center gap-2">
                <Heart className="h-4 w-4 text-destructive" fill="currentColor" />
                <span className="text-xs font-medium">Loved by 12k travelers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-primary uppercase tracking-wider">Why TripGenie</div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Everything you need for a perfect trip</h2>
          <p className="mt-4 text-muted-foreground">From your first spark of wanderlust to boarding the plane — we handle the details so you can focus on the memories.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-soft group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="rounded-3xl bg-gradient-hero border border-border p-8 sm:p-12 lg:p-16 shadow-soft">
          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { n: "01", icon: Map, t: "Tell us your dream", d: "Share your destination, dates, budget, and what excites you." },
              { n: "02", icon: Sparkles, t: "AI does the magic", d: "Our engine analyzes thousands of options and crafts your perfect plan." },
              { n: "03", icon: Compass, t: "Pack and explore", d: "Download, share, or refine your itinerary with our AI assistant." },
            ].map((s) => (
              <div key={s.n}>
                <div className="text-5xl font-black font-display text-primary/20">{s.n}</div>
                <div className="mt-4 inline-flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">{s.t}</h3>
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elegant hover:shadow-glow h-12 px-8">
              <Link to="/plan">Start Planning Your Trip <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
