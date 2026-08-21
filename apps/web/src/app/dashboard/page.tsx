"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  Edit2,
  ExternalLink,
  Eye,
  Globe,
  Layout,
  Loader2,
  Moon,
  Package,
  Palette,
  Plus,
  Rocket,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Type,
  Users,
} from "lucide-react";
import {
  ColorPreset,
  Coupon,
  FontPairing,
  Order,
  Product,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/features/auth/auth-store";
import { apiClient } from "@/lib/api-client";
import {
  COLOR_PRESETS,
  CURRENCY_MAP,
  FONT_PAIRINGS,
  formatPrice,
  THEME_ARCHETYPES,
} from "@/lib/theme-utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, activeStore, setActiveStore, logout, isAuthenticated } =
    useAuthStore();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(activeStore);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("29.99");
  const [newProdInventory, setNewProdInventory] = useState("15");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [isGeneratingAIFeatures, setIsGeneratingAIFeatures] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Create Coupon Modal State
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percentage" | "fixed">("percentage");
  const [newCouponValue, setNewCouponValue] = useState("10");
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Appearance State
  const [themeArchetype, setThemeArchetype] = useState<ThemeArchetype>("minimal");
  const [fontPairing, setFontPairing] = useState<FontPairing>("sans");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("slate");
  const [enableDarkModeToggle, setEnableDarkModeToggle] = useState(true);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [themeSavedToast, setThemeSavedToast] = useState(false);

  // Settings State
  const [settingsCurrency, setSettingsCurrency] = useState<StoreCurrency>("USD");
  const [settingsLanguage, setSettingsLanguage] = useState<StoreLanguage>("en");
  const [settingsTagline, setSettingsTagline] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Load Merchant Stores
  useEffect(() => {
    if (!token) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const myStores = await apiClient.get<Store[]>("/stores/me", token!);
        setStores(myStores);

        const current = myStores[0] || null;
        setSelectedStore(current);
        setActiveStore(current);

        if (current) {
          // Initialize appearance & settings state from store
          setThemeArchetype((current.theme_config?.archetype as ThemeArchetype) || "minimal");
          setFontPairing((current.theme_config?.font_pairing as FontPairing) || "sans");
          setColorPreset((current.theme_config?.color_preset as ColorPreset) || "slate");
          setEnableDarkModeToggle(current.theme_config?.enable_dark_mode_toggle ?? true);
          setSettingsCurrency(current.currency || "USD");
          setSettingsLanguage(current.language || "en");
          setSettingsTagline(current.tagline || "");

          // Fetch products, orders, coupons
          const [prods, ords, coups] = await Promise.all([
            apiClient.get<Product[]>(`/stores/${current.id}/products`, token!),
            apiClient.get<Order[]>(`/stores/${current.id}/orders`, token!),
            apiClient.get<Coupon[]>(`/stores/${current.id}/coupons`, token!),
          ]);
          setProducts(prods);
          setOrders(ords);
          setCoupons(coups);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token]);

  // Copy Store Link
  const handleCopyLink = () => {
    if (!selectedStore) return;
    const url = `${window.location.origin}/store/${selectedStore.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Toggle Publish
  const handleTogglePublish = async () => {
    if (!selectedStore || !token) return;
    try {
      const res = await apiClient.post<Store>(
        `/stores/${selectedStore.id}/publish`,
        {},
        token
      );
      setSelectedStore(res);
      setActiveStore(res);
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  // AI "Write it for me" Description Generator
  const handleAIGenerateProductCopy = async () => {
    if (!newProdName.trim()) return;
    setIsGeneratingAIFeatures(true);
    try {
      const res = await apiClient.post<{ description: string; highlights: string[] }>(
        "/ai/product-description",
        {
          product_name: newProdName,
          category: selectedStore?.category || "General",
        },
        token!
      );
      setNewProdDesc(res.description);
    } catch {
      setNewProdDesc(
        `High-quality ${newProdName} crafted with premium materials. Designed for longevity and elegance.`
      );
    } finally {
      setIsGeneratingAIFeatures(false);
    }
  };

  // Add Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = selectedStore || activeStore;
    if (!current || !token || !newProdName) return;

    setIsSavingProduct(true);
    try {
      const slug = newProdName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const created = await apiClient.post<Product>(
        `/stores/${current.id}/products`,
        {
          name: newProdName,
          slug,
          price: parseFloat(newProdPrice) || 0,
          inventory: parseInt(newProdInventory) || 0,
          description: newProdDesc,
          published: true,
        },
        token
      );
      setProducts([created, ...products]);
      setIsAddProductOpen(false);
      setNewProdName("");
      setNewProdDesc("");
    } catch (err) {
      console.error("Create product error:", err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!token || !confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${productId}`, token);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  // Create Coupon Submit
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const current = selectedStore || activeStore;
    if (!current || !token || !newCouponCode) return;

    setIsSavingCoupon(true);
    try {
      const created = await apiClient.post<Coupon>(
        `/stores/${current.id}/coupons`,
        {
          code: newCouponCode.toUpperCase().trim(),
          discount_type: newCouponType,
          discount_value: parseFloat(newCouponValue) || 10,
          is_active: true,
        },
        token
      );
      setCoupons([created, ...coupons]);
      setIsAddCouponOpen(false);
      setNewCouponCode("");
    } catch (err) {
      console.error("Create coupon error:", err);
    } finally {
      setIsSavingCoupon(false);
    }
  };

  // Save Theme Changes
  const handleSaveTheme = async () => {
    if (!selectedStore || !token) return;
    setIsSavingTheme(true);
    try {
      const newTheme: ThemeConfig = {
        archetype: themeArchetype,
        font_pairing: fontPairing,
        color_preset: colorPreset,
        enable_dark_mode_toggle: enableDarkModeToggle,
        hero_style: "centered",
      };

      const updated = await apiClient.patch<Store>(
        `/stores/${selectedStore.id}`,
        { theme_config: newTheme },
        token
      );
      setSelectedStore(updated);
      setActiveStore(updated);
      setThemeSavedToast(true);
      setTimeout(() => setThemeSavedToast(false), 2500);
    } catch (err) {
      console.error("Save theme error:", err);
    } finally {
      setIsSavingTheme(false);
    }
  };

  // Save Settings Changes
  const handleSaveSettings = async () => {
    if (!selectedStore || !token) return;
    setIsSavingSettings(true);
    try {
      const updated = await apiClient.patch<Store>(
        `/stores/${selectedStore.id}`,
        {
          currency: settingsCurrency,
          language: settingsLanguage,
          tagline: settingsTagline,
        },
        token
      );
      setSelectedStore(updated);
      setActiveStore(updated);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;
    try {
      const updated = await apiClient.patch<Order>(
        `/orders/${orderId}/status`,
        { status: newStatus },
        token
      );
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      console.error("Update order status error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // No store found -> prompt onboarding
  if (!selectedStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Rocket className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">No Stores Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mt-2">
          You have not created a store yet. Answer 4 questions to launch your store with AI in seconds!
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/onboarding">
            <Sparkles className="h-4 w-4" />
            Launch New Store
          </Link>
        </Button>
      </div>
    );
  }

  // Metrics
  const grossRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalOrdersCount = orders.length;
  const activeProductsCount = products.filter((p) => p.published).length;
  const activeCouponsCount = coupons.filter((c) => c.is_active).length;
  const storeCurrency = (selectedStore.currency || "USD") as StoreCurrency;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Merchant Bar */}
      <header className="border-b border-border/80 bg-card/70 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="container mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
              {selectedStore.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg">{selectedStore.name}</h1>
                <Badge
                  variant={selectedStore.published ? "default" : "secondary"}
                  className="text-[10px] cursor-pointer"
                  onClick={handleTogglePublish}
                >
                  {selectedStore.published ? "Live • Published" : "Draft • Unpublished"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Slug: <span className="font-mono">{selectedStore.slug}</span> • Currency:{" "}
                <span className="font-semibold">{selectedStore.currency}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Copy Storefront Link */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied Link!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Store URL
                </>
              )}
            </Button>

            {/* Visit Public Store */}
            <Button
              size="sm"
              className="gap-1.5 text-xs font-semibold shadow-sm"
              asChild
            >
              <Link href={`/store/${selectedStore.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                View Live Store
              </Link>
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Navigation */}
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-3xl bg-muted/60 p-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs">
              <ShoppingBag className="h-3.5 w-3.5" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 text-xs">
              <Palette className="h-3.5 w-3.5" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-1.5 text-xs">
              <Tag className="h-3.5 w-3.5" />
              Coupons ({coupons.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {formatPrice(grossRevenue, storeCurrency)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    From {totalOrdersCount} completed orders
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Orders
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {totalOrdersCount}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {orders.filter((o) => o.status === "pending").length} pending fulfillment
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Catalog
                  </CardTitle>
                  <Package className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {activeProductsCount}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {products.reduce((s, p) => s + p.inventory, 0)} total units in stock
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Promo Codes
                  </CardTitle>
                  <Tag className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {activeCouponsCount}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Available for customer checkout
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders Overview */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Customer Orders</CardTitle>
                  <CardDescription className="text-xs">
                    Latest transactions placed on your storefront
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setActiveTab("orders")}
                >
                  View All Orders
                </Button>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs">
                    No orders placed yet. Share your store link with customers!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-muted-foreground border-b border-border/60">
                        <tr>
                          <th className="pb-2">Order ID</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Items</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-muted/30">
                            <td className="py-3 font-mono font-bold">
                              #{ord.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="py-3 font-medium">
                              {ord.customer_name}
                              <span className="block text-[10px] text-muted-foreground">
                                {ord.customer_email}
                              </span>
                            </td>
                            <td className="py-3">
                              {ord.items?.length || 1} item(s)
                            </td>
                            <td className="py-3 font-bold">
                              {formatPrice(Number(ord.total_amount), storeCurrency)}
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={ord.status === "fulfilled" ? "default" : "outline"}
                                className="text-[10px]"
                              >
                                {ord.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {new Date(ord.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PRODUCTS */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Product Catalog</h2>
                <p className="text-xs text-muted-foreground">
                  Manage inventory, pricing, and create AI-crafted descriptions.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold shadow-sm"
                onClick={() => setIsAddProductOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs space-y-3">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground/60" />
                    <p>No products in your catalog.</p>
                    <Button
                      size="sm"
                      onClick={() => setIsAddProductOpen(true)}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add First Product
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Origin</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/30">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground shrink-0 overflow-hidden">
                                  {p.image_url ? (
                                    <img
                                      src={p.image_url}
                                      alt={p.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    "ITEM"
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold text-foreground block">
                                    {p.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    /{p.slug}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-bold">
                              {formatPrice(Number(p.price), storeCurrency)}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={p.inventory > 0 ? "outline" : "secondary"}
                                className="text-[10px]"
                              >
                                {p.inventory} in stock
                              </Badge>
                            </td>
                            <td className="p-3">
                              {p.is_ai_generated ? (
                                <Badge variant="outline" className="gap-1 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  AI Generated
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">Manual</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ORDERS */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Store Orders</h2>
                <p className="text-xs text-muted-foreground">
                  View and manage customer purchases and fulfillment status.
                </p>
              </div>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    No orders have been received yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Purchased Items</th>
                          <th className="p-3">Discount</th>
                          <th className="p-3">Total Paid</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-muted/30">
                            <td className="p-3 font-mono font-bold">
                              #{ord.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-foreground">
                                {ord.customer_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {ord.customer_email}
                              </p>
                              {ord.shipping_address && (
                                <p className="text-[10px] text-muted-foreground">
                                  {ord.shipping_address}
                                </p>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5">
                                {ord.items?.map((it, idx) => (
                                  <div key={idx} className="text-[11px]">
                                    {it.quantity}x {it.product_name}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-emerald-600 font-semibold">
                              {Number(ord.discount_amount) > 0 ? (
                                `-${formatPrice(Number(ord.discount_amount), storeCurrency)}`
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-3 font-bold text-foreground">
                              {formatPrice(Number(ord.total_amount), storeCurrency)}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={ord.status === "fulfilled" ? "default" : "outline"}
                                className="text-[10px]"
                              >
                                {ord.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              {ord.status === "pending" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[11px]"
                                  onClick={() =>
                                    handleUpdateOrderStatus(ord.id, "fulfilled")
                                  }
                                >
                                  Mark Fulfilled
                                </Button>
                              ) : (
                                <span className="text-emerald-500 font-semibold text-[11px]">
                                  ✓ Completed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: APPEARANCE (Theme Matrix Customizer) */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Theme & Style Customizer</h2>
                <p className="text-xs text-muted-foreground">
                  Update design tokens, font pairings, and color palettes without touching code.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleSaveTheme}
                disabled={isSavingTheme}
                className="gap-1.5 text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSavingTheme ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : themeSavedToast ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Palette className="h-3.5 w-3.5" />
                    Save Theme Changes
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Archetype */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" />
                    Style Archetype
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(Object.entries(THEME_ARCHETYPES) as [ThemeArchetype, any][]).map(
                    ([archKey, archDef]) => (
                      <button
                        key={archKey}
                        onClick={() => setThemeArchetype(archKey)}
                        className={`w-full p-3 rounded-lg border text-left transition-all text-xs ${
                          themeArchetype === archKey
                            ? "border-primary bg-primary/10 font-bold ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{archDef.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {archDef.description}
                        </p>
                      </button>
                    )
                  )}
                </CardContent>
              </Card>

              {/* 2. Font Pairing */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    Font Pairing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(Object.entries(FONT_PAIRINGS) as [FontPairing, any][]).map(
                    ([fontKey, fontDef]) => (
                      <button
                        key={fontKey}
                        onClick={() => setFontPairing(fontKey)}
                        className={`w-full p-3 rounded-lg border text-left transition-all text-xs ${
                          fontPairing === fontKey
                            ? "border-primary bg-primary/10 font-bold ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{fontDef.name}</p>
                      </button>
                    )
                  )}
                </CardContent>
              </Card>

              {/* 3. Color Preset & Features */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Color Palette & Toggles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(COLOR_PRESETS) as [ColorPreset, any][]).map(
                      ([colKey, colDef]) => (
                        <button
                          key={colKey}
                          onClick={() => setColorPreset(colKey)}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs transition-all ${
                            colorPreset === colKey
                              ? "border-primary bg-primary/10 font-bold ring-1 ring-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <div
                            className="h-4 w-4 rounded-full shadow-sm"
                            style={{ backgroundColor: colDef.primary }}
                          />
                          <span className="truncate">{colDef.name}</span>
                        </button>
                      )
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/60">
                    <label className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/20 cursor-pointer">
                      <div className="flex items-center gap-2 text-xs">
                        <Moon className="h-4 w-4 text-primary" />
                        <span>Enable Storefront Dark Mode Switch</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableDarkModeToggle}
                        onChange={(e) => setEnableDarkModeToggle(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 5: COUPONS */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Promo Codes & Discounts</h2>
                <p className="text-xs text-muted-foreground">
                  Create discount codes for customer checkout.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold shadow-sm"
                onClick={() => setIsAddCouponOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Coupon
              </Button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {coupons.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs space-y-3">
                    <Tag className="h-10 w-10 mx-auto text-muted-foreground/60" />
                    <p>No active coupon codes created yet.</p>
                    <Button
                      size="sm"
                      onClick={() => setIsAddCouponOpen(true)}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create First Coupon (e.g. WELCOME10)
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-3">Coupon Code</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Discount Value</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-muted/30">
                            <td className="p-3 font-mono font-bold text-foreground">
                              {c.code}
                            </td>
                            <td className="p-3 capitalize">{c.discount_type}</td>
                            <td className="p-3 font-bold text-emerald-600">
                              {c.discount_type === "percentage"
                                ? `${c.discount_value}% OFF`
                                : `-${formatPrice(Number(c.discount_value), storeCurrency)}`}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={c.is_active ? "default" : "outline"}
                                className="text-[10px]"
                              >
                                {c.is_active ? "Active" : "Disabled"}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Store Settings</h2>
              <p className="text-xs text-muted-foreground">
                Configure currency, language, branding, and publication status.
              </p>
            </div>

            <Card className="shadow-sm max-w-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Store Slogan / Tagline</Label>
                  <Input
                    value={settingsTagline}
                    onChange={(e) => setSettingsTagline(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Store Currency</Label>
                    <select
                      value={settingsCurrency}
                      onChange={(e) => setSettingsCurrency(e.target.value as StoreCurrency)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      {Object.entries(CURRENCY_MAP).map(([curr, def]) => (
                        <option key={curr} value={curr}>
                          {def.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Store Language</Label>
                    <select
                      value={settingsLanguage}
                      onChange={(e) => setSettingsLanguage(e.target.value as StoreLanguage)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="en">English (EN)</option>
                      <option value="hi">Hindi (HI)</option>
                      <option value="es">Spanish (ES)</option>
                      <option value="fr">French (FR)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="text-xs font-semibold"
                  >
                    {isSavingSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ADD PRODUCT MODAL */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add New Product</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new item to your store catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="pname" className="text-xs font-semibold">
                Product Title *
              </Label>
              <Input
                id="pname"
                placeholder="e.g. Ethiopian Yirgacheffe Roast"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pprice" className="text-xs font-semibold">
                  Price ({storeCurrency}) *
                </Label>
                <Input
                  id="pprice"
                  type="number"
                  step="0.01"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pstock" className="text-xs font-semibold">
                  Stock Count *
                </Label>
                <Input
                  id="pstock"
                  type="number"
                  required
                  value={newProdInventory}
                  onChange={(e) => setNewProdInventory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pdesc" className="text-xs font-semibold">
                  Description
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2 text-primary border-primary/30 hover:bg-primary/5"
                  onClick={handleAIGenerateProductCopy}
                  disabled={isGeneratingAIFeatures || !newProdName.trim()}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  {isGeneratingAIFeatures ? "Writing..." : "Write it for me (AI)"}
                </Button>
              </div>
              <textarea
                id="pdesc"
                rows={3}
                placeholder="Describe key ingredients, dimensions, or highlights..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddProductOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingProduct || !newProdName}
              >
                {isSavingProduct ? "Saving..." : "Add to Catalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE COUPON MODAL */}
      <Dialog open={isAddCouponOpen} onOpenChange={setIsAddCouponOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Discount Coupon</DialogTitle>
            <DialogDescription className="text-xs">
              Offer a percentage or fixed discount to your customers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ccode" className="text-xs font-semibold">
                Coupon Code *
              </Label>
              <Input
                id="ccode"
                placeholder="e.g. WELCOME10, SUMMER20"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Discount Type</Label>
                <select
                  value={newCouponType}
                  onChange={(e) =>
                    setNewCouponType(e.target.value as "percentage" | "fixed")
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Discount Value *</Label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddCouponOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingCoupon || !newCouponCode}
              >
                {isSavingCoupon ? "Creating..." : "Save Promo Code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
