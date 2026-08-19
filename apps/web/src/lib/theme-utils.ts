/**
 * SimpleStore Theme Matrix & Design System Engine
 */

import { ColorPreset, FontPairing, StoreCurrency, StoreLanguage, ThemeArchetype, ThemeConfig } from "@simplestore/shared-types";

export interface ColorPresetDefinition {
  id: ColorPreset;
  name: string;
  primary: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  badgeBg: string;
}

export const COLOR_PRESETS: Record<ColorPreset, ColorPresetDefinition> = {
  slate: {
    id: "slate",
    name: "Midnight Slate",
    primary: "rgb(15, 23, 42)",
    accent: "rgb(37, 99, 235)",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950",
    badgeBg: "bg-slate-900 text-white",
  },
  indigo: {
    id: "indigo",
    name: "Royal Indigo",
    primary: "rgb(79, 70, 229)",
    accent: "rgb(129, 140, 248)",
    bgLight: "bg-indigo-50/40",
    bgDark: "dark:bg-slate-950",
    badgeBg: "bg-indigo-600 text-white",
  },
  emerald: {
    id: "emerald",
    name: "Forest Emerald",
    primary: "rgb(5, 150, 105)",
    accent: "rgb(16, 185, 129)",
    bgLight: "bg-emerald-50/40",
    bgDark: "dark:bg-slate-950",
    badgeBg: "bg-emerald-600 text-white",
  },
  amber: {
    id: "amber",
    name: "Warm Terracotta",
    primary: "rgb(217, 119, 6)",
    accent: "rgb(245, 158, 11)",
    bgLight: "bg-amber-50/40",
    bgDark: "dark:bg-stone-950",
    badgeBg: "bg-amber-600 text-white",
  },
  rose: {
    id: "rose",
    name: "Velvet Rose",
    primary: "rgb(225, 29, 72)",
    accent: "rgb(244, 63, 94)",
    bgLight: "bg-rose-50/30",
    bgDark: "dark:bg-stone-950",
    badgeBg: "bg-rose-600 text-white",
  },
};

export const FONT_PAIRINGS: Record<FontPairing, { name: string; headingClass: string; bodyClass: string }> = {
  sans: {
    name: "Modern Sans (Inter)",
    headingClass: "font-sans tracking-tight",
    bodyClass: "font-sans",
  },
  serif: {
    name: "Editorial Serif (Playfair)",
    headingClass: "font-serif tracking-normal font-semibold",
    bodyClass: "font-sans",
  },
  mono: {
    name: "Technical Mono (JetBrains)",
    headingClass: "font-mono uppercase tracking-wider font-bold",
    bodyClass: "font-sans",
  },
  rounded: {
    name: "Warm Rounded",
    headingClass: "font-sans font-extrabold tracking-tight rounded-heading",
    bodyClass: "font-sans",
  },
};

export const THEME_ARCHETYPES: Record<ThemeArchetype, { name: string; description: string; cardClass: string; roundedClass: string }> = {
  minimal: {
    name: "Minimal",
    description: "Clean monochrome whitespace, borderless product cards, ultra-modern vibe.",
    cardClass: "border border-border/60 bg-card shadow-none hover:border-foreground/30 transition-all",
    roundedClass: "rounded-md",
  },
  editorial: {
    name: "Editorial",
    description: "High-end luxury magazine aesthetic with rich storytelling cards.",
    cardClass: "border-none bg-card/60 shadow-sm hover:shadow-md transition-all",
    roundedClass: "rounded-none",
  },
  warm: {
    name: "Warm Organic",
    description: "Soft ambient surfaces, terracotta tones, and gentle rounded curves.",
    cardClass: "border border-amber-500/20 bg-card shadow-sm hover:shadow-md transition-all",
    roundedClass: "rounded-2xl",
  },
  bold: {
    name: "Bold High-Contrast",
    description: "High-energy borders, punchy badges, and modern dark accents.",
    cardClass: "border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    roundedClass: "rounded-lg",
  },
};

export const CURRENCY_MAP: Record<StoreCurrency, { symbol: string; label: string; locale: string }> = {
  USD: { symbol: "$", label: "USD ($)", locale: "en-US" },
  INR: { symbol: "₹", label: "INR (₹)", locale: "en-IN" },
  EUR: { symbol: "€", label: "EUR (€)", locale: "de-DE" },
  GBP: { symbol: "£", label: "GBP (£)", locale: "en-GB" },
  CAD: { symbol: "$", label: "CAD ($)", locale: "en-CA" },
  AUD: { symbol: "$", label: "AUD ($)", locale: "en-AU" },
  JPY: { symbol: "¥", label: "JPY (¥)", locale: "ja-JP" },
};

export function formatPrice(
  amount: number,
  currency: StoreCurrency = "USD",
  locale?: string
): string {
  const config = CURRENCY_MAP[currency] || CURRENCY_MAP.USD;
  try {
    return new Intl.NumberFormat(locale || config.locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

// Micro-translations for Storefront
export const TRANSLATIONS: Record<StoreLanguage, Record<string, string>> = {
  en: {
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    checkout: "Checkout",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    onlyLeft: "Only {count} left",
    cart: "Your Cart",
    cartEmpty: "Your cart is empty.",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    applyCoupon: "Apply",
    couponPlaceholder: "Promo code (e.g. WELCOME10)",
    placeOrder: "Place Order (Demo Payment)",
    orderPlaced: "Order Confirmed!",
    thankYou: "Thank you for your purchase.",
    orderNumber: "Order Number",
    orderStatus: "Status",
    demoPaymentNotice: "This is a demo store. No real money was charged.",
    continueShopping: "Continue Shopping",
  },
  hi: {
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    checkout: "चेकआउट",
    inStock: "उपलब्ध है",
    outOfStock: "स्टॉक में नहीं",
    onlyLeft: "केवल {count} शेष",
    cart: "आपकी कार्ट",
    cartEmpty: "आपकी कार्ट खाली है।",
    subtotal: "उप-योग",
    discount: "छूट",
    total: "कुल राशि",
    applyCoupon: "लागू करें",
    couponPlaceholder: "कूपन कोड",
    placeOrder: "ऑर्डर दें (डेमो भुगतान)",
    orderPlaced: "ऑर्डर की पुष्टि हो गई!",
    thankYou: "आपकी खरीदारी के लिए धन्यवाद।",
    orderNumber: "ऑर्डर संख्या",
    orderStatus: "स्थिति",
    demoPaymentNotice: "यह एक डेमो स्टोर है। कोई वास्तविक शुल्क नहीं लिया गया।",
    continueShopping: "खरीदारी जारी रखें",
  },
  es: {
    addToCart: "Añadir al carrito",
    buyNow: "Comprar ahora",
    checkout: "Finalizar compra",
    inStock: "En stock",
    outOfStock: "Agotado",
    onlyLeft: "Solo quedan {count}",
    cart: "Tu carrito",
    cartEmpty: "Tu carrito está vacío.",
    subtotal: "Subtotal",
    discount: "Descuento",
    total: "Total",
    applyCoupon: "Aplicar",
    couponPlaceholder: "Código de descuento",
    placeOrder: "Realizar pedido (Demo)",
    orderPlaced: "¡Pedido confirmado!",
    thankYou: "Gracias por tu compra.",
    orderNumber: "Número de pedido",
    orderStatus: "Estado",
    demoPaymentNotice: "Esta es una tienda de demostración. No se realizó ningún cargo.",
    continueShopping: "Seguir comprando",
  },
  fr: {
    addToCart: "Ajouter au panier",
    buyNow: "Acheter maintenant",
    checkout: "Commander",
    inStock: "En stock",
    outOfStock: "Épuisé",
    onlyLeft: "Plus que {count} en stock",
    cart: "Votre panier",
    cartEmpty: "Votre panier est vide.",
    subtotal: "Sous-total",
    discount: "Réduction",
    total: "Total",
    applyCoupon: "Appliquer",
    couponPlaceholder: "Code promo",
    placeOrder: "Passer commande (Démo)",
    orderPlaced: "Commande confirmée !",
    thankYou: "Merci pour votre achat.",
    orderNumber: "Numéro de commande",
    orderStatus: "Statut",
    demoPaymentNotice: "Ceci est une boutique de démonstration. Aucun montant n'a été débité.",
    continueShopping: "Continuer les achats",
  },
};
