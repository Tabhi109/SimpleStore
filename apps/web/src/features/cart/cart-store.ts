"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CartItem, Product, StoreCurrency } from "@simplestore/shared-types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
  currency: StoreCurrency;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCoupon: (code: string | null, discount?: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setCurrency: (currency: StoreCurrency) => void;

  // Computed
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discountAmount: 0,
      currency: "USD",

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product_id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product_id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                product_id: product.id,
                product_name: product.name,
                unit_price: Number(product.price),
                quantity,
                image_url: product.image_url,
                currency: product.currency,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      setCoupon: (code: string | null, discount = 0) => {
        set({ couponCode: code, discountAmount: discount });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discountAmount: 0 });
      },

      setIsOpen: (isOpen: boolean) => {
        set({ isOpen });
      },

      setCurrency: (currency: StoreCurrency) => {
        set({ currency });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        );
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const total = subtotal - get().discountAmount;
        return Math.max(0, total);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "simplestore_cart_storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
    }
  )
);
