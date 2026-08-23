"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  Flame,
  Globe,
  Heart,
  Moon,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Truck,
  X,
} from "lucide-react";
import { Order, Product, Store, StoreCurrency, StoreLanguage, ThemeConfig } from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CheckoutModal } from "@/components/storefront/checkout-modal";
import { OrderConfirmationModal } from "@/components/storefront/order-confirmation-modal";
import { ProductQuickView } from "@/components/storefront/product-quick-view";
import { useCartStore } from "@/features/cart/cart-store";
import { useWishlistStore } from "@/features/wishlist/wishlist-store";
import {
  COLOR_PRESETS,
  CURRENCY_MAP,
  FONT_PAIRINGS,
  formatPrice,
  THEME_ARCHETYPES,
  TRANSLATIONS,
} from "@/lib/theme-utils";

interface StorefrontViewProps {
  store: Store;
  products: Product[];
  isPreview?: boolean;
  overrideTheme?: ThemeConfig;
}

export function StorefrontView({
  store,
  products,
  isPreview = false,
  overrideTheme,
}: StorefrontViewProps) {
  const theme = overrideTheme || store.theme_config;
  const archetype = THEME_ARCHETYPES[theme?.archetype || "minimal"];
  const font = FONT_PAIRINGS[theme?.font_pairing || "sans"];
  const colorPreset = COLOR_PRESETS[theme?.color_preset || "slate"];

  const [currentLang, setCurrentLang] = useState<StoreLanguage>(store.language || "en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const { getItemCount, setIsOpen: setCartOpen, addItem } = useCartStore();
  const { toggleWishlist, isInWishlist, getWishlistCount } = useWishlistStore();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currency = (store.currency || "USD") as StoreCurrency;

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === "all") return true;
    if (activeCategory === "signature") return p.name.toLowerCase().includes("signature") || p.is_ai_generated;
    if (activeCategory === "bestseller") return p.inventory > 10;
    if (activeCategory === "gifts") return p.name.toLowerCase().includes("set") || p.name.toLowerCase().includes("gift");
    return true;
  });

  const featuredProduct = products[0] || null;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#FAF8F5] text-[#1C1917]"
      } ${font.bodyClass}`}
    >
      {/* 1. Preview Mode Alert */}
      {isPreview && (
        <div className="bg-primary/95 text-primary-foreground text-center text-xs py-2 px-4 font-semibold flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Live Storefront Preview — Changes reflect immediately</span>
        </div>
      )}

      {/* 2. Top Promotional / Trust Announcement Ticker */}
      <div className="bg-[#1C1917] text-[#FAF8F5] py-2 px-4 text-center text-xs tracking-wider uppercase font-sans border-b border-[#292524] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-[11px] font-medium text-[#EADDC9]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Handcrafted with 100% Pure Botanical Ingredients
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Cash on Delivery (COD) Available</span>
          <span className="hidden lg:inline">•</span>
          <span className="hidden lg:inline">Free Express Shipping Over {formatPrice(50, currency)}</span>
        </div>
      </div>

      {/* 3. Luxury Brand Header */}
      <header className="sticky top-0 z-40 w-full transition-all duration-300 bg-[#FAF8F5]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Navigation Anchor Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs uppercase tracking-widest font-semibold">
              <a href="#shop-all" className="hover:text-primary transition-colors">
                Shop All
              </a>
              <a href="#collections" className="hover:text-primary transition-colors">
                Collections
              </a>
              <a href="#our-story" className="hover:text-primary transition-colors">
                Our Story
              </a>
              <a href="#reviews" className="hover:text-primary transition-colors">
                Reviews
              </a>
            </nav>

            {/* Brand Logo / Monogram & Name */}
            <div className="flex-1 lg:flex-initial text-center lg:px-4">
              <Link href={`/store/${store.slug}`} className="group inline-flex flex-col items-center">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="h-10 w-auto object-contain rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${font.headingClass} text-foreground group-hover:scale-102 transition-transform`}>
                      {store.name}
                    </h1>
                    <span className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-semibold mt-0.5">
                      {store.category || "Handcrafted Luxury"}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="h-9 w-9 rounded-full text-foreground hover:text-primary"
                aria-label="Open search"
              >
                <Search className="h-4.5 w-4.5" />
              </Button>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs px-2 font-semibold">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="uppercase">{currentLang}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <DropdownMenuItem onClick={() => setCurrentLang("en")}>🇺🇸 English (EN)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentLang("hi")}>🇮🇳 Hindi (HI)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentLang("es")}>🇪🇸 Spanish (ES)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentLang("fr")}>🇫🇷 French (FR)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle (if enabled) */}
              {theme?.enable_dark_mode_toggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label="Toggle storefront theme"
                >
                  {isDarkMode ? (
                    <Sun className="h-4.5 w-4.5 text-amber-400" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-slate-700" />
                  )}
                </Button>
              )}

              {/* Wishlist Indicator */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full relative text-foreground hover:text-rose-500"
                aria-label="View wishlist"
                onClick={() => setActiveCategory("signature")}
              >
                <Heart className="h-4.5 w-4.5" />
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold">
                    {getWishlistCount()}
                  </span>
                )}
              </Button>

              {/* Shopping Bag / Cart Drawer Button */}
              <Button
                size="sm"
                className="h-10 px-4 gap-2 font-bold shadow-md shadow-primary/15 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">{t.cart}</span>
                {getItemCount() > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground text-xs font-black shadow-xs">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Collapsible Search Input */}
          {isSearchOpen && (
            <div className="py-3 border-t border-border/60 animate-in slide-in-from-top-2 duration-200">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by fragrance, notes, or collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-10 bg-background/90 rounded-full"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 4. Luxury Dynamic Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 pt-10 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-[#F4EFEA]/60 dark:from-slate-900/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Brand Headline & Story Copy */}
            <div className="lg:col-span-7 space-y-6 lg:pr-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-background/80 border border-border/60 rounded-full shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-sans uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                  {store.category || "Handcrafted Artisanal Collection"}
                </span>
              </div>

              <h2 className={`text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-[1.1] tracking-tight ${font.headingClass}`}>
                {store.tagline ? (
                  store.tagline
                ) : (
                  <>
                    An Olfactory <br />
                    <span className="italic font-normal text-primary">Sanctuary</span> for <br />
                    Every Space.
                  </>
                )}
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                {store.description ||
                  "Pouring tranquility into sculpted vessels. Handcrafted with 100% natural botanical soy wax, unbleached wicks, and bespoke perfumery notes."}
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Button
                  size="lg"
                  className="px-8 h-12 font-bold text-xs uppercase tracking-[0.2em] rounded-lg shadow-md gap-3 group bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <a href="#shop-all">
                    <span>Shop Signature Line</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 h-12 font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-muted/60 border-border/80"
                  asChild
                >
                  <a href="#collections">Discover Collections</a>
                </Button>
              </div>

              {/* Value Stats Row */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-border/60 max-w-lg">
                <div>
                  <span className={`text-2xl md:text-3xl text-foreground font-light block ${font.headingClass}`}>
                    100%
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-0.5">
                    Natural Soy Wax
                  </span>
                </div>
                <div>
                  <span className={`text-2xl md:text-3xl text-foreground font-light block ${font.headingClass}`}>
                    60+ Hrs
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-0.5">
                    Clean Burn Time
                  </span>
                </div>
                <div>
                  <span className={`text-2xl md:text-3xl text-foreground font-light block ${font.headingClass}`}>
                    Toxin-Free
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-0.5">
                    Fine Fragrance
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Spotlight Featured Product Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-background bg-card group">
                  <img
                    src={
                      featuredProduct?.image_url ||
                      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"
                    }
                    alt={featuredProduct?.name || "Flagship Signature Candle"}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Floating Spotlight Info Panel */}
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border border-border/60 shadow-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                        Flagship Signature Line
                      </span>
                      <h4 className={`text-base sm:text-lg font-bold text-foreground truncate ${font.headingClass}`}>
                        {featuredProduct?.name || "Sakura Bloom & Midnight Amber"}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {featuredProduct ? formatPrice(Number(featuredProduct.price), currency) : "$35.00"} • In Stock
                      </p>
                    </div>
                    {featuredProduct && (
                      <Button
                        size="icon"
                        className="h-10 w-10 rounded-lg flex-shrink-0 shadow-md bg-primary text-primary-foreground"
                        onClick={() => setSelectedProduct(featuredProduct)}
                        aria-label="Quick view featured product"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brand Story & 3 Value Pillars */}
      <section id="our-story" className="py-16 md:py-24 bg-[#F4EFEA]/80 dark:bg-slate-900/40 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-border/60 bg-card">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800"
                  alt="Artisanal Candle Making"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden sm:block p-5 bg-[#1C1917] text-[#FAF8F5] max-w-xs rounded-xl shadow-2xl border border-border/40">
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
                  Our Philosophy
                </span>
                <p className={`italic text-sm text-[#EADDC9] leading-relaxed ${font.headingClass}`}>
                  “A handcrafted piece should never overpower; it should harmonize with the soul of your space.”
                </p>
              </div>
            </div>

            {/* Story Narrative & 3 Pillars */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold block">
                The Story of {store.name}
              </span>
              <h3 className={`text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight ${font.headingClass}`}>
                Crafted by hand with intention, warmth, and enduring beauty.
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Every product is individually hand-poured in small batches, using pure soy wax harvested sustainably and blended with bespoke perfumery notes. Designed to transform ordinary routines into extraordinary daily rituals.
              </p>

              {/* 3 Core Value Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border/60">
                <div className="space-y-1.5 p-3 rounded-xl bg-background/50 border border-border/40">
                  <div className="flex items-center space-x-2 text-foreground font-semibold">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Pure Soy</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sustainably sourced, soot-free clean burn.</p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-background/50 border border-border/40">
                  <div className="flex items-center space-x-2 text-foreground font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm">Small Batch</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Hand-poured by dedicated artisans.</p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-background/50 border border-border/40">
                  <div className="flex items-center space-x-2 text-foreground font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Toxin-Free</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Non-toxic, phthalate-free oils.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Curated Collections Showcase */}
      <section id="collections" className="py-16 md:py-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-border/50 pb-5">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold block mb-1">
                Curated Essence
              </span>
              <h3 className={`text-3xl sm:text-4xl text-foreground font-light ${font.headingClass}`}>
                Shop by Collection
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-2 md:mt-0">
              From sculptural ribbed vessels to coastal minerals and gift hampers, discover your match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tile 1: Signature (8 cols) */}
            <div
              className="md:col-span-8 group relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm cursor-pointer min-h-[340px]"
              onClick={() => setActiveCategory("signature")}
            >
              <img
                src="https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"
                alt="Signature Collection"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white z-10 space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold">
                  Flagship Fragrance Line
                </span>
                <h4 className={`text-2xl md:text-3xl font-medium ${font.headingClass}`}>
                  Signature Collection
                </h4>
                <p className="text-xs text-slate-200 line-clamp-2 max-w-lg opacity-90">
                  Hand-poured in timeless matte jars, encapsulating delicate florals and rich amber woods.
                </p>
              </div>
            </div>

            {/* Tile 2: Gift Sets (4 cols) */}
            <div
              className="md:col-span-4 group relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm cursor-pointer min-h-[340px]"
              onClick={() => setActiveCategory("gifts")}
            >
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800"
                alt="Festive Gift Sets"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white z-10 space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold">
                  Curated Combos
                </span>
                <h4 className={`text-2xl font-medium ${font.headingClass}`}>
                  Gift Sets & Hampers
                </h4>
                <p className="text-xs text-slate-200 line-clamp-2 opacity-90">
                  Thoughtfully packaged sets designed to make an indelible impression.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Flagship Product Catalog Section */}
      <section id="shop-all" className="py-16 md:py-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold block mb-1">
                The Catalog
              </span>
              <h3 className={`text-3xl sm:text-4xl text-foreground font-light ${font.headingClass}`}>
                All Products ({filteredProducts.length})
              </h3>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Products" },
                { id: "signature", label: "Signature Line" },
                { id: "bestseller", label: "Best Sellers" },
                { id: "gifts", label: "Gift Sets" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    activeCategory === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-card">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-foreground">No products found in this selection</p>
              <p className="text-xs text-muted-foreground mt-1">Try switching categories or clearing search.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs font-semibold"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
              >
                View All Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isOut = product.inventory <= 0;
                const price = Number(product.price);
                const mrp = Number(product.mrp || (price * 1.25).toFixed(2));
                const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                const inWishlist = isInWishlist(product.id);

                return (
                  <div
                    key={product.id}
                    className={`group relative flex flex-col bg-card border border-border/60 hover:border-primary/50 transition-all duration-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl ${archetype.cardClass}`}
                  >
                    {/* Top Badges & Wishlist Action */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                      {discount > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 shadow-sm">
                          {discount}% OFF
                        </Badge>
                      )}
                      {product.is_ai_generated && (
                        <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-[9px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400">
                          AI
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={() => toggleWishlist(product)}
                      aria-label="Add to wishlist"
                      className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                        inWishlist
                          ? "bg-rose-500 text-white"
                          : "bg-background/80 text-foreground hover:bg-background hover:text-rose-500 opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                    </button>

                    {/* Image Area with Quick View Trigger */}
                    <div
                      className="relative aspect-square w-full cursor-pointer bg-muted/40 overflow-hidden flex items-center justify-center"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img
                        src={
                          product.image_url ||
                          "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600"
                        }
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-106 transition-transform duration-500"
                      />

                      {/* Quick Add Overlay on Desktop Hover */}
                      <div className="absolute inset-x-3 bottom-3 z-20 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
                        <Button
                          className="w-full h-10 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg bg-background/95 text-foreground hover:bg-primary hover:text-primary-foreground border border-border/80 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOut) addItem(product, 1);
                          }}
                          disabled={isOut}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>{isOut ? t.outOfStock : "Quick Add"}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
                          <span>{product.product_code || "PROD"}</span>
                          <span className="text-amber-600 dark:text-amber-400">55-60 Hrs</span>
                        </div>
                        <h4
                          onClick={() => setSelectedProduct(product)}
                          className={`font-bold text-base text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-1 ${font.headingClass}`}
                        >
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {product.description || "Handcrafted pure botanical soy wax candle infused with bespoke notes."}
                        </p>
                      </div>

                      {/* Price Row & Mobile Add Button */}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-base text-foreground">
                            {formatPrice(price, currency)}
                          </span>
                          {mrp > price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(mrp, currency)}
                            </span>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 px-2.5 text-xs font-bold md:hidden gap-1.5"
                          onClick={() => {
                            if (!isOut) addItem(product, 1);
                          }}
                          disabled={isOut}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 8. Social Proof & Verified Customer Reviews */}
      <section id="reviews" className="py-16 md:py-24 bg-[#F4EFEA]/60 dark:bg-slate-900/40 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <h3 className={`text-3xl sm:text-4xl text-foreground font-light ${font.headingClass}`}>
              Loved by 1,200+ Verified Buyers
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Real reviews from real homes who made {store.name} their olfactory signature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "“The fragrance throw is unmatched. It subtly transforms our entire living room without being overwhelming.”",
                author: "Ananya S.",
                location: "Mumbai",
                product: "Signature Soy Candle",
              },
              {
                quote: "“Beautiful clean burn all the way down. The packaging feels like opening an ultra-luxury boutique gift.”",
                author: "Rohan M.",
                location: "Bengaluru",
                product: "Midnight Amber Set",
              },
              {
                quote: "“Ordered with Cash on Delivery and it arrived within 2 days. The wooden wick crackle is pure serenity.”",
                author: "Priya K.",
                location: "Delhi",
                product: "Festive Gift Hamper",
              },
            ].map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-background border border-border/60 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                    {rev.quote}
                  </p>
                </div>
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{rev.author}</span>
                    <span className="text-[10px] text-muted-foreground">{rev.location}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                    Verified
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Trust Guarantee Indicators */}
      <section className="py-12 border-b border-border/40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 p-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Pan-India Express</span>
                <span className="text-[11px] text-muted-foreground">Tracked delivery in 2-4 days</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Cash on Delivery</span>
                <span className="text-[11px] text-muted-foreground">Pay safely at doorstep</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">100% Satisfaction</span>
                <span className="text-[11px] text-muted-foreground">Hassle-free 7-day returns</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3">
              <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Eco-Friendly Care</span>
                <span className="text-[11px] text-muted-foreground">Plastic-free recyclable box</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. VIP Newsletter & Conversion Footer */}
      <footer className="bg-[#1C1917] text-[#FAF8F5] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Newsletter Box */}
          <div className="max-w-2xl mx-auto text-center space-y-4 p-8 rounded-2xl bg-[#292524] border border-[#3A3532]">
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold block">
              VIP Sanctuary Club
            </span>
            <h4 className={`text-2xl sm:text-3xl font-light text-[#FAF8F5] ${font.headingClass}`}>
              Receive 15% Off Your First Order
            </h4>
            <p className="text-xs text-[#EADDC9] max-w-md mx-auto">
              Join our fragrance insiders for secret batch releases, festive discounts, and candle care rituals.
            </p>

            {newsletterSubscribed ? (
              <div className="inline-flex items-center gap-2 p-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Thank you! Check your inbox for your 15% promo code.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) setNewsletterSubscribed(true);
                }}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
              >
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-[#1C1917] border-[#3A3532] text-white placeholder:text-muted-foreground h-11 rounded-xl text-xs"
                />
                <Button type="submit" className="h-11 px-6 font-bold text-xs uppercase tracking-wider bg-[#FAF8F5] text-[#1C1917] hover:bg-[#EADDC9] rounded-xl flex-shrink-0">
                  Subscribe
                </Button>
              </form>
            )}
          </div>

          {/* Footer Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-[#292524] text-xs text-[#EADDC9]">
            <div className="space-y-3">
              <h5 className="font-bold text-white uppercase tracking-wider text-xs">About Store</h5>
              <p className="text-[11px] leading-relaxed text-[#A89F91]">
                {store.name} creates handcrafted candles designed to bring warmth, serenity, and bespoke fragrances into every space.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-xs">Quick Links</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#shop-all" className="hover:text-white transition-colors">Shop All Products</a></li>
                <li><a href="#collections" className="hover:text-white transition-colors">Signature Line</a></li>
                <li><a href="#our-story" className="hover:text-white transition-colors">Brand Story</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Customer Reviews</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-xs">Customer Care</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><span>Cash on Delivery Policy</span></li>
                <li><span>Track Order Delivery</span></li>
                <li><span>7-Day Return Policy</span></li>
                <li><span>Support: support@simplestore.demo</span></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-xs">Platform</h5>
              <p className="text-[11px] text-[#A89F91] leading-relaxed">
                Powered by SimpleStore — Developer-grade e-commerce engine with ACID transactions and deterministic design matrices.
              </p>
              <Link href="/" className="inline-block text-[10px] font-bold text-amber-400 hover:underline pt-1">
                Launch your store in 5 mins →
              </Link>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-[#292524] text-[11px] text-[#A89F91]">
            © {new Date().getFullYear()} {store.name} • All rights reserved • Powered by SimpleStore
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        currency={currency}
        language={currentLang}
        storeId={store.id}
        onOpenCheckout={() => {
          setCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        storeId={store.id}
        currency={currency}
        language={currentLang}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          setConfirmedOrder(order);
        }}
      />

      {/* Order Confirmation Receipt Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          currency={currency}
          language={currentLang}
          isOpen={!!confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
        />
      )}

      {/* Product Quick View Modal (Multi-Photo Gallery) */}
      <ProductQuickView
        product={selectedProduct}
        currency={currency}
        language={currentLang}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
