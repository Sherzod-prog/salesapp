"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Product {
  id: string;
  name: string;
  sellPrice: string;
  unit: string;
}

export default function Home() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Product[]>("/products", { token })
      .then(setProducts)
      .catch((err) => setFetchError(err instanceof Error ? err.message : "Xatolik"));
  }, [token]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-zinc-50 px-4 py-16 dark:bg-black">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Xush kelibsiz, {user.fullName}</CardTitle>
            <CardDescription>
              {user.email} · {user.role}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={logout}>
            Chiqish
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Backend bilan ulanish holati
          </p>
          {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
          {!fetchError && products === null && <p className="text-sm">Yuklanmoqda...</p>}
          {!fetchError && products !== null && (
            <p className="text-sm">
              ✅ Backend bilan bog'landi — omborda <strong>{products.length}</strong> ta mahsulot topildi.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
