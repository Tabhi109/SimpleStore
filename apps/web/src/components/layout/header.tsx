"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Code2,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Sparkles,
  Store,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/features/auth/auth-store";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isStorefront = pathname?.startsWith("/store/");
  if (isStorefront) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 transition-colors">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
              <Store className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-tight tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                SimpleStore
              </span>
            </div>
          </Link>
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-primary/30 bg-primary/5 text-primary rounded-full"
          >
            Portfolio
          </Badge>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-medium">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-amber-500" />
            <span>API Docs</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>

          <Link
            href="/dashboard"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              pathname === "/dashboard"
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/60">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[11px] font-medium text-foreground truncate max-w-[140px]">
                  {user.email}
                </span>
                <span className="text-[9px] text-emerald-500 font-semibold uppercase">
                  Logged In
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold h-8"
              asChild
            >
              <Link href="/auth/login">
                <User className="h-3.5 w-3.5 mr-1" />
                Merchant Login
              </Link>
            </Button>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Primary CTA */}
          <Button
            size="sm"
            className="gap-1.5 text-xs font-bold h-9 px-3.5 shadow-sm shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <Link href="/onboarding">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Store</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </Button>
        </nav>

        {/* Mobile Menu & Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <Store className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Merchant Dashboard
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Code2 className="h-4 w-4 text-amber-500" />
              FastAPI Interactive Docs
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </a>
          </div>

          <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="h-8 text-xs text-destructive gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center h-10 font-semibold text-xs"
                asChild
              >
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-3.5 w-3.5 mr-2" />
                  Merchant Login
                </Link>
              </Button>
            )}

            <Button
              size="sm"
              className="w-full justify-center h-11 font-bold text-sm gap-2 shadow-md"
              asChild
            >
              <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                <Rocket className="h-4 w-4" />
                Start 5-Minute Setup Free
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
