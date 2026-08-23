"use client";

import React, { useState } from "react";
import { CheckCircle2, CreditCard, DollarSign, Loader2, Lock, ShieldCheck, Truck } from "lucide-react";
import { Order, PaymentMethod, StoreCurrency, StoreLanguage } from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
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
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const subtotal = getSubtotal();
  const total = getTotal();

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !streetAddress || !city) {
      setErrorMessage("Please fill in your name, email, and full delivery address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const fullAddress = `${streetAddress}, ${city} ${postalCode}`.trim();

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        shipping_address: fullAddress,
        coupon_code: couponCode || null,
        payment_method: paymentMethod,
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
        err?.message || "Failed to place order. Please check item inventory or try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Truck className="h-5 w-5 text-primary" />
            Complete Your Order
          </DialogTitle>
          <DialogDescription className="text-xs">
            Enter your shipping delivery details and confirm Cash on Delivery payment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Customer Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Customer Profile
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Alice Customer"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alice@example.com"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Shipping Delivery Address
            </h4>
            <div className="space-y-1">
              <Label htmlFor="street" className="text-xs font-semibold">Street Address *</Label>
              <Input
                id="street"
                placeholder="124 Olive St, Apt 4B"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="city" className="text-xs font-semibold">City *</Label>
                <Input
                  id="city"
                  placeholder="Seattle"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="zip" className="text-xs font-semibold">Postal / ZIP Code</Label>
                <Input
                  id="zip"
                  placeholder="98101"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Payment Method
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: COD (Active) */}
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === "COD"
                    ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Cash on Delivery (COD)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Pay with cash when items are delivered
                  </p>
                </div>
              </button>

              {/* Option 2: Online Payment (Disabled) */}
              <div className="p-3 rounded-xl border border-dashed border-border/70 opacity-60 bg-muted/20 flex items-start gap-3 cursor-not-allowed relative">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-muted-foreground">Online Payment</p>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Card & UPI gateway integration
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Total Snapshot */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground font-medium">
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
              <span>Total Amount to Pay on Delivery</span>
              <span className="text-base text-primary">{formatPrice(total, currency)}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-bold gap-2 bg-primary text-primary-foreground shadow-md text-sm"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Your Order...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Place COD Order
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
