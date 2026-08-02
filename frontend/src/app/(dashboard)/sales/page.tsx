"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDate, formatMoney, formatQuantity } from "@/lib/format";
import type { PaymentMethod, Product, Sale } from "@/lib/types";
import { toast } from "sonner";

interface CartLine {
  productId: string;
  name: string;
  unit: string;
  quantity: string;
  sellPrice: string;
}

export default function SalesPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadSales() {
    if (!token) return;
    apiFetch<Sale[]>("/sales", { token })
      .then(setSales)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(() => {
    if (!token) return;
    loadSales();
    apiFetch<Product[]>("/products", { token }).then(setProducts).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function addToCart() {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    if (cart.some((line) => line.productId === product.id)) {
      toast.error("Bu mahsulot allaqachon savatda");
      return;
    }
    setCart((prev) => [
      ...prev,
      { productId: product.id, name: product.name, unit: product.unit, quantity: "1", sellPrice: product.sellPrice },
    ]);
    setSelectedProductId("");
  }

  function updateLine(productId: string, patch: Partial<CartLine>) {
    setCart((prev) => prev.map((line) => (line.productId === productId ? { ...line, ...patch } : line)));
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.sellPrice || 0), 0),
    [cart],
  );

  async function handleCheckout() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await apiFetch<Sale>("/sales", {
        method: "POST",
        token,
        body: {
          paymentMethod,
          items: cart.map((line) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            sellPrice: Number(line.sellPrice),
          })),
        },
      });
      toast.success("Sotuv chek qilindi");
      setCart([]);
      setPaymentMethod("CASH");
      loadSales();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Yangi sotuv</CardTitle>
          <CardDescription>Mahsulotlarni savatga qo&apos;shib, chek qiling</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>Mahsulot</Label>
              <Select value={selectedProductId} onValueChange={(value) => setSelectedProductId(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Mahsulot tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((p) => p.isActive)
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}   >
                        {product.name}
                        {/* {product.name} — {formatMoney(product.sellPrice)} */}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={addToCart} disabled={!selectedProductId}>
              Qo&apos;shish
            </Button>
          </div>

          {cart.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead className="w-28">Miqdor</TableHead>
                  <TableHead className="w-32">Narxi</TableHead>
                  <TableHead className="w-32">Summa</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((line) => (
                  <TableRow key={line.productId}>
                    <TableCell>
                      {line.name} <span className="text-xs text-zinc-500">({line.unit})</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        step="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.productId, { quantity: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={line.sellPrice}
                        onChange={(e) => updateLine(line.productId, { sellPrice: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>{formatMoney(Number(line.quantity || 0) * Number(line.sellPrice || 0))}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeLine(line.productId)}>
                        ✕
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-end justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex flex-col gap-2">
              <Label>To&apos;lov turi</Label>
              <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Naqd</SelectItem>
                  <SelectItem value="CARD">Karta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold">Jami: {formatMoney(total)}</p>
              <Button onClick={handleCheckout} disabled={cart.length === 0 || isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : "Chek qilish"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>So&apos;nggi sotuvlar</CardTitle>
        </CardHeader>
        <CardContent>
          {sales === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Sotuvchi</TableHead>
                  <TableHead>Mahsulotlar</TableHead>
                  <TableHead>To&apos;lov</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Foyda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500">
                      Sotuvlar topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>{sale.user?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {sale.items
                        .map((item) => `${item.product.name} (${formatQuantity(item.quantity)})`)
                        .join(", ")}
                    </TableCell>
                    <TableCell>{sale.paymentMethod === "CASH" ? "Naqd" : "Karta"}</TableCell>
                    <TableCell>{formatMoney(sale.totalAmount)}</TableCell>
                    <TableCell>{formatMoney(sale.totalProfit)}</TableCell>
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
