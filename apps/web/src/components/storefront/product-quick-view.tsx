"use client";

import React, { useState } from "react";
import { Check, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Product, StoreCurrency, StoreLanguage } from "@simplestore/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPrice, TRANSLATIONS } from "@/lib/theme-utils";

interface ProductQuickViewProps {
  product: Product | null;
  currency: StoreCurrency;
  language: StoreLanguage;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({
  product,
  currency,
  language,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isOutOfStock = product.inventory <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square sm:aspect-auto bg-muted/40 flex items-center justify-center p-8">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-16 w-16 stroke-1 mb-2" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Product Image
                </span>
              </div>
            )}

            {product.is_ai_generated && (
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="gap-1 bg-background/80 backdrop-blur-sm text-xs font-medium">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  AI Crafted
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-xl font-bold">
                {product.name}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-foreground">
                  {formatPrice(Number(product.price), currency)}
                </span>
                {isOutOfStock ? (
                  <Badge variant="outline" className="text-destructive border-destructive/40">
                    {t.outOfStock}
                  </Badge>
                ) : product.inventory < 5 ? (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/40">
                    {t.onlyLeft.replace("{count}", String(product.inventory))}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/40">
                    {t.inStock}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || "Crafted with the highest quality standards for your everyday lifestyle."}
            </p>

            {/* Quantity Selector & Action */}
            <div className="space-y-3 pt-2">
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Quantity:
                  </span>
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-muted-foreground hover:bg-muted"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.inventory, q + 1))
                      }
                      className="px-2.5 py-1 text-muted-foreground hover:bg-muted"
                      disabled={quantity >= product.inventory}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-11 font-semibold gap-2"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    {isOutOfStock ? t.outOfStock : t.addToCart}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
