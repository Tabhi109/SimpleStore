"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Store, Product } from "@simplestore/shared-types";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface PublicStoreResponse extends Store {
  products: Product[];
}

export default function PublicStorePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [storeData, setStoreData] = useState<PublicStoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function fetchStore() {
      try {
        setIsLoading(true);
        const data = await apiClient.get<PublicStoreResponse>(`/stores/${slug}`);
        setStoreData(data);
      } catch (err: any) {
        setError(err?.message || "Store not found or unpublished.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStore();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6 container mx-auto max-w-5xl">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Store Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mt-2">
          {error || "The store you are looking for does not exist or has not been published yet."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <StorefrontView
      store={storeData}
      products={storeData.products || []}
      overrideTheme={storeData.theme_config}
    />
  );
}
