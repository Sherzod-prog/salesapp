"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminOnly } from "@/components/admin-only";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatMoney, formatQuantity } from "@/lib/format";
import type { Product, StockIn, Supplier } from "@/lib/types";
import { toast } from "sonner";

const NO_SUPPLIER = "none";

interface ItemRow {
  productId: string;
  quantity: string;
  costPrice: string;
}

const EMPTY_ROW: ItemRow = { productId: "", quantity: "", costPrice: "" };

export default function StockInPage() {
  const { token } = useAuth();
  const [stockIns, setStockIns] = useState<StockIn[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState(NO_SUPPLIER);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ROW }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function load() {
    if (!token) return;
    apiFetch<StockIn[]>("/stock-ins", { token })
      .then(setStockIns)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(() => {
    if (!token) return;
    load();
    apiFetch<Product[]>("/products", { token }).then(setProducts).catch(() => {});
    apiFetch<Supplier[]>("/suppliers", { token }).then(setSuppliers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setItems((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setSupplierId(NO_SUPPLIER);
    setNote("");
    setItems([{ ...EMPTY_ROW }]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch<StockIn>("/stock-ins", {
        method: "POST",
        token,
        body: {
          supplierId: supplierId === NO_SUPPLIER ? undefined : supplierId,
          note: note || undefined,
          items: items.map((row) => ({
            productId: row.productId,
            quantity: Number(row.quantity),
            costPrice: Number(row.costPrice),
          })),
        },
      });
      toast.success("Kirim hujjati yaratildi");
      resetForm();
      setIsDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminOnly>
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tovar kirimi</CardTitle>
            <CardDescription>Omborga tovar kirim hujjatlari</CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger render={<Button />}>Yangi kirim</DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yangi kirim hujjati</DialogTitle>
              </DialogHeader>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Ta&apos;minotchi</Label>
                    <Select value={supplierId} onValueChange={(value) => setSupplierId(value ?? NO_SUPPLIER)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ta'minotchi tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SUPPLIER}>— Tanlanmagan —</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="note">Izoh</Label>
                    <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={1} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Mahsulotlar</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRow}>
                      Qator qo&apos;shish
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.map((row, index) => (
                      <div key={index} className="grid grid-cols-[1fr_100px_120px_32px] items-end gap-2">
                        <div className="flex flex-col gap-1">
                          {index === 0 && <Label className="text-xs">Mahsulot</Label>}
                          <Select
                            value={row.productId}
                            onValueChange={(value) => updateItem(index, { productId: value ?? "" })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                          {index === 0 && <Label className="text-xs">Miqdor</Label>}
                          <Input
                            type="number"
                            min={0.001}
                            step="0.001"
                            required
                            value={row.quantity}
                            onChange={(e) => updateItem(index, { quantity: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          {index === 0 && <Label className="text-xs">Tannarx</Label>}
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            value={row.costPrice}
                            onChange={(e) => updateItem(index, { costPrice: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={items.length === 1}
                          onClick={() => removeRow(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {stockIns === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Ta&apos;minotchi</TableHead>
                  <TableHead>Mahsulotlar</TableHead>
                  <TableHead>Jami tannarx</TableHead>
                  <TableHead>Kim kiritdi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockIns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-500">
                      Kirim hujjatlari topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {stockIns.map((stockIn) => (
                  <TableRow key={stockIn.id}>
                    <TableCell>{formatDate(stockIn.createdAt)}</TableCell>
                    <TableCell>{stockIn.supplier?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {stockIn.items
                        .map((item) => `${item.product?.name ?? ""} (${formatQuantity(item.quantity)})`)
                        .join(", ")}
                    </TableCell>
                    <TableCell>{formatMoney(stockIn.totalCost)}</TableCell>
                    <TableCell>{stockIn.user?.fullName ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminOnly>
  );
}
