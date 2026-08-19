"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Database,
  Server,
  Zap,
  ArrowRight,
  ShieldCheck,
  Palette,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { HealthCheckResponse } from "@simplestore/shared-types";

export default function HomePage() {
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth,
  } = useQuery<HealthCheckResponse>({
    queryKey: ["system-health"],
    queryFn: () => apiClient.health.check(),
    refetchInterval: 10000,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 px-4 text-center relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="container max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI-Guided Store Launch in 5 Minutes</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your store. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Without the complexity.
            </span>
          </h1>

          <p className="max-w-2xl text-muted-foreground text-base sm:text-lg md:text-xl font-normal leading-relaxed">
            Answer 4 simple questions, pick a curated visual style, and let SimpleStore craft your
            branding, starter products, and publish a live storefront with zero drag-and-drop fatigue.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button size="lg" className="h-12 px-8 text-base shadow-md font-semibold" asChild>
              <Link href="/onboarding">
                Start 5-Minute Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
                Explore FastAPI Docs
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Live System Diagnostics & Health Card */}
      <section className="container max-w-5xl mx-auto px-4 py-8">
        <Card className="border-border/80 shadow-sm overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-4 bg-muted/20 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">System Foundation & Diagnostics</CardTitle>
                  <CardDescription className="text-xs">
                    Live telemetry across FastAPI, PostgreSQL, Redis, and AI boundaries
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isHealthLoading ? (
                  <Badge variant="outline" className="animate-pulse">Checking...</Badge>
                ) : isHealthError ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> API Disconnected
                  </Badge>
                ) : (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {health?.status?.toUpperCase()}
                  </Badge>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => refetchHealth()}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Backend Service */}
            <div className="p-4 rounded-lg border bg-background flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">FastAPI Backend</span>
                <Server className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-base font-bold">
                {isHealthLoading ? <Skeleton className="h-5 w-20" /> : isHealthError ? "Offline" : "v0.1.0 Ready"}
              </div>
              <div className="text-xs text-muted-foreground">Port 8000 (REST & OpenAPI)</div>
            </div>

            {/* PostgreSQL */}
            <div className="p-4 rounded-lg border bg-background flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PostgreSQL 16</span>
                <Database className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-base font-bold flex items-center gap-1.5">
                {isHealthLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : health?.database?.connected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Connected</span>
                    {health.database.latency_ms !== undefined && (
                      <span className="text-xs font-normal text-muted-foreground">({health.database.latency_ms}ms)</span>
                    )}
                  </>
                ) : (
                  <span className="text-destructive text-sm font-medium">Pending DB</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">ACID Source of Truth</div>
            </div>

            {/* Redis */}
            <div className="p-4 rounded-lg border bg-background flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redis 7</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-base font-bold flex items-center gap-1.5">
                {isHealthLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : health?.redis?.connected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Active</span>
                    {health.redis.latency_ms !== undefined && (
                      <span className="text-xs font-normal text-muted-foreground">({health.redis.latency_ms}ms)</span>
                    )}
                  </>
                ) : (
                  <span className="text-destructive text-sm font-medium">Pending Cache</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Storefront Caching & Rates</div>
            </div>

            {/* Sarvam AI Boundary */}
            <div className="p-4 rounded-lg border bg-background flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Boundary</span>
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div className="text-base font-bold">
                {isHealthLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : health?.ai_provider?.configured ? (
                  <Badge variant="success" className="text-xs">Sarvam AI Ready</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Fallback Active</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">100% Optional & Isolated</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pre-Defined Themes Showcase */}
      <section className="container max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pre-Defined UI/UX Archetypes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Zero design guesswork. SimpleStore maps your brand to curated, professional templates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Minimal */}
          <div className="group relative rounded-xl border p-5 bg-card hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base">Minimal</span>
                <Badge variant="outline" className="text-[10px]">Clean / Sans</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Crisp monochrome whitespace with geometric typography. Perfect for modern accessories & essentials.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t text-[11px] text-muted-foreground font-mono">
              <span className="h-3 w-3 rounded-full bg-slate-900" />
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              <span className="h-3 w-3 rounded-full bg-slate-100 border" />
            </div>
          </div>

          {/* Editorial */}
          <div className="group relative rounded-xl border p-5 bg-card hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base">Editorial</span>
                <Badge variant="outline" className="text-[10px]">Serif / Luxury</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                High-end magazine aesthetic with elegant serif typography and storytelling product layouts.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t text-[11px] text-muted-foreground font-mono">
              <span className="h-3 w-3 rounded-full bg-[#1e293b]" />
              <span className="h-3 w-3 rounded-full bg-[#d97706]" />
              <span className="h-3 w-3 rounded-full bg-[#fafaf9] border" />
            </div>
          </div>

          {/* Warm */}
          <div className="group relative rounded-xl border p-5 bg-card hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base">Warm</span>
                <Badge variant="outline" className="text-[10px]">Organic / Soft</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Earthy terracotta tones, rounded product cards, and soft ambient surfaces for bakeries, crafts & lifestyle.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t text-[11px] text-muted-foreground font-mono">
              <span className="h-3 w-3 rounded-full bg-[#451a03]" />
              <span className="h-3 w-3 rounded-full bg-[#ea580c]" />
              <span className="h-3 w-3 rounded-full bg-[#fffbeb] border" />
            </div>
          </div>

          {/* Bold */}
          <div className="group relative rounded-xl border p-5 bg-card hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base">Bold</span>
                <Badge variant="outline" className="text-[10px]">High-Contrast</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Vibrant accents, strong borders, and expressive energetic layouts for streetwear & digital creators.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t text-[11px] text-muted-foreground font-mono">
              <span className="h-3 w-3 rounded-full bg-[#09090b]" />
              <span className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
              <span className="h-3 w-3 rounded-full bg-[#ffffff] border" />
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Principles Highlights */}
      <section className="container max-w-5xl mx-auto px-4 py-12 border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Server-Validated Calculations</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Prices and inventory allocations are recalculated and locked within ACID database transactions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Strict AI Boundary</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sarvam AI powers copy assistance and starter drafts with full manual fallbacks and zero client key leaks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Modular Monolith</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Clean domain separation without distributed microservices or unnecessary infrastructure overhead.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
