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
  Layout,
  Loader2,
  Moon,
  Palette,
  Rocket,
  ShoppingBag,
  Sparkles,
  Type,
} from "lucide-react";
import {
  ColorPreset,
  FontPairing,
  OnboardingQuestionnaire,
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
  const { setAuth, setActiveStore, user, token } = useAuthStore();

  // Wizard Steps: 1 = Form, 2 = AI Generating, 3 = Split-screen Customizer, 4 = Finalizing
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Merchant Inputs
  const [storeName, setStoreName] = useState("Nordic Brew Roasters");
  const [category, setCategory] = useState("Artisan Specialty Coffee");
  const [vibe, setVibe] = useState<ThemeArchetype>("minimal");
  const [productSummary, setProductSummary] = useState(
    "Single-origin ethically sourced coffee beans roasted in micro-batches."
  );
  const [merchantEmail, setMerchantEmail] = useState(
    user?.email || "owner@nordicbrew.com"
  );
  const [currency, setCurrency] = useState<StoreCurrency>("USD");
  const [language, setLanguage] = useState<StoreLanguage>("en");

  // Generated Theme State
  const [fontPairing, setFontPairing] = useState<FontPairing>("sans");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("slate");
  const [enableDarkModeToggle, setEnableDarkModeToggle] = useState(true);

  // Generated Content
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [starterProducts, setStarterProducts] = useState<StarterProductDraft[]>([]);
  const [createdStore, setCreatedStore] = useState<Store | null>(null);

  // Loading / Error
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 -> 2: Call AI Generator
  const handleStartGeneration = async () => {
    if (!storeName || !category) {
      setErrorMessage("Please fill in your store name and category.");
      return;
    }
    setErrorMessage(null);
    setStep(2);

    try {
      // If not logged in, auto-register / login a merchant account
      let authToken: string = token || "";
      if (!authToken) {
        try {
          const authRes = await apiClient.post<{ user: any; tokens: any }>("/auth/register", {
            email: merchantEmail,
            password: "Password123!",
          });
          authToken = authRes.tokens.access_token;
          setAuth(authRes.user, authToken);
        } catch {
          // If already exists, login
          const loginRes = await apiClient.post<{ user: any; tokens: any }>("/auth/login", {
            email: merchantEmail,
            password: "Password123!",
          });
          authToken = loginRes.tokens.access_token;
          setAuth(loginRes.user, authToken);
        }
      }

      // Call AI Onboarding Endpoint
      const generated = await apiClient.post<Store>(
        "/stores/onboarding-generate",
        {
          store_name: storeName,
          category: category,
          vibe: vibe,
          product_summary: productSummary,
          currency: currency,
          language: language,
        },
        authToken
      );

      setCreatedStore(generated);
      setActiveStore(generated);
      setTagline(generated.tagline || `${category} crafted with care.`);
      setDescription(
        generated.description ||
          "Premium quality selection curated for modern lifestyles."
      );

      // Set recommended theme tokens
      if (generated.theme_config) {
        setVibe((generated.theme_config.archetype as ThemeArchetype) || vibe);
        setFontPairing(
          (generated.theme_config.font_pairing as FontPairing) || "sans"
        );
        setColorPreset(
          (generated.theme_config.color_preset as ColorPreset) || "slate"
        );
      }

      // Fetch the generated products for preview
      const prods = await apiClient.get<Product[]>(
        `/stores/${generated.id}/products`,
        authToken
      );
      setStarterProducts(
        prods.map((p) => ({
          name: p.name,
          description: p.description || "",
          suggested_price: Number(p.price),
          inventory: p.inventory,
          image_url: p.image_url || undefined,
        }))
      );

      setStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate store. Please try again.");
      setStep(1);
    }
  };

  // Step 3 -> 4: Save Customizations & Publish
  const handleLaunchStore = async () => {
    if (!createdStore) return;
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const updatedTheme: ThemeConfig = {
        archetype: vibe,
        font_pairing: fontPairing,
        color_preset: colorPreset,
        enable_dark_mode_toggle: enableDarkModeToggle,
        hero_style: "centered",
      };

      // Update Store with final theme & copy
      const updated = await apiClient.patch<Store>(
        `/stores/${createdStore.id}`,
        {
          name: storeName,
          tagline,
          description,
          currency,
          language,
          theme_config: updatedTheme,
          published: true,
        },
        token || undefined
      );

      setActiveStore(updated);
      // Redirect to public store
      router.push(`/store/${updated.slug}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to publish store.");
      setIsPublishing(false);
    }
  };

  // Preview mock objects
  const previewThemeConfig: ThemeConfig = {
    archetype: vibe,
    font_pairing: fontPairing,
    color_preset: colorPreset,
    enable_dark_mode_toggle: enableDarkModeToggle,
    hero_style: "centered",
  };

  const previewStore: Store = {
    id: createdStore?.id || "preview-id",
    owner_id: "preview-owner",
    name: storeName,
    slug: createdStore?.slug || "nordic-brew",
    category,
    tagline: tagline || "Single-origin specialty coffee roasted for true coffee lovers.",
    description: description || "Freshly roasted specialty coffee delivered straight to your door.",
    currency,
    language,
    theme_config: previewThemeConfig,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const previewProducts: Product[] = starterProducts.map((sp, idx) => ({
    id: `prod-${idx}`,
    store_id: previewStore.id,
    name: sp.name,
    slug: `prod-${idx}`,
    description: sp.description,
    price: sp.suggested_price,
    currency,
    inventory: sp.inventory || 10,
    image_url: sp.image_url,
    is_ai_generated: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
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
            onClick={handleLaunchStore}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Launch & Publish Store
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
              5-Minute Zero-Effort Setup
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tell us about your store
            </h1>
            <p className="text-sm text-muted-foreground">
              Answer 4 quick questions. Our AI & design matrix will build your store and starter inventory in seconds.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {errorMessage}
            </div>
          )}

          <Card className="shadow-lg border-border/80">
            <CardContent className="p-6 space-y-6">
              {/* Question 1: Store Name */}
              <div className="space-y-2">
                <Label htmlFor="sname" className="font-semibold text-sm">
                  1. What is your store name?
                </Label>
                <Input
                  id="sname"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Artisan Candles, Nordic Brew, Velvet Studio"
                  className="h-11 font-medium"
                />
              </div>

              {/* Question 2: Category */}
              <div className="space-y-2">
                <Label htmlFor="scat" className="font-semibold text-sm">
                  2. What category or niche are you selling?
                </Label>
                <Input
                  id="scat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Specialty Coffee, Handmade Jewelry, Leather Bags"
                  className="h-11"
                />
              </div>

              {/* Question 3: Vibe Selection */}
              <div className="space-y-2">
                <Label className="font-semibold text-sm">
                  3. Choose your initial brand aesthetic:
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { id: "minimal", name: "Minimal", desc: "Clean & Modern" },
                      { id: "editorial", name: "Editorial", desc: "Luxury Serif" },
                      { id: "warm", name: "Warm", desc: "Organic & Cozy" },
                      { id: "bold", name: "Bold", desc: "Punchy High-Contrast" },
                    ] as const
                  ).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setVibe(item.id)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                        vibe === item.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                          : "border-border hover:border-foreground/30 bg-card"
                      }`}
                    >
                      <span className="font-bold text-sm">{item.name}</span>
                      <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Product Summary */}
              <div className="space-y-2">
                <Label htmlFor="sprod" className="font-semibold text-sm">
                  4. Describe your products or specialty in 1 sentence:
                </Label>
                <Input
                  id="sprod"
                  value={productSummary}
                  onChange={(e) => setProductSummary(e.target.value)}
                  placeholder="e.g. Single-origin ethically sourced coffee beans roasted in micro-batches."
                  className="h-11"
                />
              </div>

              {/* Currency & Language Settings */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    Store Currency
                  </Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as StoreCurrency)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    {Object.entries(CURRENCY_MAP).map(([curr, def]) => (
                      <option key={curr} value={curr}>
                        {def.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Store Language
                  </Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as StoreLanguage)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                  </select>
                </div>
              </div>

              {/* Merchant Account Email */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label htmlFor="memail" className="text-xs font-semibold">
                  Merchant Account Email
                </Label>
                <Input
                  id="memail"
                  type="email"
                  value={merchantEmail}
                  onChange={(e) => setMerchantEmail(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <Button
                onClick={handleStartGeneration}
                className="w-full h-12 text-base font-bold gap-2 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Generate My Store with AI & Design Matrix
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: AI Loading Screen */}
      {step === 2 && (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="h-8 w-8 text-primary absolute top-6 left-6 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold tracking-tight">
              Generating your store...
            </h2>
            <p className="text-sm text-muted-foreground">
              Writing compelling brand story, drafting starter products, and applying design tokens for {storeName}.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2 text-left text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Analyzing niche & market tone</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Generating marketing copy & tagline</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span>Crafting starter product catalog</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Split-Screen Live Theme Matrix Customizer */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[calc(100vh-65px)] min-h-[calc(100vh-65px)] overflow-y-auto lg:overflow-hidden">
          {/* Left Controls Panel */}
          <div className="lg:col-span-5 border-r border-border p-4 sm:p-6 overflow-y-auto space-y-6 bg-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Theme & Design Matrix</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Customize your store&apos;s look. Changes reflect live on the preview.
              </p>
            </div>

            {/* 1. Style Archetype */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5" />
                1. Style Archetype
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(THEME_ARCHETYPES) as [ThemeArchetype, any][]).map(
                  ([archKey, archDef]) => (
                    <button
                      key={archKey}
                      onClick={() => setVibe(archKey)}
                      className={`p-3 rounded-lg border text-left transition-all text-xs ${
                        vibe === archKey
                          ? "border-primary bg-primary/10 font-bold ring-1 ring-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold text-foreground">{archDef.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {archDef.description}
                      </p>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 2. Font Pairing */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                2. Font Pairing
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FONT_PAIRINGS) as [FontPairing, any][]).map(
                  ([fontKey, fontDef]) => (
                    <button
                      key={fontKey}
                      onClick={() => setFontPairing(fontKey)}
                      className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                        fontPairing === fontKey
                          ? "border-primary bg-primary/10 font-bold ring-1 ring-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold text-foreground">{fontDef.name}</p>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 3. Color Palette */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                3. Color Preset
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(COLOR_PRESETS) as [ColorPreset, any][]).map(
                  ([colKey, colDef]) => (
                    <button
                      key={colKey}
                      onClick={() => setColorPreset(colKey)}
                      className={`p-2 rounded-lg border flex items-center gap-2 transition-all text-xs ${
                        colorPreset === colKey
                          ? "border-primary bg-primary/10 font-bold ring-1 ring-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: colDef.primary }}
                      />
                      <span className="truncate">{colDef.name.split(" ")[1] || colDef.name}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 4. Dark Mode Switch Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Storefront Dark Mode Toggle</p>
                  <p className="text-[10px] text-muted-foreground">
                    Allow visitors to switch between light and dark mode
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableDarkModeToggle}
                onChange={(e) => setEnableDarkModeToggle(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* 5. Brand Slogan & Story */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tagline / Slogan</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Store Story / Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-border">
              <Button
                className="w-full h-11 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                onClick={handleLaunchStore}
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
          </div>

          {/* Right Live Preview Panel */}
          <div className="lg:col-span-7 h-full overflow-y-auto bg-muted/20 border-l border-border">
            <StorefrontView
              store={previewStore}
              products={previewProducts}
              isPreview={true}
              overrideTheme={previewThemeConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}
