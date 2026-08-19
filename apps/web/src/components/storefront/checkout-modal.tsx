"use client";

import React, { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Order, StoreCurrency, StoreLanguage } from "@simplestore/shared-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/features/cart/cart-store";
import { apiClient } from "@/lib/api-client";
import { formatPrice, TRANSLATIONS } from "@/lib/theme-utils";

interface CheckoutModalProps {
  storeId: string;
  currency: StoreCurrency;
  language: StoreLanguage;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export function CheckoutModal({
  storeId,
  currency,
  language,
  isOpen,
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const { items, couponCode, discountAmount, getSubtotal, getTotal, clearCart } =
    useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const subtotal = getSubtotal();
  const total = getTotal();

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setErrorMessage("Please provide your name and email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        shipping_address: shippingAddress || null,
        coupon_code: couponCode || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await apiClient.post<Order>(
        `/stores/${storeId}/orders`,
        orderPayload
      );

      clearCart();
      onClose();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to place order. Please check inventory or try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="h-5 w-5 text-primary" />
            {t.checkout}
          </DialogTitle>
          <DialogDescription>
            {t.demoPaymentNotice}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Shipping City / Country</Label>
                <Input
                  id="address"
                  placeholder="New York, USA"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Order Summary Snapshot */}
          <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-muted-foreground">
              <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Coupon ({couponCode})</span>
                <span>-{formatPrice(discountAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-border/60 text-foreground">
              <span>{t.total} Due</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Instant Demo Confirmation (No card required)</span>
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold gap-2"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Order...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t.placeOrder}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
