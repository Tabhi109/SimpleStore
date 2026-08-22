"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  DollarSign,
  HardDrive,
  Layout,
  Palette,
  Rocket,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  ColorPreset,
  FontPairing,
  HealthCheckResponse,
  ThemeArchetype,
} from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import {
  COLOR_PRESETS,
  FONT_PAIRINGS,
  THEME_ARCHETYPES,
  formatPrice,
} from "@/lib/theme-utils";

export default function HomePage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Live Interactive Sandbox State
  const [sandboxArchetype, setSandboxArchetype] = useState<ThemeArchetype>("minimal");
  const [sandboxColor, setSandboxColor] = useState<ColorPreset>("indigo");
  const [sandboxFont, setSandboxFont] = useState<FontPairing>("sans");

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await apiClient.get<HealthCheckResponse>("/health");
        setHealth(data);
      } catch {
        setHealth(null);
      } finally {
        setLoadingHealth(false);
      }
    }
    checkHealth();
  }, []);

  const activeArch = THEME_ARCHETYPES[sandboxArchetype];
  const activeCol = COLOR_PRESETS[sandboxColor];
  const activeFnt = FONT_PAIRINGS[sandboxFont];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/40">
        {/* Ambient Glows & Lighting */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-primary/25 via-primary/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 -left-20 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-sm hover:border-primary/50 transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: "6s" }} />
            <span>SimpleStore • Your store. Without the complexity.</span>
          </div>

          {/* Heading */}
          <h1 className="fluid-hero font-black tracking-tight text-foreground max-w-4xl mx-auto">
            Sell online in{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-blue-500 bg-clip-text text-transparent underline decoration-primary/30 decoration-wavy decoration-2">
              5 minutes
            </span>{" "}
            with zero effort.
          </h1>

          {/* Subtitle */}
          <p className="fluid-body text-muted-foreground max-w-2xl mx-auto font-normal">
            Answer 4 quick questions. Our deterministic design token matrix and AI copywriter build your custom storefront, catalog, and merchant portal in seconds.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-sm font-bold gap-2.5 shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 transition-all hover:scale-[1.02]"
              asChild
            >
              <Link href="/onboarding">
                <Rocket className="h-4.5 w-4.5" />
                Start 5-Minute Setup
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 text-sm font-semibold border-border/80 hover:bg-muted/60 transition-all"
              asChild
            >
              <Link href="/dashboard">
                <Layout className="h-4 w-4 mr-2 text-muted-foreground" />
                Merchant Admin Portal
              </Link>
            </Button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>No coding required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Deterministic Design Tokens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>ACID Row-Locked Inventory</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE DESIGN MATRIX SANDBOX */}
      <section className="py-16 sm:py-24 border-b border-border/40 bg-muted/10 relative">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
              Interactive Live Demo
            </Badge>
            <h2 className="fluid-h2 font-extrabold tracking-tight">
              Test the Deterministic Design Matrix
            </h2>
            <p className="text-sm text-muted-foreground">
              Click the styles, fonts, and colors below to see how our design engine instantly morphs the storefront in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Panel */}
            <div className="lg:col-span-5 space-y-6 bg-card border border-border/80 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Theme Configuration Controls
              </h3>

              {/* Archetypes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  1. Style Archetype
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "minimal", name: "Minimal Clean", icon: "▫️" },
                      { id: "editorial", name: "Editorial Luxury", icon: "✨" },
                      { id: "warm", name: "Warm Organic", icon: "🌿" },
                      { id: "bold", name: "Bold Contrast", icon: "⚡" },
                    ] as const
                  ).map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setSandboxArchetype(arch.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2 ${
                        sandboxArchetype === arch.id
                          ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span>{arch.icon}</span>
                      <span>{arch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  2. Primary Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "slate", name: "Slate", bg: "bg-slate-700" },
                      { id: "indigo", name: "Indigo", bg: "bg-indigo-600" },
                      { id: "emerald", name: "Emerald", bg: "bg-emerald-600" },
                      { id: "amber", name: "Amber", bg: "bg-amber-600" },
                      { id: "rose", name: "Rose", bg: "bg-rose-600" },
                    ] as const
                  ).map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSandboxColor(col.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        sandboxColor === col.id
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${col.bg}`} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Pairings */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  3. Typography Scale
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "sans", name: "Modern Sans" },
                      { id: "serif", name: "Luxury Serif" },
                      { id: "mono", name: "Technical Mono" },
                      { id: "rounded", name: "Soft Rounded" },
                    ] as const
                  ).map((fnt) => (
                    <button
                      key={fnt.id}
                      type="button"
                      onClick={() => setSandboxFont(fnt.id)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        sandboxFont === fnt.id
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {fnt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full h-10 text-xs font-bold gap-2" asChild>
                  <Link href="/onboarding">
                    <Sparkles className="h-3.5 w-3.5" />
                    Launch This Style in 5 Minutes
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Live Rendered Mock Storefront Card */}
            <div className="lg:col-span-7">
              <div
                className={`p-6 sm:p-8 transition-all duration-300 border shadow-lg ${activeArch.cardClass} ${activeArch.roundedClass} ${activeFnt.bodyClass}`}
                style={{
                  background: sandboxArchetype === "bold" ? "#09090b" : undefined,
                }}
              >
                {/* Store Header */}
                <div className="flex items-center justify-between pb-6 border-b border-border/50">
                  <div>
                    <h4
                      className={`text-xl sm:text-2xl font-black ${activeFnt.headingClass}`}
                      style={{ color: activeCol.primary }}
                    >
                      Nordic Brew Roasters
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Artisan Specialty Single-Origin Roasts
                    </p>
                  </div>
                  <div
                    className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-lg text-white"
                    style={{ backgroundColor: activeCol.primary }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Cart (2)</span>
                  </div>
                </div>

                {/* Hero Banner in Store */}
                <div className="py-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Featured Collection
                  </span>
                  <p className="text-base sm:text-lg font-bold leading-snug">
                    Ethically sourced coffee beans roasted fresh weekly in small batches.
                  </p>
                </div>

                {/* Sample Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Product 1 */}
                  <div className="p-4 transition-all duration-200 border rounded-xl bg-card/60">
                    <div className="h-28 rounded-lg bg-muted/60 flex items-center justify-center text-2xl mb-3">
                      ☕
                    </div>
                    <h5 className="font-bold text-sm">Ethiopian Yirgacheffe</h5>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                      Floral jasmine notes, bright lemon acidity.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{formatPrice(18.5, "USD")}</span>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs font-semibold rounded-md text-white"
                        style={{ backgroundColor: activeCol.primary }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Product 2 */}
                  <div className="p-4 transition-all duration-200 border rounded-xl bg-card/60">
                    <div className="h-28 rounded-lg bg-muted/60 flex items-center justify-center text-2xl mb-3">
                      🫘
                    </div>
                    <h5 className="font-bold text-sm">Sumatra Dark Roast</h5>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                      Rich cedar aroma, smoky dark chocolate body.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{formatPrice(19.0, "USD")}</span>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs font-semibold rounded-md text-white"
                        style={{ backgroundColor: activeCol.primary }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE-STEP ZERO-EFFORT WORKFLOW */}
      <section className="py-16 sm:py-24 border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
              Workflow
            </Badge>
            <h2 className="fluid-h2 font-extrabold tracking-tight">
              From Idea to Live Store in 3 Steps
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to sell online without touching a single line of CSS or configuring bloated plugins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="glow-card border-border/70 relative">
              <div className="absolute top-4 right-4 text-3xl font-black text-muted/30">
                01
              </div>
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Answer 4 Questions
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Enter your store name, product category, and target vibe. Our integrated AI copywriter drafts starter products, descriptions, and taglines.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 2 */}
            <Card className="glow-card border-border/70 relative">
              <div className="absolute top-4 right-4 text-3xl font-black text-muted/30">
                02
              </div>
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                  <Layout className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Pick Your Theme Matrix
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Choose from 4 mathematically harmonious Archetypes (Minimal, Editorial, Warm, Bold) and curated colors. Zero layout bugs or ugly mistakes.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 3 */}
            <Card className="glow-card border-border/70 relative">
              <div className="absolute top-4 right-4 text-3xl font-black text-muted/30">
                03
              </div>
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Rocket className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Publish & Accept Orders
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Share your public store link (`/store/your-slug`). Customers add items to cart, use promo coupons, and complete ACID checkout with demo receipts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON MATRIX: SIMPLESTORE VS COMPLEX PLATFORMS */}
      <section className="py-16 sm:py-24 border-b border-border/40 bg-muted/10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
              Why SimpleStore?
            </Badge>
            <h2 className="fluid-h2 font-extrabold tracking-tight">
              SimpleStore vs. Complex E-Commerce
            </h2>
            <p className="text-sm text-muted-foreground">
              Designed for creators and small shops who want to start selling immediately without enterprise headaches.
            </p>
          </div>

          <div className="border border-border/80 rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-4 sm:p-5">Feature / Dimension</th>
                    <th className="p-4 sm:p-5 text-primary font-black bg-primary/5">
                      ✨ SimpleStore
                    </th>
                    <th className="p-4 sm:p-5 text-muted-foreground">
                      Complex Platforms (Shopify / Woo)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Setup Time</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-500 bg-primary/5">
                      ⚡ Under 5 Minutes
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">Hours to days</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Design Reliability</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-500 bg-primary/5">
                      🎯 Deterministic Token Matrix (Guaranteed Gorgeous)
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      Prone to broken CSS & mismatched fonts
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Plugin Overhead</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-500 bg-primary/5">
                      🚀 Zero Plugins (Built-in AI, Coupons & Themes)
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      20+ paid third-party apps and plugins
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Inventory Safety</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-500 bg-primary/5">
                      🔒 PostgreSQL Row-Locking (ACID Atomic Deductions)
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      Often relies on eventual consistency
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Currencies & Dark Mode</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-500 bg-primary/5">
                      🌍 Multi-Currency (USD, INR, EUR, GBP) + Dark Mode
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      Requires specialized apps or theme tweaks
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LIVE SYSTEM INFRASTRUCTURE TELEMETRY */}
      <section className="py-12 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Monolith Infrastructure Health
              </h3>
            </div>
            {health && (
              <Badge
                variant="outline"
                className={`text-[11px] font-mono gap-1.5 ${
                  health.status === "healthy"
                    ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                    : "text-amber-500 border-amber-500/30"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {health.status.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Database */}
            <div className="rounded-xl border border-border/80 p-3.5 bg-card flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <Database className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold">PostgreSQL 16</p>
                  <p className="text-[10px] text-muted-foreground">
                    Async SQLAlchemy 2.0
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-500">
                {health?.database.connected ? `${health.database.latency_ms}ms` : "Offline"}
              </span>
            </div>

            {/* Redis */}
            <div className="rounded-xl border border-border/80 p-3.5 bg-card flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <HardDrive className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs font-semibold">Redis 7</p>
                  <p className="text-[10px] text-muted-foreground">
                    Cache & Sessions
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-500">
                {health?.redis.connected ? `${health.redis.latency_ms}ms` : "Offline"}
              </span>
            </div>

            {/* AI Engine */}
            <div className="rounded-xl border border-border/80 p-3.5 bg-card flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <Bot className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold">Sarvam AI</p>
                  <p className="text-[10px] text-muted-foreground">
                    Structured Copy & Fallbacks
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-500">
                {health?.ai_provider.configured ? "Ready" : "Fallback Ready"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 via-background to-background text-center relative overflow-hidden">
        <div className="container mx-auto max-w-4xl px-4 space-y-6">
          <h2 className="fluid-h2 font-black tracking-tight">
            Ready to launch your store today?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Join small business owners and creators who launch custom storefronts with zero complexity.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              className="h-12 px-8 font-bold gap-2 text-sm shadow-xl shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href="/onboarding">
                <Sparkles className="h-4 w-4" />
                Start Your Store Setup Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
