"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Tag, Trash2, X } from "lucide-react";
import { StoreCurrency, StoreLanguage } from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/features/cart/cart-store";
import { apiClient } from "@/lib/api-client";
import { formatPrice, TRANSLATIONS } from "@/lib/theme-utils";

interface SuggestedCoupon {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value?: number | null;
}

interface CartDrawerProps {
  storeId: string;
  currency: StoreCurrency;
  language: StoreLanguage;
  onOpenCheckout: () => void;
}

export function CartDrawer({
  storeId,
  currency,
  language,
  onOpenCheckout,
}: CartDrawerProps) {
  const {
    items,
    isOpen,
    couponCode,
    discountAmount,
    setIsOpen,
    updateQuantity,
    removeItem,
    setCoupon,
    getSubtotal,
    getTotal,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [suggestedCoupons, setSuggestedCoupons] = useState<SuggestedCoupon[]>([]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const subtotal = getSubtotal();
  const total = getTotal();

  // Fetch suggested coupon pills
  useEffect(() => {
    if (!isOpen || !storeId) return;

    async function loadSuggestions() {
      try {
        const data = await apiClient.get<SuggestedCoupon[]>(
          `/stores/${storeId}/coupons/suggestions`
        );
        setSuggestedCoupons(data || []);
      } catch {
        // ignore
      }
    }
    loadSuggestions();
  }, [isOpen, storeId]);

  const applyCouponCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await apiClient.post<{
        valid: boolean;
        discount_amount: number;
        final_total: number;
        message: string;
      }>(`/stores/${storeId}/coupons/validate`, {
        code: codeToApply.trim(),
        cart_total: subtotal,
      });

      if (res.valid) {
        setCoupon(codeToApply.trim().toUpperCase(), res.discount_amount);
        setCouponSuccess(res.message || "Coupon applied!");
        setInputCoupon("");
      } else {
        setCouponError(res.message || "Invalid coupon code.");
        setCoupon(null, 0);
      }
    } catch {
      setCouponError("Could not validate coupon.");
      setCoupon(null, 0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null, 0);
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-background p-6 shadow-2xl border-l border-border transition-transform animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t.cart}</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Item List */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">{t.cartEmpty}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              {t.continueShopping}
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-4 rounded-lg border border-border/60 p-3 bg-card"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "PROD"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatPrice(item.unit_price, currency)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted text-muted-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-semibold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted text-muted-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            {/* Coupon Code Section */}
            <div className="space-y-2">
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Applied: {couponCode} (-{formatPrice(discountAmount, currency)})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-muted-foreground hover:text-foreground text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.couponPlaceholder}
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0 text-xs font-semibold"
                      onClick={() => applyCouponCode(inputCoupon)}
                      disabled={isValidatingCoupon || !inputCoupon.trim()}
                    >
                      {isValidatingCoupon ? "..." : t.applyCoupon}
                    </Button>
                  </div>

                  {/* Featured One-Click Coupon Suggestion Pills */}
                  {suggestedCoupons.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Available Promo Offers:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedCoupons.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => applyCouponCode(c.code)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-all"
                          >
                            <span>{c.code}</span>
                            <span className="text-[9px] font-sans opacity-80">
                              ({c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `FLAT`})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {couponError && (
                <p className="text-xs text-destructive mt-1">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-xs text-emerald-600 mt-1">{couponSuccess}</p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t.subtotal}</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>{t.discount}</span>
                  <span>-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-border/40">
                <span>{t.total}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              className="w-full h-11 gap-2 font-semibold shadow-md"
              onClick={() => {
                setIsOpen(false);
                onOpenCheckout();
              }}
            >
              <span>{t.checkout}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
