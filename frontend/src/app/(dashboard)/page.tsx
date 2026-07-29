"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Product {
  id: string;
  name: string;
  sellPrice: string;
  unit: string;
}

export default function DashboardHome() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Product[]>("/products", { token })
      .then(setProducts)
      .catch((err) => setFetchError(err instanceof Error ? err.message : "Xatolik"));
  }, [token]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Xush kelibsiz, {user?.fullName}</CardTitle>
          <CardDescription>Backend bilan ulanish holati</CardDescription>
        </CardHeader>
        <CardContent>
          {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
          {!fetchError && products === null && <p className="text-sm">Yuklanmoqda...</p>}
          {!fetchError && products !== null && (
            <p className="text-sm">
              ✅ Backend bilan bog&apos;landi — omborda <strong>{products.length}</strong> ta mahsulot topildi.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
