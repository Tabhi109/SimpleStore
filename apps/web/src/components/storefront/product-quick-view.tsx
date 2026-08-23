"use client";

import React, { useState, useEffect } from "react";
import { Check, Flame, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
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
import { useWishlistStore } from "@/features/wishlist/wishlist-store";
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
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setActiveImageIdx(0);
      setAdded(false);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isOutOfStock = product.inventory <= 0;
  const inWishlist = isInWishlist(product.id);

  // Collect all photos
  const allImages: string[] = [];
  if (product.image_url) allImages.push(product.image_url);
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }
  if (allImages.length === 0) {
    allImages.push("https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600");
  }

  const currentImage = allImages[activeImageIdx] || allImages[0];

  const priceNum = Number(product.price);
  const mrpNum = Number(product.mrp || (priceNum * 1.25).toFixed(2));
  const discountPercent = mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[760px] p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl bg-card">
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Showcase + Gallery Thumbnails */}
          <div className="md:col-span-6 bg-muted/20 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-border/60">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-background shadow-inner flex items-center justify-center">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-6">
                  <ShoppingBag className="h-16 w-16 stroke-1 mb-2 opacity-50" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Product Image
                  </span>
                </div>
              )}

              {/* Discount / AI Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {discountPercent > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 shadow-sm">
                    {discountPercent}% OFF
                  </Badge>
                )}
                {product.is_ai_generated && (
                  <Badge variant="outline" className="gap-1 bg-background/90 backdrop-blur-sm text-[10px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    AI Designed
                  </Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle wishlist"
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                  inWishlist
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-background/80 text-foreground hover:bg-background hover:text-rose-500"
                }`}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Navigation Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto w-full pb-1 px-1 justify-center">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative h-14 w-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIdx === idx
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-border/60 hover:border-foreground/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <DialogHeader className="text-left space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  <span>{product.product_code || "SKU-PROD"}</span>
                  <span>Pan-India Dispatch</span>
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-snug">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              {/* Price & Savings Row */}
              <div className="flex items-baseline gap-3 pt-1 border-b border-border/50 pb-3">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {formatPrice(priceNum, currency)}
                </span>
                {mrpNum > priceNum && (
                  <span className="text-sm font-medium text-muted-foreground line-through">
                    {formatPrice(mrpNum, currency)}
                  </span>
                )}
                {isOutOfStock ? (
                  <Badge variant="outline" className="text-destructive border-destructive/40 text-xs ml-auto">
                    {t.outOfStock}
                  </Badge>
                ) : product.inventory < 5 ? (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-xs font-semibold ml-auto">
                    {t.onlyLeft.replace("{count}", String(product.inventory))}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 text-xs font-semibold ml-auto">
                    {t.inStock}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description || "Crafted with pure organic botanical soy wax and fine perfumery notes, designed to elevate your everyday living."}
              </p>

              {/* Key Trust Highlights */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-medium text-foreground">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>55-60 Hrs Clean Burn</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>100% Non-Toxic Soy</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add-to-Cart Action */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </span>
                  <div className="flex items-center rounded-lg border border-border bg-background shadow-xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-lg"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.inventory, q + 1))}
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-r-lg"
                      disabled={quantity >= product.inventory}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 font-bold text-sm gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    Added to Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    {isOutOfStock ? t.outOfStock : `${t.addToCart} • ${formatPrice(priceNum * quantity, currency)}`}
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
