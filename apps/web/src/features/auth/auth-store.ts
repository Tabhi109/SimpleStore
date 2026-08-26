"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

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
        const state = get();
        return !!state.token && !!state.user && !state.user.email?.endsWith("@simplestore.demo");
      },
    }),
    {
      name: "simplestore_auth_storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.email?.endsWith("@simplestore.demo")) {
          state.logout();
        }
      },
    }
  )
);
