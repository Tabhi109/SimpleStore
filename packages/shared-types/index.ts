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

export interface BrandPillar {
  title: string;
  desc: string;
  icon?: string;
}

export interface ThemeConfig {
  archetype: ThemeArchetype;
  font_pairing: FontPairing;
  color_preset: ColorPreset;
  enable_dark_mode_toggle: boolean;
  hero_style: "centered" | "split" | "minimal";
  palette?: PaletteConfig;
  custom_images?: string[];
  announcement_text?: string;
  about_story?: string;
  brand_pillars?: BrandPillar[];
  contact_email?: string;
  contact_phone?: string;
  shipping_note?: string;
}

// -----------------------------------------------------------------------------
// Onboarding & Questionnaire
// -----------------------------------------------------------------------------
export interface OnboardingQuestionnaire {
  store_name: string;
  category: string;
  vibe: ThemeArchetype;
  product_summary: string;
  target_audience?: string;
  currency?: StoreCurrency;
  language?: StoreLanguage;
}

export interface StarterProductDraft {
  name: string;
  description: string;
  mrp?: number;
  suggested_price: number;
  inventory: number;
  image_url?: string;
  images?: string[];
}

export interface OnboardingGeneratedResponse {
  tagline: string;
  description: string;
  recommended_theme: ThemeArchetype;
  recommended_font: FontPairing;
  recommended_color: ColorPreset;
  starter_products: StarterProductDraft[];
}

export interface OnboardingGenerationResult {
  tagline: string;
  description: string;
  theme_recommendation: {
    archetype: ThemeArchetype;
    font_pairing: FontPairing;
    color_preset: ColorPreset;
  };
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
  banner_url?: string | null;
  currency: StoreCurrency;
  language: StoreLanguage;
  theme_config: ThemeConfig;
  onboarding_context?: OnboardingQuestionnaire | null;
  published: boolean;
  is_active?: boolean;
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
  product_code: string; // e.g. "PROD-001"
  name: string;
  slug: string;
  description?: string | null;
  mrp: number; // Maximum Retail Price
  price: number; // Selling Price
  currency: string;
  inventory: number; // Actual stock
  inventory_display_limit?: number | null; // Quantity to show in UI
  order_limit?: number | null; // Max quantity per customer order
  image_url?: string | null; // Primary thumbnail
  images: string[]; // Up to 5 full-resolution photos
  is_ai_generated: boolean;
  is_active: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateInput {
  name: string;
  slug?: string;
  product_code?: string;
  description?: string;
  mrp?: number;
  price: number;
  inventory: number;
  inventory_display_limit?: number;
  order_limit?: number;
  image_url?: string;
  images?: string[];
  is_active?: boolean;
  published?: boolean;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export interface InventoryItemUpdate {
  product_id: string;
  inventory: number;
  inventory_display_limit?: number | null;
  order_limit?: number | null;
}

export interface BatchInventoryUpdateRequest {
  updates: InventoryItemUpdate[];
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
  min_order_value?: number | null;
  show_in_suggestions: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export interface CreateCouponRequest {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value?: number;
  show_in_suggestions?: boolean;
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
// Cart, Order & Invoice
// -----------------------------------------------------------------------------
export interface CartItem {
  product_id: string;
  product_name: string;
  product_code?: string;
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
  product_code?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image_url?: string | null;
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentMethod = "COD" | "ONLINE";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "ORD-1001"
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
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
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
  payment_method?: PaymentMethod;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface InvoiceData {
  invoice_number: string;
  order: Order;
  store: {
    name: string;
    slug: string;
    category?: string | null;
    tagline?: string | null;
    currency: StoreCurrency;
  };
  issued_at: string;
}

// -----------------------------------------------------------------------------
// Media & Vercel Blob Uploads
// -----------------------------------------------------------------------------
export interface BlobUploadResponse {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
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
    provider?: string;
    latency_ms?: number;
  };
  redis: {
    connected: boolean;
    latency_ms?: number;
  };
  storage_provider?: {
    type: string;
    configured: boolean;
  };
  ai_provider: {
    configured: boolean;
    provider: string;
  };
}
