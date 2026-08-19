"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Store, User } from "@simplestore/shared-types";

interface AuthState {
  user: User | null;
  token: string | null;
  activeStore: Store | null;
  
  setAuth: (user: User, token: string) => void;
  setActiveStore: (store: Store | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeStore: null,

      setAuth: (user: User, token: string) => {
        set({ user, token });
      },

      setActiveStore: (activeStore: Store | null) => {
        set({ activeStore });
      },

      logout: () => {
        set({ user: null, token: null, activeStore: null });
      },

      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: "simplestore_auth_storage",
    }
  )
);
