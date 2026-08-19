"use client";

import Link from "next/link";
import { Store, Sparkles, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            SimpleStore
          </span>
          <Badge variant="outline" className="ml-1 text-[10px] uppercase font-semibold tracking-wider">
            Portfolio
          </Badge>
        </Link>

        <nav className="flex items-center gap-4">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            API Docs
          </a>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/onboarding">
              Launch Store
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
