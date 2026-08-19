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
// Theme & Design System
// -----------------------------------------------------------------------------
export type ThemeArchetype = "minimal" | "editorial" | "warm" | "bold";

export interface PaletteConfig {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

export interface TypographyConfig {
  heading_font: "serif" | "sans" | "mono";
  body_font: "sans" | "serif";
}

export interface LayoutConfig {
  hero_style: "centered" | "split" | "minimal";
  product_grid_columns: 2 | 3 | 4;
  card_style: "bordered" | "flat" | "elevated";
}

export interface ThemeConfig {
  archetype: ThemeArchetype;
  palette: PaletteConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
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
}

export interface StarterProductDraft {
  name: string;
  description: string;
  suggested_price: number;
  inventory: number;
}

export interface OnboardingGeneratedResponse {
  tagline: string;
  description: string;
  recommended_theme: ThemeArchetype;
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
  theme_config: ThemeConfig;
  onboarding_context?: OnboardingQuestionnaire | null;
  published: boolean;
  created_at: string;
  updated_at: string;
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
  total_amount: number;
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
