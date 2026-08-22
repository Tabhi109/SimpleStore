"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Code, ExternalLink, Github, Heart, Layers, ShieldCheck, Sparkles, Store } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isStorefront = pathname?.startsWith("/store/");
  if (isStorefront) return null;
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm text-xs text-muted-foreground pt-12 pb-8 safe-bottom transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-border/40">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-foreground text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-foreground">SimpleStore</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              &quot;Your store. Without the complexity.&quot; A high-craft modular monolith e-commerce platform demonstrating deterministic design token matrices, AI copy generation, and ACID transactions.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Full Monolith Stack Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/onboarding" className="hover:text-foreground transition-colors">
                  5-Minute Setup Wizard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Merchant Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-foreground transition-colors">
                  Merchant Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Engineering Architecture */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  FastAPI OpenAPI Specs
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/api/v1/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Deep Health Diagnostics
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </li>
              <li className="text-muted-foreground/80">PostgreSQL 16 • Redis 7</li>
              <li className="text-muted-foreground/80">Deterministic Design Matrix</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} SimpleStore. Built with Next.js 14, Tailwind CSS, FastAPI, and Playwright.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              ACID Transactions
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              AI Copywriter
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
