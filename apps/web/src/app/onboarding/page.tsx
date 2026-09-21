"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Globe,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Info,
  KeyRound,
  Laptop,
  Layout,
  Loader2,
  Lock,
  Mail,
  Moon,
  Package,
  Palette,
  Phone,
  Plus,
  Rocket,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store as StoreIcon,
  Tablet,
  Trash2,
  Truck,
  Type,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  BrandPillar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { useAuthStore } from "@/features/auth/auth-store";
import { apiClient } from "@/lib/api-client";
import {
  COLOR_PRESETS,
  CURRENCY_MAP,
  FONT_PAIRINGS,
  THEME_ARCHETYPES,
} from "@/lib/theme-utils";

type WizardCategory = "header" | "store" | "about" | "footer" | "appearance";
type ViewportDevice = "desktop" | "tablet" | "mobile";

export default function OnboardingPage() {
  const router = useRouter();
  const { setAuth, setActiveStore, user, token, isAuthenticated } = useAuthStore();

  // Wizard Tab Category Navigation
  const [activeCategory, setActiveCategory] = useState<WizardCategory>("header");
  const [viewportDevice, setViewportDevice] = useState<ViewportDevice>("desktop");

  // 1. Header & Identity
  const [storeName, setStoreName] = useState("Velvet & Flame Candles");
  const [category, setCategory] = useState("Handmade Scented Candles");
  const [logoUrl, setLogoUrl] = useState("");
  const [announcementText, setAnnouncementText] = useState(
    "Handcrafted with 100% Pure Botanical Ingredients • Cash on Delivery Available • Free Express Shipping"
  );
  const [currency, setCurrency] = useState<StoreCurrency>("USD");
  const [language, setLanguage] = useState<StoreLanguage>("en");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // 2. Store & Products (At least 2 Starter Products)
  const [starterProducts, setStarterProducts] = useState<StarterProductDraft[]>([
    {
      name: "Midnight Lavender & Amber Soy Candle",
      description:
        "Hand-poured pure soy candle infused with calming French lavender, golden amber resin, and sweet Madagascar vanilla notes.",
      suggested_price: 35,
      mrp: 45,
      inventory: 20,
      image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800",
      images: [
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800",
        "https://images.unsplash.com/photo-1570823635306-250abb06d4b3?w=800",
      ],
    },
    {
      name: "Smoked Vanilla & Cedarwood Vessel",
      description:
        "Rich smoked cedarwood blended with bourbon vanilla and spiced cardamom in a matte handcrafted ceramic jar.",
      suggested_price: 42,
      mrp: 55,
      inventory: 15,
      image_url: "https://images.unsplash.com/photo-1596433809252-260c2745dfdd?w=800",
      images: [
        "https://images.unsplash.com/photo-1596433809252-260c2745dfdd?w=800",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
      ],
    },
  ]);
  const [expandedProductIndex, setExpandedProductIndex] = useState<number>(0);
  const [isGeneratingAiDescIndex, setIsGeneratingAiDescIndex] = useState<number | null>(null);
  const [isUploadingProductPhotoIndex, setIsUploadingProductPhotoIndex] = useState<number | null>(null);

  // 3. About & Story
  const [tagline, setTagline] = useState("Handcrafted pure soy candles poured with natural botanical oils.");
  const [aboutStory, setAboutStory] = useState(
    "Every product is individually hand-crafted in small batches, using pure soy wax harvested sustainably and blended with bespoke artisan notes. Designed to transform ordinary routines into extraordinary daily rituals."
  );
  const [brandPillars, setBrandPillars] = useState<BrandPillar[]>([
    { title: "Pure Soy Wax", desc: "100% soot-free, sustainable natural burn." },
    { title: "Small Batch", desc: "Handcrafted with intention by dedicated artisans." },
    { title: "Toxin-Free", desc: "Zero phthalates, parabens, or synthetic dyes." },
  ]);

  // 4. Footer & Policies
  const [contactEmail, setContactEmail] = useState("hello@velvetflame.com");
  const [contactPhone, setContactPhone] = useState("+1 (555) 234-5678");
  const [shippingNote, setShippingNote] = useState("Tracked Pan-India & Global Express Delivery in 2-4 Days");

  // 5. Appearance & Theme
  const [vibe, setVibe] = useState<ThemeArchetype>("editorial");
  const [fontPairing, setFontPairing] = useState<FontPairing>("serif");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("rose");
  const [enableDarkModeToggle, setEnableDarkModeToggle] = useState(true);

  // AI & Auth Gate Modal States
  const [isAiAutofilling, setIsAiAutofilling] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Logo file uploader
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const res = await apiClient.uploadBlob(file, token || undefined);
      if (res?.url) setLogoUrl(res.url);
    } catch (err: any) {
      console.warn("Direct blob upload fallback, using object URL:", err);
      setLogoUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Product photo uploader
  const handleProductPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProductPhotoIndex(index);
    try {
      const res = await apiClient.uploadBlob(file, token || undefined);
      const url = res?.url || URL.createObjectURL(file);
      updateProductField(index, "image_url", url);
      const currentImages = starterProducts[index].images || [];
      if (!currentImages.includes(url)) {
        updateProductField(index, "images", [...currentImages, url]);
      }
    } catch (err: any) {
      const fallbackUrl = URL.createObjectURL(file);
      updateProductField(index, "image_url", fallbackUrl);
    } finally {
      setIsUploadingProductPhotoIndex(null);
    }
  };

  // Product updates
  const updateProductField = (index: number, field: keyof StarterProductDraft, value: any) => {
    setStarterProducts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddProductPhotoUrl = (index: number, url: string) => {
    if (!url.trim()) return;
    const prod = starterProducts[index];
    const currentImages = prod.images || [];
    if (currentImages.length >= 5) return;
    const newImages = [...currentImages, url.trim()];
    updateProductField(index, "images", newImages);
    if (!prod.image_url) {
      updateProductField(index, "image_url", url.trim());
    }
  };

  const handleRemoveProductPhoto = (prodIndex: number, photoIndex: number) => {
    const prod = starterProducts[prodIndex];
    const currentImages = [...(prod.images || [])];
    currentImages.splice(photoIndex, 1);
    updateProductField(prodIndex, "images", currentImages);
    updateProductField(prodIndex, "image_url", currentImages[0] || "");
  };

  const handleAddStarterProduct = () => {
    const nextNum = starterProducts.length + 1;
    setStarterProducts((prev) => [
      ...prev,
      {
        name: `${storeName} Product ${nextNum}`,
        description: `Handcrafted ${category.toLowerCase()} crafted with attention to fine detail.`,
        suggested_price: 35,
        mrp: 45,
        inventory: 10,
        image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800",
        images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"],
      },
    ]);
    setExpandedProductIndex(starterProducts.length);
  };

  const handleRemoveProduct = (index: number) => {
    if (starterProducts.length <= 2) {
      setErrorMessage("Please maintain at least 2 starter products for your store catalog.");
      return;
    }
    setStarterProducts((prev) => prev.filter((_, i) => i !== index));
    if (expandedProductIndex === index) {
      setExpandedProductIndex(0);
    }
  };

  const handleAiWriteProductDescription = async (index: number) => {
    const prod = starterProducts[index];
    if (!prod.name) return;
    setIsGeneratingAiDescIndex(index);
    try {
      const res = await apiClient.post<{ description: string }>("/ai/product-description", {
        product_name: prod.name,
        category: category,
        store_name: storeName,
        target_audience: "Discerning lifestyle buyers seeking artisan luxury",
      });
      if (res?.description) {
        updateProductField(index, "description", res.description);
      }
    } catch (err) {
      console.warn("AI generation fallback:", err);
      updateProductField(
        index,
        "description",
        `Artisan-grade ${prod.name} created exclusively for ${storeName}. Handcrafted in limited batches with premium sustainable materials for an exquisite experience.`
      );
    } finally {
      setIsGeneratingAiDescIndex(null);
    }
  };

  // AI Autofill Assistant
  const handleAiAutofillWizard = async () => {
    if (!storeName.trim()) {
      setErrorMessage("Please enter a Store Name first so AI can tailor your storefront.");
      return;
    }
    setIsAiAutofilling(true);
    setErrorMessage(null);
    try {
      const generated = await apiClient.post<OnboardingGenerationResult>("/ai/onboarding-generate", {
        store_name: storeName,
        category: category,
        vibe: vibe,
        product_summary: `${category} and bespoke lifestyle items`,
        currency: currency,
        language: language,
      });

      if (generated.tagline) setTagline(generated.tagline);
      if (generated.description) setAboutStory(generated.description);

      if (generated.theme_recommendation) {
        setVibe(generated.theme_recommendation.archetype || vibe);
        setFontPairing(generated.theme_recommendation.font_pairing || fontPairing);
        setColorPreset(generated.theme_recommendation.color_preset || colorPreset);
      }

      if (Array.isArray(generated.starter_products) && generated.starter_products.length >= 2) {
        setStarterProducts(generated.starter_products);
      }
    } catch (err: any) {
      console.warn("AI autofill fallback:", err);
      setTagline(`Premium ${category.toLowerCase()} handcrafted for everyday luxury.`);
      setAboutStory(
        `Welcome to ${storeName}. We create exceptional handcrafted ${category.toLowerCase()} designed to bring warmth, beauty, and timeless serenity into every space.`
      );
    } finally {
      setIsAiAutofilling(false);
    }
  };

  // Proceed to Launch
  const handleProceedToLaunch = () => {
    if (isAuthenticated() && token) {
      createAndLaunchStore(token);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);

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
        announcement_text: announcementText.trim(),
        about_story: aboutStory.trim(),
        brand_pillars: brandPillars,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        shipping_note: shippingNote.trim(),
      };

      const newStore = await apiClient.post<Store>(
        "/stores",
        {
          name: storeName.trim(),
          slug: storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: category.trim(),
          tagline: tagline.trim(),
          description: aboutStory.trim(),
          logo_url: logoUrl.trim() || undefined,
          currency,
          language,
          theme_config: themePayload,
          is_active: true,
          published: true,
        },
        authToken
      );

      // Create starter products
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
              inventory: p.inventory || 15,
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

  // Preview Store & Products object
  const previewThemeConfig: ThemeConfig = {
    archetype: vibe,
    font_pairing: fontPairing,
    color_preset: colorPreset,
    enable_dark_mode_toggle: enableDarkModeToggle,
    hero_style: "centered",
    announcement_text: announcementText,
    about_story: aboutStory,
    brand_pillars: brandPillars,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    shipping_note: shippingNote,
  };

  const previewStore: Store = {
    id: "preview-store-id",
    owner_id: user?.id || "draft-owner",
    name: storeName || "My Luxury Store",
    slug: (storeName || "my-store").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: category || "Handmade Goods",
    tagline: tagline || "Crafted for pure aesthetic luxury.",
    description: aboutStory || "Discover artisanal products designed to elevate your everyday routines.",
    logo_url: logoUrl || null,
    banner_url: null,
    currency,
    language,
    theme_config: previewThemeConfig,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const previewProducts: Product[] = starterProducts.map((p, idx) => ({
    id: `prev-prod-${idx + 1}`,
    store_id: "preview-store-id",
    product_code: `PROD-00${idx + 1}`,
    name: p.name || `Product ${idx + 1}`,
    slug: (p.name || `prod-${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: p.description || "Handmade item with exquisite detail.",
    price: Number(p.suggested_price) || 30,
    mrp: Number(p.mrp) || Math.round((Number(p.suggested_price) || 30) * 1.25),
    currency,
    inventory: Number(p.inventory) || 15,
    inventory_display_limit: null,
    order_limit: null,
    image_url: p.image_url || p.images?.[0] || "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800",
    images: p.images && p.images.length > 0 ? p.images : [p.image_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"],
    is_ai_generated: true,
    is_active: true,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Wizard Navigation Bar */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-extrabold text-base tracking-tight hidden sm:inline">SimpleStore</span>
          </Link>
          <Badge variant="outline" className="text-[11px] font-medium border-primary/30 text-primary">
            Store Builder
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiAutofillWizard}
            disabled={isAiAutofilling}
            className="gap-1.5 text-xs font-semibold h-9"
          >
            {isAiAutofilling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
            <span>AI Polish All</span>
          </Button>

          <Button
            size="sm"
            onClick={handleProceedToLaunch}
            disabled={isPublishing}
            className="gap-2 text-xs font-bold h-9 px-4 bg-primary text-primary-foreground shadow-md"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Launching...</span>
              </>
            ) : (
              <>
                <Rocket className="h-3.5 w-3.5" />
                <span>Save & Launch My Store</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Split Screen Work Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: 5-Category Store Builder */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-y-auto">
          {/* Category Tabs Header */}
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold tracking-tight text-foreground">Customize Storefront</h2>
                <p className="text-xs text-muted-foreground">Live preview reflects your edits instantly.</p>
              </div>
            </div>

            {/* 5 Core Categories Navigation */}
            <div className="grid grid-cols-5 gap-1 bg-muted p-1 rounded-xl">
              {[
                { id: "header", label: "Header", icon: Layout },
                { id: "store", label: "Store", icon: StoreIcon },
                { id: "about", label: "About", icon: Info },
                { id: "footer", label: "Footer", icon: ShieldCheck },
                { id: "appearance", label: "Style", icon: Palette },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id as WizardCategory)}
                    className={`py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      isActive
                        ? "bg-card text-primary shadow-xs border border-border/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div className="m-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center justify-between">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Tab 1: Header & Brand Identity */}
          {activeCategory === "header" && (
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Store Name *
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Velvet & Flame Candles"
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Niche / Category *
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Handmade Scented Candles"
                  className="h-10 text-sm font-medium"
                />
              </div>

              {/* Logo Upload / URL */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Store Logo (Optional)</span>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </Label>

                <div className="flex gap-2 items-center">
                  {logoUrl ? (
                    <div className="h-12 w-12 rounded-lg border border-border bg-muted p-1 flex-shrink-0 relative">
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                  ) : null}

                  <div className="flex-1 space-y-2">
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Paste logo image URL..."
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploadingLogo ? "Uploading..." : "Upload from Computer"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                  </label>
                </div>
              </div>

              {/* Top Announcement Bar Marquee */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <Label htmlFor="announcement" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Top Announcement Ticker
                </Label>
                <Input
                  id="announcement"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Handcrafted 100% Pure Soy • Cash on Delivery Available"
                  className="h-10 text-xs"
                />
              </div>

              {/* Currency & Language */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Currency
                  </Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as StoreCurrency)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                  >
                    {(Object.keys(CURRENCY_MAP) as StoreCurrency[]).map((c) => (
                      <option key={c} value={c}>
                        {c} ({CURRENCY_MAP[c].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Language
                  </Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as StoreLanguage)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs font-medium"
                  >
                    <option value="en">English (US)</option>
                    <option value="hi">Hindi (India)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Store & Products (At least 2 Starter Products) */}
          {activeCategory === "store" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Catalog Products ({starterProducts.length})
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Add photos, pricing, and details for your launch products.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStarterProduct}
                  className="gap-1 text-xs font-bold h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Product</span>
                </Button>
              </div>

              {/* Product Accordion Cards */}
              <div className="space-y-3">
                {starterProducts.map((prod, pIdx) => {
                  const isExpanded = expandedProductIndex === pIdx;
                  return (
                    <div
                      key={pIdx}
                      className={`border rounded-xl transition-all overflow-hidden ${
                        isExpanded ? "border-primary bg-card shadow-xs" : "border-border bg-background"
                      }`}
                    >
                      {/* Product Header Row */}
                      <button
                        type="button"
                        onClick={() => setExpandedProductIndex(isExpanded ? -1 : pIdx)}
                        className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0">
                            {prod.images?.[0] || prod.image_url ? (
                              <img
                                src={prod.images?.[0] || prod.image_url}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {prod.name || `Product ${pIdx + 1}`}
                            </h4>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {CURRENCY_MAP[currency]?.symbol}
                              {prod.suggested_price} • {prod.inventory} in stock • {prod.images?.length || 0} photos
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {starterProducts.length > 2 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(pIdx);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Product Expanded Editor */}
                      {isExpanded && (
                        <div className="p-4 border-t border-border/60 bg-muted/10 space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Product Name
                            </Label>
                            <Input
                              value={prod.name}
                              onChange={(e) => updateProductField(pIdx, "name", e.target.value)}
                              placeholder="e.g. Velvet Rose Candle"
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Price ({CURRENCY_MAP[currency]?.symbol})
                              </Label>
                              <Input
                                type="number"
                                value={prod.suggested_price}
                                onChange={(e) => updateProductField(pIdx, "suggested_price", Number(e.target.value))}
                                className="h-9 text-xs font-mono font-bold"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                MRP ({CURRENCY_MAP[currency]?.symbol})
                              </Label>
                              <Input
                                type="number"
                                value={prod.mrp || Math.round(prod.suggested_price * 1.25)}
                                onChange={(e) => updateProductField(pIdx, "mrp", Number(e.target.value))}
                                className="h-9 text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Stock Count
                              </Label>
                              <Input
                                type="number"
                                value={prod.inventory}
                                onChange={(e) => updateProductField(pIdx, "inventory", Number(e.target.value))}
                                className="h-9 text-xs font-mono"
                              />
                            </div>
                          </div>

                          {/* Product Multi-Photo Gallery */}
                          <div className="space-y-2 pt-2 border-t border-border/60">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                              <span>Product Photos (Up to 5 images)</span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {prod.images?.length || 0}/5
                              </span>
                            </Label>

                            {/* Photo thumbnails strip */}
                            <div className="flex flex-wrap gap-2">
                              {(prod.images || []).map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="h-14 w-14 rounded-lg border border-border overflow-hidden relative group bg-muted flex-shrink-0"
                                >
                                  <img src={imgUrl} alt="Product" className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductPhoto(pIdx, imgIdx)}
                                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Photo Input */}
                            {(prod.images?.length || 0) < 5 && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Paste photo image URL..."
                                    className="h-8 text-xs"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddProductPhotoUrl(pIdx, (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = "";
                                      }
                                    }}
                                  />
                                </div>

                                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>
                                    {isUploadingProductPhotoIndex === pIdx ? "Uploading..." : "Upload Photo File"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleProductPhotoUpload(pIdx, e)}
                                    className="hidden"
                                    disabled={isUploadingProductPhotoIndex === pIdx}
                                  />
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Description with AI Assist */}
                          <div className="space-y-1.5 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Description
                              </Label>
                              <button
                                type="button"
                                onClick={() => handleAiWriteProductDescription(pIdx)}
                                disabled={isGeneratingAiDescIndex === pIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                              >
                                {isGeneratingAiDescIndex === pIdx ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                                <span>AI Write</span>
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={prod.description}
                              onChange={(e) => updateProductField(pIdx, "description", e.target.value)}
                              placeholder="Describe your artisan product..."
                              className="w-full p-2.5 rounded-lg border border-input bg-background text-xs leading-relaxed resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: About & Story */}
          {activeCategory === "about" && (
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="tagline" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hero Tagline / Headline
                </Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Handcrafted pure soy candles poured with natural botanicals."
                  className="h-10 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aboutStory" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Our Story & Brand Philosophy
                </Label>
                <textarea
                  id="aboutStory"
                  rows={4}
                  value={aboutStory}
                  onChange={(e) => setAboutStory(e.target.value)}
                  placeholder="Tell your brand's authentic origin story..."
                  className="w-full p-3 rounded-lg border border-input bg-background text-xs leading-relaxed resize-none"
                />
              </div>

              {/* 3 Brand Pillars */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3 Core Value Propositions
                </Label>

                {brandPillars.map((pillar, pilIdx) => (
                  <div key={pilIdx} className="p-3 rounded-lg border border-border bg-background space-y-2">
                    <Input
                      value={pillar.title}
                      onChange={(e) => {
                        const copy = [...brandPillars];
                        copy[pilIdx].title = e.target.value;
                        setBrandPillars(copy);
                      }}
                      placeholder={`Pillar ${pilIdx + 1} Title (e.g. Pure Ingredients)`}
                      className="h-8 text-xs font-bold"
                    />
                    <Input
                      value={pillar.desc}
                      onChange={(e) => {
                        const copy = [...brandPillars];
                        copy[pilIdx].desc = e.target.value;
                        setBrandPillars(copy);
                      }}
                      placeholder={`Pillar ${pilIdx + 1} Description`}
                      className="h-8 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Footer & Policies */}
          {activeCategory === "footer" && (
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Customer Care Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="support@yourbrand.com"
                    className="pl-9 h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Helpline / Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="pl-9 h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <Label htmlFor="shippingNote" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Delivery & Shipping Guarantee
                </Label>
                <div className="relative">
                  <Truck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shippingNote"
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    placeholder="Tracked Express Shipping in 2-4 Days"
                    className="pl-9 h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Built-in Trust Guarantees
                </span>
                <p className="text-[11px] leading-relaxed">
                  Cash on Delivery (COD) and 7-day customer replacements are automatically enabled on your store checkout.
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: Appearance & Theme */}
          {activeCategory === "appearance" && (
            <div className="p-6 space-y-6">
              {/* Theme Archetype */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layout className="h-3.5 w-3.5 text-primary" />
                  Brand Archetype
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEME_ARCHETYPES) as ThemeArchetype[]).map((key) => {
                    const arch = THEME_ARCHETYPES[key];
                    const isSelected = vibe === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setVibe(key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="font-bold text-xs block">{arch.name}</span>
                        <span className="text-[10px] opacity-80 line-clamp-2 mt-0.5">{arch.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-primary" />
                  Typography Pairing
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FONT_PAIRINGS) as FontPairing[]).map((key) => {
                    const font = FONT_PAIRINGS[key];
                    const isSelected = fontPairing === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFontPairing(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="font-bold text-xs block">{font.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  Accent Color
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(COLOR_PRESETS) as ColorPreset[]).map((key) => {
                    const cp = COLOR_PRESETS[key];
                    const isSelected = colorPreset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setColorPreset(key)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cp.primary }} />
                        <span>{cp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visitor Dark Mode Toggle */}
              <div className="pt-2 border-t border-border/60">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={enableDarkModeToggle}
                    onChange={(e) => setEnableDarkModeToggle(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Enable visitor dark mode toggle</span>
                </label>
              </div>
            </div>
          )}

          {/* Bottom Action in Wizard Pane */}
          <div className="p-4 border-t border-border mt-auto bg-card">
            <Button
              onClick={handleProceedToLaunch}
              disabled={isPublishing}
              className="w-full h-11 font-bold text-xs uppercase tracking-wider shadow-md bg-primary text-primary-foreground"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Launching Storefront...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Save & Launch My Store
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Live Responsive Storefront Preview Pane */}
        <div className="flex-1 bg-muted/40 flex flex-col h-full overflow-hidden">
          {/* Viewport & Device Controls Top Bar */}
          <div className="h-12 border-b border-border bg-card/90 px-4 flex items-center justify-between text-xs font-semibold text-muted-foreground flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-foreground">Live Interactive Storefront</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewportDevice("desktop")}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                  viewportDevice === "desktop"
                    ? "bg-card text-primary font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Desktop View"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[10px]">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setViewportDevice("tablet")}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                  viewportDevice === "tablet"
                    ? "bg-card text-primary font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[10px]">Tablet</span>
              </button>

              <button
                type="button"
                onClick={() => setViewportDevice("mobile")}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                  viewportDevice === "mobile"
                    ? "bg-card text-primary font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mobile View (390px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[10px]">Mobile</span>
              </button>
            </div>
          </div>

          {/* Render Preview Frame */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex justify-center items-start">
            <div
              className={`transition-all duration-300 shadow-2xl bg-card overflow-hidden ${
                viewportDevice === "desktop"
                  ? "w-full rounded-none lg:rounded-xl border border-border"
                  : viewportDevice === "tablet"
                  ? "w-[768px] max-w-full rounded-2xl border-4 border-slate-800 my-4"
                  : "w-[390px] max-w-full rounded-3xl border-8 border-slate-900 my-4"
              }`}
            >
              <StorefrontView store={previewStore} products={previewProducts} isPreview={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Auth Gate Modal (Clean Merchant Registration/Login) */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>{authMode === "register" ? "Create Account to Launch Store" : "Sign In to Launch Store"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {authMode === "register"
                ? `Enter your merchant credentials to claim "${storeName}" and launch your website.`
                : "Enter your account details to publish your new store."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
            {authError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="authEmail">Merchant Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="authEmail"
                  type="email"
                  placeholder="merchant@example.com"
                  required
                  className="pl-9"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="authPassword">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="authPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-9"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <div className="text-xs text-muted-foreground flex items-center justify-between w-full sm:w-auto flex-1">
                {authMode === "register" ? (
                  <span>
                    Have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="font-bold text-primary hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    New merchant?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="font-bold text-primary hover:underline"
                    >
                      Create Account
                    </button>
                  </span>
                )}
              </div>

              <Button type="submit" disabled={isAuthLoading} className="font-bold gap-2">
                {isAuthLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    <span>{authMode === "register" ? "Create & Launch Store" : "Sign In & Launch"}</span>
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
