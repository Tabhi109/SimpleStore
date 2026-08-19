"use client";

import React, { useState } from "react";
import { Globe, Moon, Search, ShoppingBag, Sun, Sparkles } from "lucide-react";
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

  const [currentLang, setCurrentLang] = useState<StoreLanguage>(
    store.language || "en"
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const { getItemCount, setIsOpen: setCartOpen, addItem } = useCartStore();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currency = (store.currency || "USD") as StoreCurrency;

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-background text-foreground"
      } ${font.bodyClass}`}
    >
      {/* Top Banner if preview mode */}
      {isPreview && (
        <div className="bg-primary/90 text-primary-foreground text-center text-xs py-1.5 px-4 font-semibold flex items-center justify-center gap-1.5 shadow-inner">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Live Storefront Preview — Changes update instantly</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Store Logo / Name */}
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-base shadow-sm">
                {store.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className={`text-lg font-bold tracking-tight ${font.headingClass}`}>
                {store.name}
              </h1>
              {store.category && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {store.category}
                </p>
              )}
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2 sm:px-3">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="uppercase font-semibold">{currentLang}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCurrentLang("en")}>
                  🇺🇸 English (EN)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentLang("hi")}>
                  🇮🇳 Hindi (HI)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentLang("es")}>
                  🇪🇸 Spanish (ES)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentLang("fr")}>
                  🇫🇷 French (FR)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Switcher (If enabled in theme_config) */}
            {theme?.enable_dark_mode_toggle && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Storefront Theme"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                )}
              </Button>
            )}

            {/* Cart Button */}
            <Button
              size="sm"
              className="h-9 gap-2 shadow-sm font-semibold relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{t.cart}</span>
              {getItemCount() > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary text-xs font-black shadow-sm">
                  {getItemCount()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 py-12 sm:py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-4">
          <Badge
            variant="outline"
            className={`font-semibold tracking-wider uppercase text-[11px] px-3 py-1 ${colorPreset.badgeBg}`}
          >
            {store.category || "Featured Collection"}
          </Badge>

          <h2
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight ${font.headingClass}`}
          >
            {store.tagline || store.name}
          </h2>

          {store.description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {store.description}
            </p>
          )}

          {/* Search bar */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products in this store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background/80 shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={`text-xl font-bold ${font.headingClass}`}>
              All Products
            </h3>
            <p className="text-xs text-muted-foreground">
              Showing {filteredProducts.length} items
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 border rounded-xl bg-card">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isOut = product.inventory <= 0;
              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col overflow-hidden bg-card ${archetype.cardClass} ${archetype.roundedClass}`}
                >
                  {/* Product Thumbnail */}
                  <div
                    className="relative aspect-square w-full cursor-pointer bg-muted/40 overflow-hidden flex items-center justify-center"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-12 w-12 stroke-1 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          View Details
                        </span>
                      </div>
                    )}

                    {product.is_ai_generated && (
                      <div className="absolute top-2.5 left-2.5">
                        <Badge
                          variant="outline"
                          className="bg-background/90 backdrop-blur-sm text-[10px] gap-1 font-semibold"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                          AI
                        </Badge>
                      </div>
                    )}

                    {isOut && (
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center font-bold text-xs text-destructive">
                        {t.outOfStock}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                    <div>
                      <h4
                        className={`text-base font-semibold tracking-tight text-foreground truncate cursor-pointer hover:underline ${font.headingClass}`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-normal">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-lg font-black text-foreground">
                        {formatPrice(Number(product.price), currency)}
                      </span>

                      <Button
                        size="sm"
                        disabled={isOut}
                        onClick={() => addItem(product, 1)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{t.addToCart}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <p className="font-semibold text-foreground">{store.name}</p>
          <p>© {new Date().getFullYear()} • Powered by SimpleStore</p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CartDrawer
        storeId={store.id}
        currency={currency}
        language={currentLang}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        storeId={store.id}
        currency={currency}
        language={currentLang}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => setConfirmedOrder(order)}
      />

      <ProductQuickView
        product={selectedProduct}
        currency={currency}
        language={currentLang}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        currency={currency}
        language={currentLang}
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />
    </div>
  );
}
