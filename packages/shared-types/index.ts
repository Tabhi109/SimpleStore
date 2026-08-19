/**
 * SimpleStore - Core Shared TypeScript Definitions
 */

// -----------------------------------------------------------------------------
// User & Auth
// -----------------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// -----------------------------------------------------------------------------
// Theme & Design System Matrix
// -----------------------------------------------------------------------------
export type ThemeArchetype = "minimal" | "editorial" | "warm" | "bold";
export type FontPairing = "sans" | "serif" | "mono" | "rounded";
export type ColorPreset = "slate" | "indigo" | "emerald" | "amber" | "rose";
export type StoreCurrency = "USD" | "INR" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";
export type StoreLanguage = "en" | "hi" | "es" | "fr";

export interface PaletteConfig {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

export interface ThemeConfig {
  archetype: ThemeArchetype;
  font_pairing: FontPairing;
  color_preset: ColorPreset;
  enable_dark_mode_toggle: boolean;
  hero_style: "centered" | "split" | "minimal";
  palette?: PaletteConfig;
}

// -----------------------------------------------------------------------------
// Onboarding & Questionnaire
// -----------------------------------------------------------------------------
export interface OnboardingQuestionnaire {
  store_name: string;
  category: string;
  vibe: "minimal" | "warm" | "editorial" | "bold" | "playful" | "luxurious";
  product_summary: string;
  target_audience?: string;
  currency?: StoreCurrency;
  language?: StoreLanguage;
}

export interface StarterProductDraft {
  name: string;
  description: string;
  suggested_price: number;
  inventory: number;
  image_url?: string;
}

export interface OnboardingGeneratedResponse {
  tagline: string;
  description: string;
  recommended_theme: ThemeArchetype;
  recommended_font: FontPairing;
  recommended_color: ColorPreset;
  starter_products: StarterProductDraft[];
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------
export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  currency: StoreCurrency;
  language: StoreLanguage;
  theme_config: ThemeConfig;
  onboarding_context?: OnboardingQuestionnaire | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorePublicData extends Store {
  products: Product[];
}

// -----------------------------------------------------------------------------
// Product
// -----------------------------------------------------------------------------
export interface Product {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  inventory: number;
  image_url?: string | null;
  is_ai_generated: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Coupon
// -----------------------------------------------------------------------------
export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateCouponRequest {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  is_active?: boolean;
}

export interface ValidateCouponRequest {
  code: string;
  cart_total: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  final_total: number;
  message?: string;
}

// -----------------------------------------------------------------------------
// Cart & Order
// -----------------------------------------------------------------------------
export interface CartItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  image_url?: string | null;
  currency: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type OrderStatus = "pending" | "fulfilled" | "cancelled";
export type PaymentStatus = "demo_paid" | "pending" | "failed";

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: string | null;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string | null;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  coupon_code?: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

// -----------------------------------------------------------------------------
// API Common Types & Health
// -----------------------------------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  database: {
    connected: boolean;
    latency_ms?: number;
  };
  redis: {
    connected: boolean;
    latency_ms?: number;
  };
  ai_provider: {
    configured: boolean;
    provider: string;
  };
}
