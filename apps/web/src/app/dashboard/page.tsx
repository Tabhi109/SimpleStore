"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  Layout,
  Loader2,
  Lock,
  Moon,
  Package,
  Palette,
  Plus,
  Printer,
  QrCode,
  Radio,
  Receipt,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  BatchInventoryUpdateRequest,
  ColorPreset,
  Coupon,
  DiscountType,
  FontPairing,
  InvoiceData,
  Order,
  OrderStatus,
  PaymentMethod,
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
  THEME_ARCHETYPES,
  formatPrice,
} from "@/lib/theme-utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, setActiveStore, isAuthenticated } = useAuthStore();

  // State: Core Store & Data
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal 1: Photo Gallery Modal (👁️)
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Modal 2: Add / Edit Product Drawer
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodCode, setProdCode] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodMRP, setProdMRP] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodInventory, setProdInventory] = useState("10");
  const [prodDisplayLimit, setProdDisplayLimit] = useState("");
  const [prodOrderLimit, setProdOrderLimit] = useState("5");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingBlob, setIsUploadingBlob] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isGeneratingAICopy, setIsGeneratingAICopy] = useState(false);

  // Modal 3: Inline Inventory Management State
  const [inventoryEdits, setInventoryEdits] = useState<
    Record<string, { inventory: number; display_limit?: number; order_limit?: number }>
  >({});
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [inventorySavedToast, setInventorySavedToast] = useState(false);

  // Modal 4: Invoice Modal
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Modal 5: Coupon Manager
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<DiscountType>("percentage");
  const [newCouponValue, setNewCouponValue] = useState("15");
  const [newCouponMinOrder, setNewCouponMinOrder] = useState("0");
  const [newCouponSuggestion, setNewCouponSuggestion] = useState(true);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Modal 6: Appearance & Settings
  const [themeArchetype, setThemeArchetype] = useState<ThemeArchetype>("minimal");
  const [fontPairing, setFontPairing] = useState<FontPairing>("sans");
  const [colorPreset, setColorPreset] = useState<ColorPreset>("slate");
  const [enableDarkModeToggle, setEnableDarkModeToggle] = useState(true);
  const [settingsCurrency, setSettingsCurrency] = useState<StoreCurrency>("USD");
  const [settingsLanguage, setSettingsLanguage] = useState<StoreLanguage>("en");
  const [settingsTagline, setSettingsTagline] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Load Merchant Stores and Data
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
          setThemeArchetype((current.theme_config?.archetype as ThemeArchetype) || "minimal");
          setFontPairing((current.theme_config?.font_pairing as FontPairing) || "sans");
          setColorPreset((current.theme_config?.color_preset as ColorPreset) || "slate");
          setEnableDarkModeToggle(current.theme_config?.enable_dark_mode_toggle ?? true);
          setSettingsCurrency(current.currency || "USD");
          setSettingsLanguage(current.language || "en");
          setSettingsTagline(current.tagline || "");
          setSettingsDescription(current.description || "");

          const [prods, ords, coups] = await Promise.all([
            apiClient.get<Product[]>(`/stores/${current.id}/products`, token!),
            apiClient.get<Order[]>(`/stores/${current.id}/orders`, token!),
            apiClient.get<Coupon[]>(`/stores/${current.id}/coupons`, token!),
          ]);
          setProducts(prods);
          setOrders(ords);
          setCoupons(coups);

          // Initialize inline inventory dictionary
          const initialInv: Record<string, any> = {};
          prods.forEach((p) => {
            initialInv[p.id] = {
              inventory: p.inventory,
              display_limit: p.inventory_display_limit ?? p.inventory,
              order_limit: p.order_limit ?? 5,
            };
          });
          setInventoryEdits(initialInv);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token]);

  // Toggle Store Active / Inactive
  const handleToggleStoreActive = async () => {
    if (!selectedStore || !token) return;
    try {
      const updated = await apiClient.patch<Store>(
        `/stores/${selectedStore.id}`,
        { is_active: !selectedStore.is_active, published: !selectedStore.is_active },
        token || undefined
      );
      setSelectedStore(updated);
      setActiveStore(updated);
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  // Copy Public Store URL
  const handleCopyLink = () => {
    if (!selectedStore) return;
    const url = `${window.location.origin}/store/${selectedStore.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Photo Upload (Vercel Blob / Local Storage)
  const handleBlobFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBlob(true);
    try {
      const res = await apiClient.uploadBlob(file);
      if (res.url) {
        setProdImages((prev) => [...prev, res.url].slice(0, 5));
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingBlob(false);
      e.target.value = "";
    }
  };

  // Add Image via Direct URL
  const handleAddImageUrl = () => {
    if (!newImageUrl) return;
    if (prodImages.length >= 5) {
      alert("Maximum 5 photos allowed per product.");
      return;
    }
    setProdImages((prev) => [...prev, newImageUrl.trim()].slice(0, 5));
    setNewImageUrl("");
  };

  // Remove Photo from Draft List
  const handleRemovePhoto = (idx: number) => {
    setProdImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // AI Product Copy Generation
  const handleGenerateAICopy = async () => {
    if (!prodName) {
      alert("Please enter a product title first.");
      return;
    }
    setIsGeneratingAICopy(true);
    try {
      const res = await apiClient.post<{ description: string; features: string[] }>(
        "/ai/product-copy",
        {
          product_name: prodName,
          category: selectedStore?.category || "Artisan Goods",
          tone: themeArchetype,
        },
        token || undefined
      );
      if (res.description) {
        setProdDesc(res.description);
      }
    } catch (err: any) {
      console.error("AI copy error:", err);
    } finally {
      setIsGeneratingAICopy(false);
    }
  };

  // Open Add Product Drawer
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdCode(`PROD-${(products.length + 1).toString().padStart(3, "0")}`);
    setProdName("");
    setProdDesc("");
    setProdMRP("");
    setProdPrice("");
    setProdInventory("10");
    setProdDisplayLimit("10");
    setProdOrderLimit("5");
    setProdImages([]);
    setIsProductModalOpen(true);
  };

  // Open Edit Product Drawer
  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdCode(p.product_code || `PROD-${p.slug}`);
    setProdName(p.name);
    setProdDesc(p.description || "");
    setProdMRP(p.mrp ? String(p.mrp) : String(p.price));
    setProdPrice(String(p.price));
    setProdInventory(String(p.inventory));
    setProdDisplayLimit(p.inventory_display_limit ? String(p.inventory_display_limit) : "");
    setProdOrderLimit(p.order_limit ? String(p.order_limit) : "5");
    setProdImages(p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []);
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !token) return;
    if (!prodName || !prodPrice) {
      alert("Please fill in Product Name and Selling Price.");
      return;
    }

    setIsSavingProduct(true);
    try {
      const priceNum = parseFloat(prodPrice);
      const mrpNum = prodMRP ? parseFloat(prodMRP) : priceNum;
      const invNum = parseInt(prodInventory, 10) || 0;
      const dispNum = prodDisplayLimit ? parseInt(prodDisplayLimit, 10) : invNum;
      const orderLimNum = prodOrderLimit ? parseInt(prodOrderLimit, 10) : 5;

      const payload = {
        name: prodName,
        product_code: prodCode,
        description: prodDesc,
        mrp: mrpNum,
        price: priceNum,
        inventory: invNum,
        inventory_display_limit: dispNum,
        order_limit: orderLimNum,
        images: prodImages,
        image_url: prodImages[0] || null,
        is_active: true,
        published: true,
      };

      if (editingProductId) {
        const updated = await apiClient.patch<Product>(
          `/products/${editingProductId}`,
          payload,
          token || undefined
        );
        setProducts(products.map((p) => (p.id === editingProductId ? updated : p)));
      } else {
        const created = await apiClient.post<Product>(
          `/stores/${selectedStore.id}/products`,
          payload,
          token || undefined
        );
        setProducts([created, ...products]);
      }

      setIsProductModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save product.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Toggle Single Product Active / Inactive
  const handleToggleProductActive = async (p: Product) => {
    if (!token) return;
    try {
      const updated = await apiClient.patch<Product>(
        `/products/${p.id}`,
        { is_active: !p.is_active },
        token || undefined
      );
      setProducts(products.map((item) => (item.id === p.id ? updated : item)));
    } catch (err) {
      console.error("Toggle product active error:", err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!token || !confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${productId}`, token || undefined);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  // Save Inline Inventory Batch Changes
  const handleSaveInventoryBatch = async () => {
    if (!selectedStore || !token) return;
    setIsSavingInventory(true);
    try {
      const updates = Object.entries(inventoryEdits).map(([pId, val]) => ({
        product_id: pId,
        inventory: val.inventory,
        inventory_display_limit: val.display_limit,
        order_limit: val.order_limit,
      }));

      const res = await apiClient.patch<Product[]>(
        `/stores/${selectedStore.id}/inventory/batch`,
        { updates },
        token || undefined
      );
      setProducts(res);
      setInventorySavedToast(true);
      setTimeout(() => setInventorySavedToast(false), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to save inventory updates.");
    } finally {
      setIsSavingInventory(false);
    }
  };

  // Update Order Status (Fulfillment)
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    try {
      const updated = await apiClient.patch<Order>(
        `/orders/${orderId}/status`,
        { status },
        token || undefined
      );
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      console.error("Update order error:", err);
    }
  };

  // Generate / View Invoice Modal
  const handleGenerateInvoice = async (orderId: string) => {
    if (!token) return;
    try {
      const invoiceData = await apiClient.get<InvoiceData>(
        `/orders/${orderId}/invoice`,
        token || undefined
      );
      setActiveInvoice(invoiceData);
      setIsInvoiceOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to generate invoice.");
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !token) return;
    if (!newCouponCode || !newCouponValue) return;

    setIsSavingCoupon(true);
    try {
      const created = await apiClient.post<Coupon>(
        `/stores/${selectedStore.id}/coupons`,
        {
          code: newCouponCode.toUpperCase().trim(),
          discount_type: newCouponType,
          discount_value: parseFloat(newCouponValue),
          min_order_value: parseFloat(newCouponMinOrder) || 0,
          show_in_suggestions: newCouponSuggestion,
          is_active: true,
        },
        token || undefined
      );
      setCoupons([created, ...coupons]);
      setIsCouponModalOpen(false);
      setNewCouponCode("");
    } catch (err: any) {
      alert(err.message || "Failed to create coupon.");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  // Toggle Coupon Suggestion Pill
  const handleToggleCouponSuggestion = async (coupon: Coupon) => {
    if (!token) return;
    try {
      const updated = await apiClient.patch<Coupon>(
        `/coupons/${coupon.id}`,
        { show_in_suggestions: !coupon.show_in_suggestions },
        token || undefined
      );
      setCoupons(coupons.map((c) => (c.id === coupon.id ? updated : c)));
    } catch (err) {
      console.error("Toggle coupon error:", err);
    }
  };

  // Save Appearance & Theme Changes
  const handleSaveTheme = async () => {
    if (!selectedStore || !token) return;
    setIsSavingTheme(true);
    try {
      const updatedTheme: ThemeConfig = {
        archetype: themeArchetype,
        font_pairing: fontPairing,
        color_preset: colorPreset,
        enable_dark_mode_toggle: enableDarkModeToggle,
        hero_style: "centered",
      };

      const updated = await apiClient.patch<Store>(
        `/stores/${selectedStore.id}`,
        {
          theme_config: updatedTheme,
          currency: settingsCurrency,
          language: settingsLanguage,
          tagline: settingsTagline,
          description: settingsDescription,
        },
        token || undefined
      );
      setSelectedStore(updated);
      setActiveStore(updated);
      alert("Store appearance & brand tone saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save theme.");
    } finally {
      setIsSavingTheme(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Rocket className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">No Stores Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mt-2">
          You have not created a store yet. Launch your store in 5 minutes!
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

  const grossRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const storeCurrency = (selectedStore.currency || "USD") as StoreCurrency;
  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store/${selectedStore.slug}` : `/store/${selectedStore.slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. HERO WEBSITE HUB: Centerpiece Store Link & Active Switch */}
      <section className="relative border-b border-border/70 bg-gradient-to-b from-primary/5 via-card/40 to-background py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -right-20 -top-20 h-56 w-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left: Store Identity & Category */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl shadow-md">
                {selectedStore.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="font-extrabold text-2xl tracking-tight">
                    {selectedStore.name}
                  </h1>
                  <Badge
                    variant={selectedStore.is_active ? "default" : "secondary"}
                    className={`text-xs font-semibold px-2.5 py-0.5 ${
                      selectedStore.is_active
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedStore.is_active ? "Live & Active" : "Store Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedStore.category || "Custom Storefront"} • Currency:{" "}
                  <span className="font-semibold text-foreground">{selectedStore.currency}</span> •{" "}
                  <span className="font-semibold text-foreground">{products.length} Products</span>
                </p>
              </div>
            </div>

            {/* Center / Right: The Main Website Link & Active Toggle */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              {/* Active / Inactive Real-time Toggle */}
              <div className="flex items-center gap-3 bg-muted/60 px-4 py-2.5 rounded-xl border border-border/60">
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">Website Status</p>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedStore.is_active ? "Accepting Customer Orders" : "Storefront Paused"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleStoreActive}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    selectedStore.is_active ? "bg-emerald-600" : "bg-gray-400"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      selectedStore.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Central Website URL Pill */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 gap-2 font-mono text-xs border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary shadow-sm"
                  onClick={handleCopyLink}
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>Copied Store URL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Store Link</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  className="h-10 px-4 gap-2 font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link href={`/store/${selectedStore.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Live Store</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN DASHBOARD TABS */}
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-7 w-full max-w-4xl bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-1.5 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 text-xs font-semibold">
              <Package className="h-3.5 w-3.5" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-1.5 text-xs font-semibold">
              <Sliders className="h-3.5 w-3.5" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs font-semibold">
              <ShoppingBag className="h-3.5 w-3.5" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5 text-xs font-semibold">
              <Receipt className="h-3.5 w-3.5" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-1.5 text-xs font-semibold">
              <Tag className="h-3.5 w-3.5" />
              Coupons ({coupons.length})
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm border-border/80">
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
                    From {orders.length} placed customer orders
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Orders
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">{orders.length}</div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {orders.filter((o) => o.status === "completed").length} fulfilled
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Catalog
                  </CardTitle>
                  <Package className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {products.filter((p) => p.is_active).length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {products.length} total products listed
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Coupons
                  </CardTitle>
                  <Tag className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-foreground">
                    {coupons.filter((c) => c.is_active).length}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {coupons.filter((c) => c.show_in_suggestions).length} featured in suggestions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Appearance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/80">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Theme & Brand Appearance
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize your deterministic design tokens and dark mode settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">
                        Archetype
                      </span>
                      <p className="font-bold text-foreground capitalize">{themeArchetype}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold">
                        Color Palette
                      </span>
                      <p className="font-bold text-foreground capitalize">{colorPreset}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold gap-2"
                    onClick={() => setActiveTab("appearance")}
                  >
                    <Palette className="h-3.5 w-3.5" />
                    Customize Theme Matrix
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/80">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Recent Invoices & Orders
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generate printable customer invoices with one click.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-primary">{ord.order_number}</span>
                        <p className="text-[11px] text-muted-foreground">{ord.customer_name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{formatPrice(Number(ord.total_amount), storeCurrency)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] gap-1"
                          onClick={() => handleGenerateInvoice(ord.id)}
                        >
                          <FileText className="h-3 w-3" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No orders placed yet. Share your store link to start selling!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: PRODUCTS TABLE */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Product Catalog</h2>
                <p className="text-xs text-muted-foreground">
                  Manage products, upload up to 5 photos, set MRP vs Selling Price, and toggle status.
                </p>
              </div>
              <Button onClick={handleOpenAddProduct} className="gap-2 text-xs font-bold shadow-md">
                <Plus className="h-4 w-4" />
                Add New Product
              </Button>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Product ID</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4 text-center">Photos (Max 5)</th>
                      <th className="p-4">MRP</th>
                      <th className="p-4">Selling Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {products.map((product) => {
                      const allPhotos = product.images && product.images.length > 0
                        ? product.images
                        : product.image_url
                        ? [product.image_url]
                        : [];

                      return (
                        <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-primary">
                            {product.product_code || `PROD-${product.slug.slice(0, 6)}`}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-foreground">{product.name}</div>
                            {product.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-xs font-semibold px-2.5"
                              onClick={() => {
                                setGalleryProduct(product);
                                setActiveGalleryIndex(0);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              <span>{allPhotos.length} Photos</span>
                            </Button>
                          </td>
                          <td className="p-4 text-muted-foreground line-through">
                            {formatPrice(Number(product.mrp || product.price), storeCurrency)}
                          </td>
                          <td className="p-4 font-bold text-foreground">
                            {formatPrice(Number(product.price), storeCurrency)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`font-semibold ${
                                product.inventory > 0 ? "text-emerald-600" : "text-destructive"
                              }`}
                            >
                              {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleProductActive(product)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                product.is_active ? "bg-emerald-600" : "bg-gray-400"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  product.is_active ? "translate-x-4" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenEditProduct(product)}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          No products created yet. Click &quot;Add New Product&quot; to build your catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: INVENTORY TABLE (INLINE EDITABLE) */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Fast Inline Inventory Management</h2>
                <p className="text-xs text-muted-foreground">
                  Directly edit quantity in stock, display thresholds, and order limits with zero friction.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {inventorySavedToast && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Inventory Updated!
                  </span>
                )}
                <Button
                  onClick={handleSaveInventoryBatch}
                  disabled={isSavingInventory}
                  className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  {isSavingInventory ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Save All Inventory Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Product ID</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Quantity in Stock</th>
                      <th className="p-4">Quantity to Show (UI)</th>
                      <th className="p-4">Limit per Order</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {products.map((product) => {
                      const itemInv = inventoryEdits[product.id] || {
                        inventory: product.inventory,
                        display_limit: product.inventory_display_limit ?? product.inventory,
                        order_limit: product.order_limit ?? 5,
                      };

                      return (
                        <tr key={product.id} className="hover:bg-muted/20">
                          <td className="p-4 font-mono font-bold text-primary">
                            {product.product_code || `PROD-${product.slug.slice(0, 6)}`}
                          </td>
                          <td className="p-4 font-semibold text-foreground">
                            {product.name}
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              min="0"
                              value={itemInv.inventory}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setInventoryEdits((prev) => ({
                                  ...prev,
                                  [product.id]: { ...itemInv, inventory: val },
                                }));
                              }}
                              className="w-24 h-9 font-semibold text-xs"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              min="0"
                              value={itemInv.display_limit ?? itemInv.inventory}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setInventoryEdits((prev) => ({
                                  ...prev,
                                  [product.id]: { ...itemInv, display_limit: val },
                                }));
                              }}
                              className="w-24 h-9 text-xs"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              min="1"
                              value={itemInv.order_limit ?? 5}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                setInventoryEdits((prev) => ({
                                  ...prev,
                                  [product.id]: { ...itemInv, order_limit: val },
                                }));
                              }}
                              className="w-24 h-9 text-xs"
                            />
                          </td>
                          <td className="p-4 text-right font-medium">
                            <Badge
                              variant={itemInv.inventory > 0 ? "outline" : "destructive"}
                              className="text-[10px]"
                            >
                              {itemInv.inventory > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: ORDERS TABLE */}
          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Customer Orders & Fulfillment</h2>
              <p className="text-xs text-muted-foreground">
                Track incoming customer purchases, multi-product orders, customer delivery addresses, and payment methods.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Products Ordered</th>
                      <th className="p-4">Delivery Address</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20">
                        <td className="p-4 font-mono font-bold text-primary">
                          {order.order_number}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{order.customer_name}</div>
                          <p className="text-[11px] text-muted-foreground">{order.customer_email}</p>
                          {order.customer_phone && (
                            <p className="text-[10px] text-muted-foreground">{order.customer_phone}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="text-xs font-medium">
                                • {item.product_name} <span className="font-bold text-primary">× {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs text-muted-foreground text-[11px] leading-relaxed">
                          {order.shipping_address || "No address provided"}
                        </td>
                        <td className="p-4 font-black text-foreground text-sm">
                          {formatPrice(Number(order.total_amount), storeCurrency)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {order.payment_method === "COD" ? "💵 Cash on Delivery" : "💳 Online Paid"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold shadow-sm"
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="processing">📦 Processing</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-semibold"
                            onClick={() => handleGenerateInvoice(order.id)}
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            Invoice
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          No orders placed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: BILLING & INVOICES */}
          <TabsContent value="billing" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Billing & Financial Invoices</h2>
              <p className="text-xs text-muted-foreground">
                View financial transaction figures, gross revenue, discounts, and generate pre-defined printable customer invoices.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Order Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Gross Subtotal</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Net Total</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20">
                        <td className="p-4 font-mono font-bold text-primary">
                          {order.order_number}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-semibold text-foreground">
                          {order.customer_name}
                        </td>
                        <td className="p-4 font-medium">
                          {formatPrice(Number(order.subtotal_amount), storeCurrency)}
                        </td>
                        <td className="p-4 text-emerald-600 font-semibold">
                          {Number(order.discount_amount) > 0
                            ? `-${formatPrice(Number(order.discount_amount), storeCurrency)}`
                            : "—"}
                        </td>
                        <td className="p-4 font-black text-foreground">
                          {formatPrice(Number(order.total_amount), storeCurrency)}
                        </td>
                        <td className="p-4 font-medium">
                          {order.payment_method === "COD" ? "Cash on Delivery" : "Online Gateway"}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-bold shadow-sm"
                            onClick={() => handleGenerateInvoice(order.id)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Invoice
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 6: COUPONS MANAGER */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Discount Coupons & Promo Codes</h2>
                <p className="text-xs text-muted-foreground">
                  Create promo codes and select which coupons are featured as one-click pills in customer checkout.
                </p>
              </div>
              <Button
                onClick={() => setIsCouponModalOpen(true)}
                className="gap-2 text-xs font-bold shadow-md"
              >
                <Plus className="h-4 w-4" />
                Create Coupon Code
              </Button>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Min. Order Value</th>
                      <th className="p-4">Usage Count</th>
                      <th className="p-4 text-center">Show in Checkout Suggestions</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-muted/20">
                        <td className="p-4 font-mono font-bold text-primary text-sm">
                          {coupon.code}
                        </td>
                        <td className="p-4 font-semibold text-foreground">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% OFF`
                            : `${formatPrice(Number(coupon.discount_value), storeCurrency)} Flat`}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {coupon.min_order_value
                            ? formatPrice(Number(coupon.min_order_value), storeCurrency)
                            : "None"}
                        </td>
                        <td className="p-4 font-mono font-semibold">
                          {coupon.usage_count} times
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCouponSuggestion(coupon)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                              coupon.show_in_suggestions ? "bg-primary" : "bg-gray-400"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                coupon.show_in_suggestions ? "translate-x-4" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="p-4 text-right font-semibold">
                          <Badge variant={coupon.is_active ? "default" : "secondary"}>
                            {coupon.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No coupons created yet. Click &quot;Create Coupon Code&quot; to add your first discount promo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 7: APPEARANCE & BRAND TONE CUSTOMIZER */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">Storefront Appearance & Brand Tone</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize your luxury e-commerce layout, typography, color palette, and copy in one place.
                </p>
              </div>

              {/* 1. Style Archetype Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Brand Style Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      id: "editorial",
                      name: "Editorial Luxury",
                      desc: "Layla inspired: High-end luxury magazine aesthetic, serif accents & rich storytelling cards.",
                    },
                    {
                      id: "bold",
                      name: "Streetwear Bold",
                      desc: "Veirdo inspired: High-energy contrast, punchy badges, sharp borders & modern streetwear vibe.",
                    },
                    {
                      id: "warm",
                      name: "Warm Organic",
                      desc: "Atomishine inspired: Ambient terracotta surfaces, gentle rounded curves & artisanal warmth.",
                    },
                    {
                      id: "minimal",
                      name: "Minimal Clean",
                      desc: "Clean monochrome whitespace, borderless product cards & ultra-modern sleekness.",
                    },
                  ].map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setThemeArchetype(arch.id as ThemeArchetype)}
                      className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                        themeArchetype === arch.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border/60 hover:border-foreground/40 bg-background"
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{arch.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{arch.desc}</p>
                      </div>
                      {themeArchetype === arch.id && (
                        <Badge className="mt-3 w-fit text-[10px] uppercase font-bold">Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Font Pairing & Typography */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Typography & Font Pairing
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "serif", name: "Editorial Serif (Playfair)" },
                    { id: "sans", name: "Modern Sans (Inter)" },
                    { id: "mono", name: "Technical Mono (JetBrains)" },
                    { id: "rounded", name: "Warm Rounded (Outfit)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontPairing(f.id as FontPairing)}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        fontPairing === f.id
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 hover:bg-muted text-foreground"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Color Palette Presets */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Accent Color Palette
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { id: "slate", name: "Midnight Slate", color: "bg-slate-900" },
                    { id: "rose", name: "Velvet Rose", color: "bg-rose-600" },
                    { id: "amber", name: "Warm Terracotta", color: "bg-amber-600" },
                    { id: "emerald", name: "Forest Emerald", color: "bg-emerald-600" },
                    { id: "indigo", name: "Royal Indigo", color: "bg-indigo-600" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorPreset(c.id as ColorPreset)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                        colorPreset === c.id
                          ? "border-primary ring-2 ring-primary/30 bg-muted/60"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                    >
                      <span className={`h-3.5 w-3.5 rounded-full ${c.color}`} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Brand Copy & Ticker Content */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  4. Storefront Copy & Announcement
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Hero Tagline / Slogan</label>
                    <Input
                      value={settingsTagline}
                      onChange={(e) => setSettingsTagline(e.target.value)}
                      placeholder="e.g. An Olfactory Sanctuary for Every Space."
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Store Currency</label>
                    <select
                      value={settingsCurrency}
                      onChange={(e) => setSettingsCurrency(e.target.value as StoreCurrency)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Story / Description</label>
                  <textarea
                    rows={3}
                    value={settingsDescription}
                    onChange={(e) => setSettingsDescription(e.target.value)}
                    placeholder="Welcome to our store. We create exceptional handcrafted items..."
                    className="w-full p-3 rounded-lg border border-border bg-background text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* 5. Save Action Button */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="darkToggle"
                    checked={enableDarkModeToggle}
                    onChange={(e) => setEnableDarkModeToggle(e.target.checked)}
                    className="rounded border-border h-4 w-4 text-primary focus:ring-primary"
                  />
                  <label htmlFor="darkToggle" className="text-xs font-medium text-muted-foreground">
                    Enable visitor dark mode toggle switch
                  </label>
                </div>

                <Button
                  onClick={handleSaveTheme}
                  disabled={isSavingTheme}
                  className="gap-2 h-11 px-6 font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSavingTheme ? "Saving..." : "Save Appearance & Sync Store"}</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: PHOTO GALLERY MODAL (👁️ Eye Icon) */}
      {/* ========================================================================= */}
      <Dialog open={!!galleryProduct} onOpenChange={() => setGalleryProduct(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <span>{galleryProduct?.name} — Photo Gallery</span>
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {galleryProduct?.product_code}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Browsing all high-resolution photos for this product (Max 5 photos).
            </DialogDescription>
          </DialogHeader>

          {galleryProduct && (
            <div className="space-y-4 pt-2">
              {/* Main Full-size Zoom Photo */}
              <div className="aspect-video w-full rounded-2xl bg-muted/40 overflow-hidden border border-border flex items-center justify-center relative">
                {galleryProduct.images && galleryProduct.images.length > 0 ? (
                  <img
                    src={galleryProduct.images[activeGalleryIndex] || galleryProduct.images[0]}
                    alt={galleryProduct.name}
                    className="h-full w-full object-contain"
                  />
                ) : galleryProduct.image_url ? (
                  <img
                    src={galleryProduct.image_url}
                    alt={galleryProduct.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground text-xs font-semibold flex flex-col items-center gap-2">
                    <ImageIcon className="h-10 w-10 stroke-1" />
                    <span>No photos uploaded for this product</span>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {galleryProduct.images && galleryProduct.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`h-16 w-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        activeGalleryIndex === idx
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT PRODUCT DRAWER */}
      {/* ========================================================================= */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingProductId ? "Edit Product" : "Add Product to Store"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload up to 5 photos to Vercel Blob CDN, set MRP vs. Selling Price, and manage stock limits.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Product ID / Code</Label>
                <Input
                  value={prodCode}
                  onChange={(e) => setProdCode(e.target.value)}
                  placeholder="e.g. PROD-001"
                  className="h-10 text-xs font-mono"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-semibold">Product Name *</Label>
                <Input
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Lavender Soy Candle"
                  className="h-10 text-xs font-semibold"
                  required
                />
              </div>
            </div>

            {/* Description + AI Copywriter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAICopy}
                  disabled={isGeneratingAICopy}
                  className="h-7 text-[11px] gap-1 text-primary border-primary/30"
                >
                  {isGeneratingAICopy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                  Write it for me (AI)
                </Button>
              </div>
              <textarea
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Artisanal organic soy candle poured with pure botanical essential oils..."
                className="w-full min-h-[70px] rounded-md border border-input bg-background p-2.5 text-xs"
              />
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">MRP (Original)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={prodMRP}
                  onChange={(e) => setProdMRP(e.target.value)}
                  placeholder="25.00"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Selling Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="19.99"
                  className="h-9 text-xs font-bold text-primary"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Stock Quantity</Label>
                <Input
                  type="number"
                  value={prodInventory}
                  onChange={(e) => setProdInventory(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Order Limit</Label>
                <Input
                  type="number"
                  value={prodOrderLimit}
                  onChange={(e) => setProdOrderLimit(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Photos (Max 5 via Vercel Blob / URL) */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  Product Photos ({prodImages.length}/5)
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  Stored on Vercel Blob Edge CDN
                </span>
              </div>

              {/* Upload Input & Paste URL */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-full sm:w-auto h-9 px-4 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center gap-2 text-xs font-bold cursor-pointer shadow-sm">
                  {isUploadingBlob ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>Upload File to Vercel Blob</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBlobFileUpload}
                    className="hidden"
                    disabled={isUploadingBlob || prodImages.length >= 5}
                  />
                </label>

                <div className="flex items-center gap-1.5 w-full sm:flex-1">
                  <Input
                    placeholder="Or paste image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImageUrl}
                    className="h-9 text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Thumbnails preview */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {prodImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl border overflow-hidden bg-muted/30 group"
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isSavingProduct}
                className="w-full font-bold gap-2 bg-primary text-primary-foreground shadow-md"
              >
                {isSavingProduct ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Product...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingProductId ? "Update Product" : "Create Product"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: INVOICE GENERATOR MODAL (PRINTABLE PDF-READY) */}
      {/* ========================================================================= */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">Customer Invoice</DialogTitle>
              <DialogDescription className="text-xs">
                Official transaction receipt generated for {activeInvoice?.order.order_number}
              </DialogDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-semibold mr-6"
              onClick={() => window.print()}
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          </DialogHeader>

          {activeInvoice && (
            <div className="space-y-6 pt-4 border rounded-2xl p-6 bg-card text-foreground print:border-none">
              {/* Invoice Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-black text-xl text-primary">{activeInvoice.store.name}</h3>
                  <p className="text-xs text-muted-foreground">{activeInvoice.store.tagline || activeInvoice.store.category}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2.5 py-1 rounded">
                    {activeInvoice.invoice_number}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Date: {new Date(activeInvoice.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer & Payment Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">Billed To:</p>
                  <p className="font-bold text-foreground mt-0.5">{activeInvoice.order.customer_name}</p>
                  <p className="text-muted-foreground">{activeInvoice.order.customer_email}</p>
                  <p className="text-muted-foreground mt-1">{activeInvoice.order.shipping_address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">Payment Details:</p>
                  <p className="font-bold text-foreground mt-0.5">
                    {activeInvoice.order.payment_method === "COD" ? "Cash on Delivery" : "Online Gateway"}
                  </p>
                  <p className="text-emerald-600 font-semibold">Payment Status: {activeInvoice.order.payment_status.toUpperCase()}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground font-bold border-b">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeInvoice.order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold">{item.product_name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatPrice(Number(item.unit_price), storeCurrency)}</td>
                        <td className="p-3 text-right font-bold">{formatPrice(Number(item.subtotal), storeCurrency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2 text-xs">
                <div className="w-48 space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatPrice(Number(activeInvoice.order.subtotal_amount), storeCurrency)}</span>
                  </div>
                  {Number(activeInvoice.order.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount ({activeInvoice.order.coupon_code}):</span>
                      <span>-{formatPrice(Number(activeInvoice.order.discount_amount), storeCurrency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-2 border-t text-foreground">
                    <span>Grand Total:</span>
                    <span>{formatPrice(Number(activeInvoice.order.total_amount), storeCurrency)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t text-[10px] text-muted-foreground">
                Thank you for shopping with {activeInvoice.store.name} • Powered by SimpleStore
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE COUPON MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Discount Coupon</DialogTitle>
            <DialogDescription className="text-xs">
              Add a promo code and choose whether it shows up as an instant pill in customer checkout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Coupon Code *</Label>
              <Input
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10, CANDLE20"
                className="h-10 font-mono font-bold uppercase text-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Discount Type</Label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as DiscountType)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ({selectedStore.currency})</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Discount Value *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(e.target.value)}
                  className="h-10 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Minimum Order Value</Label>
              <Input
                type="number"
                step="0.01"
                value={newCouponMinOrder}
                onChange={(e) => setNewCouponMinOrder(e.target.value)}
                placeholder="0.00"
                className="h-10 text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
              <div>
                <p className="text-xs font-bold">Show in Checkout Suggestions</p>
                <p className="text-[10px] text-muted-foreground">
                  Display as a clickable pill in the shopper checkout drawer
                </p>
              </div>
              <input
                type="checkbox"
                checked={newCouponSuggestion}
                onChange={(e) => setNewCouponSuggestion(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSavingCoupon}
                className="w-full font-bold gap-2 bg-primary text-primary-foreground shadow-md"
              >
                {isSavingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Tag className="h-4 w-4" />
                )}
                Save Coupon Code
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
