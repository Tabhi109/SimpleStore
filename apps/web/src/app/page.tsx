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
  Globe,
  HardDrive,
  Layers,
  Layout,
  Moon,
  Palette,
  Rocket,
  Shield,
  ShoppingBag,
  Sparkles,
  Tag,
  Type,
  Zap,
} from "lucide-react";
import { HealthCheckResponse } from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";

export default function HomePage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg shadow-sm">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              SimpleStore
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Merchant Login</Link>
            </Button>
            <Button size="sm" className="gap-2 shadow-sm font-semibold" asChild>
              <Link href="/onboarding">
                <Sparkles className="h-4 w-4" />
                Launch Store Free
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-b border-border/40">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-4 text-center space-y-6 relative z-10">
          <Badge
            variant="outline"
            className="gap-2 py-1.5 px-4 text-xs font-semibold rounded-full border-primary/30 bg-primary/5 text-primary shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            SimpleStore • Your store. Without the complexity.
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Sell online in <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-2">5 minutes</span> with zero effort.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Answer 4 quick questions. Our deterministic design token matrix and AI copywriter build your storefront, catalog, and merchant dashboard instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-12 px-8 text-base font-bold gap-2 shadow-lg" asChild>
              <Link href="/onboarding">
                <Rocket className="h-5 w-5" />
                Start 5-Minute Setup
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base font-semibold" asChild>
              <Link href="/dashboard">
                Merchant Admin Portal
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights: Design Matrix & Capabilities */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Smart Frontend Architecture & Design Matrix
            </h2>
            <p className="text-sm text-muted-foreground">
              Guaranteed beautiful stores with 80+ mathematically harmonious combinations. No ugly drag-and-drop mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Theme Matrix */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Layout className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  4 Curated Style Archetypes
                </CardTitle>
                <CardDescription className="text-xs">
                  Minimalist, Editorial Luxury, Warm Organic, and Bold High-Contrast. Instantly switchable with zero CSS overhead.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2: Currency & Dark Mode */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Custom Currency & Storefront Dark Mode
                </CardTitle>
                <CardDescription className="text-xs">
                  Sell in USD ($), INR (₹), EUR (€), GBP (£), and CAD ($). Optional visitor theme switch in header.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3: Coupons & Transaction Safety */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <Tag className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">
                  Promo Codes & ACID Checkout
                </CardTitle>
                <CardDescription className="text-xs">
                  Server-side coupon validation, row-locked atomic inventory deduction, and instant demo order receipts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Live System Diagnostics Telemetry */}
      <section className="py-12 bg-background border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 space-y-4">
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
                className={`text-[11px] font-mono gap-1 ${
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
            {/* Database Status */}
            <div className="rounded-lg border border-border p-3.5 bg-card flex items-center justify-between">
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

            {/* Redis Status */}
            <div className="rounded-lg border border-border p-3.5 bg-card flex items-center justify-between">
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

            {/* AI Engine Status */}
            <div className="rounded-lg border border-border p-3.5 bg-card flex items-center justify-between">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 py-8 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <p className="font-semibold text-foreground">
            SimpleStore — High-Performance E-Commerce Portfolio Application
          </p>
          <p>Next.js 14 • FastAPI • PostgreSQL • Redis • Sarvam AI</p>
        </div>
      </footer>
    </div>
  );
}
