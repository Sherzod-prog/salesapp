"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatMoney, formatQuantity } from "@/lib/format";
import type { InventoryItem } from "@/lib/types";
import { toast } from "sonner";

export default function InventoryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  function load(lowStockOnly: boolean) {
    if (!token) return;
    setItems(null);
    apiFetch<InventoryItem[]>(lowStockOnly ? "/inventory/low-stock" : "/inventory", { token })
      .then(setItems)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(() => {
    load(onlyLowStock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, onlyLowStock]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ombor qoldig&apos;i</CardTitle>
            <CardDescription>Mahsulotlarning joriy ombor holati</CardDescription>
          </div>
          <Button variant={onlyLowStock ? "default" : "outline"} onClick={() => setOnlyLowStock((v) => !v)}>
            {onlyLowStock ? "Barchasini ko'rsatish" : "Kam qolganlar"}
          </Button>
        </CardHeader>
        <CardContent>
          {items === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Qoldiq</TableHead>
                  <TableHead>O&apos;rtacha tannarx</TableHead>
                  <TableHead>Sotuv narxi</TableHead>
                  <TableHead>Min. qoldiq</TableHead>
                  <TableHead>Holati</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-zinc-500">
                      Ma&apos;lumot topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      {item.name}
                      {item.sku && <span className="ml-2 text-xs text-zinc-500">({item.sku})</span>}
                    </TableCell>
                    <TableCell>{item.category ?? "—"}</TableCell>
                    <TableCell>
                      {formatQuantity(item.quantity)} {item.unit}
                    </TableCell>
                    <TableCell>{formatMoney(item.avgCost)}</TableCell>
                    <TableCell>{formatMoney(item.sellPrice)}</TableCell>
                    <TableCell>{formatQuantity(item.minStock)}</TableCell>
                    <TableCell>
                      {item.isLow ? (
                        <Badge variant="destructive">Kam qoldi</Badge>
                      ) : (
                        <Badge variant="secondary">Yetarli</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
