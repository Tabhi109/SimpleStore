"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  Flame,
  Heart,
  Layout,
  Package,
  Palette,
  Receipt,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  Type,
  Users,
  Zap,
} from "lucide-react";
import {
  ColorPreset,
  FontPairing,
  ThemeArchetype,
} from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  COLOR_PRESETS,
  FONT_PAIRINGS,
  THEME_ARCHETYPES,
  formatPrice,
} from "@/lib/theme-utils";

export default function HomePage() {
  const [sandboxArchetype, setSandboxArchetype] = useState<ThemeArchetype>("editorial");
  const [sandboxColor, setSandboxColor] = useState<ColorPreset>("rose");
  const [sandboxFont, setSandboxFont] = useState<FontPairing>("serif");

  const activeArch = THEME_ARCHETYPES[sandboxArchetype];
  const activeCol = COLOR_PRESETS[sandboxColor];
  const activeFnt = FONT_PAIRINGS[sandboxFont];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border/40">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Launch Your Store in 5 Minutes • No Technical Skills Needed</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            Turn your passion into a{" "}
            <span className="bg-gradient-to-r from-primary via-rose-600 to-amber-600 bg-clip-text text-transparent">
              thriving online store.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            Create an independent, designer-grade storefront in minutes. Complete with automated product setup, multi-photo galleries, Cash on Delivery checkout, and order management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-sm font-bold gap-2.5 shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
              asChild
            >
              <Link href="/onboarding">
                <Rocket className="h-4.5 w-4.5" />
                <span>Start Your Store Free</span>
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
                <span>Merchant Dashboard</span>
              </Link>
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Zero setup fees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Mobile-first luxury layouts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Cash on Delivery (COD) ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE VALUE PILLARS */}
      <section className="py-20 border-b border-border/40 bg-card/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Built for Modern Merchants
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need to sell online. None of the complexity.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Traditional e-commerce platforms force you into endless plugins and broken theme builders. SimpleStore gives you curated, developer-grade conversion architecture out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Palette className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Pre-Built Luxury Aesthetics</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Choose from Editorial Luxury, Streetwear Bold, Warm Artisanal, or Clean Minimal styles. Guaranteed typography and balanced spacing on all devices.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs text-primary font-semibold flex items-center gap-1">
                <span>Multi-photo zoom galleries included</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Cash on Delivery & Instant Checkout</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Reduce cart abandonment with streamlined COD checkout, one-click suggested coupon pills, live address validation, and instant receipt confirmation.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <span>One-click coupon discount codes</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">All-in-One Merchant Hub</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Manage inventory in fast editable tables, update stock limits, process customer orders with line-item detail, and generate printable PDF invoices.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs text-amber-600 font-semibold flex items-center gap-1">
                <span>Single-click invoice generation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE STOREFRONT CUSTOMIZER SANDBOX */}
      <section className="py-20 sm:py-24 border-b border-border/40 bg-muted/10 relative">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
              Interactive Preview
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Test your store’s look and feel
            </h2>
            <p className="text-sm text-muted-foreground">
              Select different brand styles, font pairings, and accent colors below to see how our design engine instantly shapes the customer experience.
            </p>
          </div>

          {/* Sandbox Controls */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Archetypes */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layout className="h-3.5 w-3.5 text-primary" />
                  1. Brand Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEME_ARCHETYPES) as ThemeArchetype[]).map((key) => {
                    const arch = THEME_ARCHETYPES[key];
                    const isSelected = sandboxArchetype === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSandboxArchetype(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="font-bold text-xs block">{arch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-primary" />
                  2. Typography
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FONT_PAIRINGS) as FontPairing[]).map((key) => {
                    const font = FONT_PAIRINGS[key];
                    const isSelected = sandboxFont === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSandboxFont(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="font-bold text-xs block">{font.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  3. Color Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(COLOR_PRESETS) as ColorPreset[]).map((key) => {
                    const cp = COLOR_PRESETS[key];
                    const isSelected = sandboxColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSandboxColor(key)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20 bg-muted"
                            : "border-border/60 hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              key === "slate"
                                ? "#1e293b"
                                : key === "rose"
                                ? "#e11d48"
                                : key === "amber"
                                ? "#d97706"
                                : key === "emerald"
                                ? "#059669"
                                : "#4f46e5",
                          }}
                        />
                        <span>{cp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Interactive Product Card Demo */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 bg-background ${activeArch.cardClass} ${activeFnt.bodyClass}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">
                    {activeArch.name} • Live Preview
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight text-foreground ${activeFnt.headingClass}`}>
                    Velvet & Flame Candles
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hand-poured organic soy wax infused with lavender and amber notes.
                  </p>
                </div>
                <Button size="sm" className="gap-2 font-bold text-xs" asChild>
                  <Link href="/onboarding">
                    <Rocket className="h-3.5 w-3.5" />
                    Launch this Style
                  </Link>
                </Button>
              </div>

              {/* Sample Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                {[
                  {
                    name: "Midnight Amber & Smoke",
                    code: "SKU-001",
                    price: 34,
                    mrp: 45,
                    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
                    badge: "Best Seller",
                  },
                  {
                    name: "French Lavender Sanctuary",
                    code: "SKU-002",
                    price: 28,
                    mrp: 35,
                    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
                    badge: "Signature",
                  },
                  {
                    name: "Wild Fig & Cedar Vessel",
                    code: "SKU-003",
                    price: 38,
                    mrp: 48,
                    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
                    badge: "Limited Edition",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-card border border-border/70 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted/40">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <Badge className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider">
                          {item.badge}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          <span>{item.code}</span>
                          <span>In Stock</span>
                        </div>
                        <h4 className={`font-bold text-sm text-foreground line-clamp-1 ${activeFnt.headingClass}`}>
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-sm text-foreground">
                          ${item.price}.00
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${item.mrp}.00
                        </span>
                      </div>
                      <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs font-bold gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="py-20 border-b border-border/40 bg-background">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              From idea to online orders in 5 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm mx-auto md:mx-0">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground">Tell Us What You Sell</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Provide your store name, business category, and what makes your products unique.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm mx-auto md:mx-0">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground">Customize & Fine-Tune</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Preview your store live on mobile and desktop. Adjust brand tone, fonts, colors, and starter catalog.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm mx-auto md:mx-0">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground">Launch & Accept Orders</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Receive orders directly in your merchant dashboard with built-in Cash on Delivery support and printable invoices.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <Button
              size="lg"
              className="h-12 px-8 font-bold text-sm gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
              asChild
            >
              <Link href="/onboarding">
                <Rocket className="h-4 w-4" />
                <span>Create Your Store Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-card border-t border-border/60 py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-bold text-foreground">SimpleStore</span>
            <span>• Independent E-Commerce for Modern Brands</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/onboarding" className="hover:text-foreground transition-colors">
              Launch Store
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Merchant Portal
            </Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
