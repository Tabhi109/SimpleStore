"use client";

import React from "react";
import { CheckCircle2, PackageCheck, Printer } from "lucide-react";
import { Order, StoreCurrency, StoreLanguage } from "@simplestore/shared-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice, TRANSLATIONS } from "@/lib/theme-utils";

interface OrderConfirmationModalProps {
  order: Order | null;
  currency: StoreCurrency;
  language: StoreLanguage;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderConfirmationModal({
  order,
  currency,
  language,
  isOpen,
  onClose,
}: OrderConfirmationModalProps) {
  if (!order) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader className="text-center sm:text-center items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold">{t.orderPlaced}</DialogTitle>
          <DialogDescription>{t.thankYou}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Order Details Card */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div>
                <p className="text-muted-foreground">{t.orderNumber}</p>
                <p className="font-mono font-bold text-sm text-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">{t.orderStatus}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <PackageCheck className="h-3 w-3" />
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
              <div>
                <span className="font-semibold text-foreground">Customer: </span>
                {order.customer_name}
              </div>
              <div>
                <span className="font-semibold text-foreground">Email: </span>
                {order.customer_email}
              </div>
              {order.shipping_address && (
                <div className="col-span-2">
                  <span className="font-semibold text-foreground">Ship To: </span>
                  {order.shipping_address}
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            {order.items && order.items.length > 0 && (
              <div className="pt-2 border-t border-border/60 space-y-1.5">
                <p className="font-semibold text-foreground">Purchased Items:</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatPrice(Number(item.subtotal), currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="pt-2 border-t border-border/60 space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>{t.subtotal}</span>
                <span>{formatPrice(Number(order.subtotal_amount), currency)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>{t.discount} {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                  <span>-{formatPrice(Number(order.discount_amount), currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-foreground pt-1">
                <span>{t.total} Paid</span>
                <span>{formatPrice(Number(order.total_amount), currency)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button className="flex-1" onClick={onClose}>
              {t.continueShopping}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
