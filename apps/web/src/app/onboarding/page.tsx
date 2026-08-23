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

  // Wizard Steps: 1 = Form, 2 = AI Generating, 3 = Split-screen Customizer
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Merchant Inputs
  const [storeName, setStoreName] = useState("Velvet & Flame Candles");
  const [category, setCategory] = useState("Handmade Scented Candles");
  const [vibe, setVibe] = useState<ThemeArchetype>("editorial");
  const [productSummary, setProductSummary] = useState(
    "Organic soy wax candles infused with lavender, amber, and vanilla essential oils."
  );
  const [currency, setCurrency] = useState<StoreCurrency>("USD");
  const [language, setLanguage] = useState<StoreLanguage>("en");

  // Generated Theme State
  const [fontPairing, setFontPairing] = useState<FontPairing>("serif");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("rose");
  const [enableDarkModeToggle, setEnableDarkModeToggle] = useState(true);

  // Generated Content
  const [tagline, setTagline] = useState("Handcrafted soy candles poured with natural botanicals.");
  const [description, setDescription] = useState(
    "Indulge in artisanal aromatherapeutic scents designed to elevate your home sanctuary."
  );
  const [starterProducts, setStarterProducts] = useState<StarterProductDraft[]>([]);
  const [createdStore, setCreatedStore] = useState<Store | null>(null);

  // Auth Gate Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
      // Temporary token or existing token if already logged in
      let authToken: string = token || "";
      if (!authToken) {
        // Create an anonymous temporary merchant session or use demo user
        try {
          const anonRes = await apiClient.post<{ user: any; tokens: any }>("/auth/register", {
            email: `creator-${Date.now()}@simplestore.demo`,
            password: "Password123!",
          });
          authToken = anonRes.tokens.access_token;
          setAuth(anonRes.user, authToken);
        } catch {
          // fallback
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

      if (generated.theme_config) {
        setVibe((generated.theme_config.archetype as ThemeArchetype) || vibe);
        setFontPairing((generated.theme_config.font_pairing as FontPairing) || "serif");
        setColorPreset((generated.theme_config.color_preset as ColorPreset) || "rose");
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
          images: p.images || [],
        }))
      );

      setStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate store. Please try again.");
      setStep(1);
    }
  };

  // Step 3 -> 4: Save Customizations & Open Auth Gate or Publish
  const handleProceedToLaunch = () => {
    // If not authenticated with a real permanent account, show Auth Gate Modal
    if (!isAuthenticated() || user?.email?.endsWith("@simplestore.demo")) {
      setIsAuthModalOpen(true);
    } else {
      finalizeAndLaunch(token!);
    }
  };

  // Handle Auth Gate Submission (Register or Login)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please provide both email and password.");
      return;
    }
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      let authToken = "";
      if (authMode === "register") {
        const res = await apiClient.post<{ user: any; tokens: any }>("/auth/register", {
          email: authEmail,
          password: authPassword,
        });
        authToken = res.tokens.access_token;
        setAuth(res.user, authToken);
      } else {
        const res = await apiClient.post<{ user: any; tokens: any }>("/auth/login", {
          email: authEmail,
          password: authPassword,
        });
        authToken = res.tokens.access_token;
        setAuth(res.user, authToken);
      }

      setIsAuthModalOpen(false);
      await finalizeAndLaunch(authToken);
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Finalize Store and Redirect to Dashboard Hub
  const finalizeAndLaunch = async (authToken: string) => {
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

      const updated = await apiClient.patch<Store>(
        `/stores/${createdStore.id}`,
        {
          name: storeName,
          tagline,
          description,
          currency,
          language,
          theme_config: updatedTheme,
          is_active: true,
          published: true,
        },
        authToken
      );

      setActiveStore(updated);
      // Redirect to Merchant Dashboard Hub
      router.push("/dashboard");
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
    owner_id: user?.id || "preview-owner",
    name: storeName,
    slug: createdStore?.slug || "velvet-flame-candles",
    category,
    tagline: tagline || "Artisanal organic soy candles poured with essential oils.",
    description: description || "Elevate your ambient atmosphere with natural scents.",
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
              5-Minute Zero-Effort Setup
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tell us about your store
            </h1>
            <p className="text-sm text-muted-foreground">
              Answer 4 quick questions. Our AI & design matrix will build your live website preview and starter products instantly.
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
                  placeholder="e.g. Velvet & Flame Candles, Nordic Brew, Luxe Atelier"
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
                  placeholder="e.g. Handmade Scented Candles, Artisan Jewelry, Specialty Coffee"
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
                      { id: "bold", name: "Bold", desc: "Punchy Contrast" },
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
                  placeholder="e.g. Organic soy wax candles infused with lavender, amber, and vanilla essential oils."
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

              <Button
                onClick={handleStartGeneration}
                className="w-full h-12 text-base font-bold gap-2 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Generate Sample Preview & Products
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
              <span>Analyzing category & market tone</span>
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

      {/* AUTH GATE MODAL: Claim & Launch Store */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              {authMode === "register" ? "Create Account to Claim Store" : "Sign In to Your Account"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              {authMode === "register"
                ? `Save "${storeName}" to your merchant dashboard permanently.`
                : "Sign in to connect this store to your existing account."}
            </DialogDescription>
          </DialogHeader>

          {authError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="merchant@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="pl-9 h-10 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="pl-9 h-10 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold gap-2 bg-primary text-primary-foreground shadow-md"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving & Launching...
                </>
              ) : authMode === "register" ? (
                <>
                  <Rocket className="h-4 w-4" />
                  Create Account & Launch Store
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In & Launch Store
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-border/50 text-xs text-muted-foreground">
            {authMode === "register" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Need a new account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError(null);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
