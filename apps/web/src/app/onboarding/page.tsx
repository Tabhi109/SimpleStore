"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  DollarSign,
  Globe,
  KeyRound,
  Layout,
  Loader2,
  Lock,
  Mail,
  Moon,
  Palette,
  Rocket,
  ShoppingBag,
  Sparkles,
  Type,
  User as UserIcon,
} from "lucide-react";
import {
  ColorPreset,
  FontPairing,
  OnboardingGenerationResult,
  Product,
  StarterProductDraft,
  Store,
  StoreCurrency,
  StoreLanguage,
  ThemeArchetype,
  ThemeConfig,
} from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { useAuthStore } from "@/features/auth/auth-store";
import { apiClient } from "@/lib/api-client";
import {
  COLOR_PRESETS,
  CURRENCY_MAP,
  FONT_PAIRINGS,
  THEME_ARCHETYPES,
} from "@/lib/theme-utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { setAuth, setActiveStore, user, token, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [storeName, setStoreName] = useState("Velvet & Flame Candles");
  const [category, setCategory] = useState("Handmade Scented Candles");
  const [vibe, setVibe] = useState<ThemeArchetype>("editorial");
  const [productSummary, setProductSummary] = useState(
    "Organic soy wax candles infused with lavender, amber, and vanilla essential oils."
  );
  const [currency, setCurrency] = useState<StoreCurrency>("USD");
  const [language, setLanguage] = useState<StoreLanguage>("en");

  const [fontPairing, setFontPairing] = useState<FontPairing>("serif");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("rose");
  const [enableDarkModeToggle, setEnableDarkModeToggle] = useState(true);

  const [tagline, setTagline] = useState("Handcrafted soy candles poured with natural botanicals.");
  const [description, setDescription] = useState(
    "Indulge in artisanal aromatherapeutic scents designed to elevate your home sanctuary."
  );
  const [starterProducts, setStarterProducts] = useState<StarterProductDraft[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartGeneration = async () => {
    if (!storeName.trim() || !category.trim()) {
      setErrorMessage("Please fill in your store name and category.");
      return;
    }
    setErrorMessage(null);
    setStep(2);

    try {
      const generated = await apiClient.post<OnboardingGenerationResult>(
        "/ai/onboarding-generate",
        {
          store_name: storeName,
          category: category,
          vibe: vibe,
          product_summary: productSummary,
          currency: currency,
          language: language,
        }
      );

      if (generated.tagline) setTagline(generated.tagline);
      if (generated.description) setDescription(generated.description);

      if (generated.theme_recommendation) {
        setVibe((generated.theme_recommendation.archetype as ThemeArchetype) || vibe);
        setFontPairing((generated.theme_recommendation.font_pairing as FontPairing) || fontPairing);
        setColorPreset((generated.theme_recommendation.color_preset as ColorPreset) || colorPreset);
      }

      if (Array.isArray(generated.starter_products) && generated.starter_products.length > 0) {
        setStarterProducts(generated.starter_products);
      } else {
        setStarterProducts([
          {
            name: `${storeName} Signature Item`,
            description: `Handcrafted ${category.toLowerCase()} made with pure sustainable ingredients.`,
            suggested_price: 32,
            mrp: 40,
            inventory: 15,
            image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800",
          },
        ]);
      }

      setStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate store. Please try again.");
      setStep(1);
    }
  };

  const handleProceedToLaunch = () => {
    if (isAuthenticated() && token) {
      createAndLaunchStore(token);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please provide both email and password.");
      return;
    }
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      let authToken = "";
      if (authMode === "register") {
        const res = await apiClient.post<{ user: any; tokens: any }>("/auth/register", {
          email: authEmail.trim(),
          password: authPassword,
        });
        authToken = res.tokens.access_token;
        setAuth(res.user, authToken);
      } else {
        const res = await apiClient.post<{ user: any; tokens: any }>("/auth/login", {
          email: authEmail.trim(),
          password: authPassword,
        });
        authToken = res.tokens.access_token;
        setAuth(res.user, authToken);
      }

      setIsAuthModalOpen(false);
      await createAndLaunchStore(authToken);
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const createAndLaunchStore = async (authToken: string) => {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const themePayload: ThemeConfig = {
        archetype: vibe,
        font_pairing: fontPairing,
        color_preset: colorPreset,
        enable_dark_mode_toggle: enableDarkModeToggle,
        hero_style: "centered",
      };

      const newStore = await apiClient.post<Store>(
        "/stores",
        {
          name: storeName.trim(),
          slug: storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: category.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          currency,
          language,
          theme_config: themePayload,
          is_active: true,
          published: true,
        },
        authToken
      );

      for (let i = 0; i < starterProducts.length; i++) {
        const p = starterProducts[i];
        const priceNum = Number(p.suggested_price) || 25;
        const mrpNum = Number(p.mrp) || Math.round(priceNum * 1.25);

        try {
          await apiClient.post(
            `/stores/${newStore.id}/products`,
            {
              name: p.name,
              product_code: `PROD-${(i + 1).toString().padStart(3, "0")}`,
              description: p.description,
              price: priceNum,
              mrp: mrpNum,
              inventory: p.inventory || 10,
              image_url: p.image_url || undefined,
              images: p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : [],
              is_ai_generated: true,
              is_active: true,
              published: true,
            },
            authToken
          );
        } catch (prodErr) {
          console.warn("Failed creating initial product:", prodErr);
        }
      }

      setActiveStore(newStore);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create store. Please try again.");
      setIsPublishing(false);
    }
  };

  const previewThemeConfig: ThemeConfig = {
    archetype: vibe,
    font_pairing: fontPairing,
    color_preset: colorPreset,
    enable_dark_mode_toggle: enableDarkModeToggle,
    hero_style: "centered",
  };

  const previewStore: Store = {
    id: "preview-id",
    owner_id: user?.id || "preview-owner",
    name: storeName || "My Store",
    slug: storeName ? storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-store",
    category,
    tagline: tagline || `${category} handcrafted with intention.`,
    description: description || "Curated collection of artisanal goods.",
    currency,
    language,
    theme_config: previewThemeConfig,
    is_active: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const previewProducts: Product[] = starterProducts.map((sp, idx) => ({
    id: `prod-${idx}`,
    store_id: previewStore.id,
    product_code: `PROD-${(idx + 1).toString().padStart(3, "0")}`,
    name: sp.name,
    slug: `prod-${idx}`,
    description: sp.description,
    mrp: sp.mrp || Math.round(sp.suggested_price * 1.25),
    price: sp.suggested_price,
    currency,
    inventory: sp.inventory || 10,
    inventory_display_limit: sp.inventory || 10,
    order_limit: 5,
    image_url: sp.image_url,
    images: sp.images || (sp.image_url ? [sp.image_url] : []),
    is_ai_generated: true,
    is_active: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-extrabold tracking-tight text-base">
            SimpleStore <span className="text-primary font-medium text-xs">Setup Wizard</span>
          </span>
        </div>

        {step === 3 && (
          <Button
            size="sm"
            className="gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleProceedToLaunch}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Launching Store...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Save & Launch My Store
              </>
            )}
          </Button>
        )}
      </header>

      {/* STEP 1: Questionnaire */}
      {step === 1 && (
        <div className="container mx-auto max-w-2xl px-4 py-12 space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="gap-1.5 py-1 px-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              5-Minute Setup
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tell us about your store
            </h1>
            <p className="text-sm text-muted-foreground">
              Answer 4 quick questions. We will build your live website preview and starter products instantly.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          <Card className="border-border/80 shadow-md">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Store Name
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Velvet & Flame Candles"
                  className="h-11 text-base font-semibold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Business Category & Niche
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Handmade Scented Candles, Streetwear Apparel, Artisanal Jewelry"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Brand Tone & Aesthetic
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(THEME_ARCHETYPES) as ThemeArchetype[]).map((key) => {
                    const arch = THEME_ARCHETYPES[key];
                    const isSelected = vibe === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setVibe(key)}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border/60 hover:border-foreground/40 bg-card"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs block text-foreground">{arch.name}</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {arch.description}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="mt-2 flex items-center text-[10px] font-bold text-primary gap-1">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productSummary" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  4. What makes your products special?
                </Label>
                <textarea
                  id="productSummary"
                  rows={3}
                  value={productSummary}
                  onChange={(e) => setProductSummary(e.target.value)}
                  placeholder="e.g. 100% natural soy wax, hand-poured in small batches with lavender and amber."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Store Currency</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as StoreCurrency)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Language</Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as StoreLanguage)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                  </select>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-12 font-bold gap-2 text-sm shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/95 mt-4"
                onClick={handleStartGeneration}
              >
                <Sparkles className="h-4 w-4" />
                <span>Build Live Store Preview</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: AI Generating */}
      {step === 2 && (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 animate-ping absolute" />
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl">
              <Sparkles className="h-8 w-8 animate-spin" style={{ animationDuration: "4s" }} />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold tracking-tight">Designing {storeName}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applying design archetypes, drafting brand philosophy copy, and configuring starter catalog...
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: Split-Screen Live Customizer */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-65px)]">
          {/* Left Panel: Live Customizer Controls */}
          <div className="lg:col-span-4 border-r border-border/70 p-6 space-y-6 bg-card/40 overflow-y-auto max-h-[calc(100vh-65px)]">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground mb-3 -ml-2"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Questionnaire</span>
              </Button>
              <h2 className="text-lg font-bold text-foreground">Customize Storefront</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time preview reflects all changes immediately.
              </p>
            </div>

            {/* Archetype Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5 text-primary" />
                Theme Archetype
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEME_ARCHETYPES) as ThemeArchetype[]).map((key) => {
                  const arch = THEME_ARCHETYPES[key];
                  const isSelected = vibe === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setVibe(key)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 hover:bg-muted text-foreground"
                      }`}
                    >
                      {arch.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-primary" />
                Typography
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FONT_PAIRINGS) as FontPairing[]).map((key) => {
                  const font = FONT_PAIRINGS[key];
                  const isSelected = fontPairing === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFontPairing(key)}
                      className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 hover:bg-muted text-foreground"
                      }`}
                    >
                      {font.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(COLOR_PRESETS) as ColorPreset[]).map((key) => {
                  const cp = COLOR_PRESETS[key];
                  const isSelected = colorPreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColorPreset(key)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${
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

            {/* Copy Edits */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Hero Tagline</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Brand Philosophy</Label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-background text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="enableDarkMode"
                checked={enableDarkModeToggle}
                onChange={(e) => setEnableDarkModeToggle(e.target.checked)}
                className="rounded border-border h-4 w-4 text-primary focus:ring-primary"
              />
              <label htmlFor="enableDarkMode" className="text-xs font-medium text-muted-foreground">
                Enable visitor dark mode switch
              </label>
            </div>

            <Button
              size="lg"
              className="w-full h-12 font-bold text-sm gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
              onClick={handleProceedToLaunch}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing Store...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Save & Launch My Store
                </>
              )}
            </Button>
          </div>

          {/* Right Panel: Live Storefront Preview */}
          <div className="lg:col-span-8 overflow-y-auto max-h-[calc(100vh-65px)] bg-muted/20">
            <StorefrontView
              store={previewStore}
              products={previewProducts}
              isPreview={true}
              overrideTheme={previewThemeConfig}
            />
          </div>
        </div>
      )}

      {/* AUTH GATE MODAL */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 mx-auto sm:mx-0">
              <Rocket className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {authMode === "register" ? "Create Account to Launch Store" : "Sign In to Launch Store"}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Your customized store is ready. Register or log in with your email to connect your merchant dashboard and receive orders.
            </DialogDescription>
          </DialogHeader>

          {authError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Merchant Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="merchant@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthMode(authMode === "register" ? "login" : "register");
                  setAuthError(null);
                }}
                className="text-xs font-semibold"
              >
                {authMode === "register"
                  ? "Already have an account? Sign In"
                  : "Need an account? Create one"}
              </Button>

              <Button
                type="submit"
                disabled={isAuthLoading}
                className="gap-2 font-bold text-xs h-10 px-6 bg-primary text-primary-foreground shadow-md"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Rocket className="h-3.5 w-3.5" />
                    {authMode === "register" ? "Create & Launch Store" : "Sign In & Launch Store"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
