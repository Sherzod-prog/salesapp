"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { formatMoney, formatQuantity } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { toast } from "sonner";

const NO_CATEGORY = "none";

interface ProductForm {
  name: string;
  sku: string;
  unit: string;
  sellPrice: string;
  minStock: string;
  categoryId: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  sku: "",
  unit: "dona",
  sellPrice: "",
  minStock: "0",
  categoryId: NO_CATEGORY,
};

export default function ProductsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function load(searchTerm = search) {
    if (!token) return;
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
    apiFetch<Product[]>(`/products${query}`, { token })
      .then(setProducts)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(() => {
    if (!token) return;
    load();
    apiFetch<Category[]>("/categories", { token }).then(setCategories).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      unit: product.unit,
      sellPrice: product.sellPrice,
      minStock: product.minStock,
      categoryId: product.categoryId ?? NO_CATEGORY,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const body = {
      name: form.name,
      sku: form.sku || undefined,
      unit: form.unit || undefined,
      sellPrice: Number(form.sellPrice),
      minStock: form.minStock ? Number(form.minStock) : undefined,
      categoryId: form.categoryId === NO_CATEGORY ? undefined : form.categoryId,
    };
    try {
      if (editingId) {
        await apiFetch<Product>(`/products/${editingId}`, { method: "PATCH", token, body });
        toast.success("Mahsulot yangilandi");
      } else {
        await apiFetch<Product>("/products", { method: "POST", token, body });
        toast.success("Mahsulot qo'shildi");
      }
      setIsDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE", token });
      toast.success("Mahsulot faolsizlantirildi");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Mahsulotlar</CardTitle>
            <CardDescription>Mahsulotlar katalogi</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                load(e.target.value);
              }}
              className="w-56"
            />
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger render={<Button onClick={openCreateDialog} />}>Yangi mahsulot</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</DialogTitle>
                  </DialogHeader>
                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Nomi</Label>
                      <Input
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={form.sku}
                          onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="unit">O&apos;lchov birligi</Label>
                        <Input
                          id="unit"
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="sellPrice">Sotuv narxi</Label>
                        <Input
                          id="sellPrice"
                          type="number"
                          min={0}
                          step="0.01"
                          required
                          value={form.sellPrice}
                          onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="minStock">Minimal qoldiq</Label>
                        <Input
                          id="minStock"
                          type="number"
                          min={0}
                          step="0.001"
                          value={form.minStock}
                          onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Kategoriya</Label>
                      <Select
                        value={form.categoryId}
                        onValueChange={(value) => setForm({ ...form, categoryId: value ?? NO_CATEGORY })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategoriya tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CATEGORY}>— Tanlanmagan —</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {products === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Narxi</TableHead>
                  <TableHead>Qoldiq</TableHead>
                  <TableHead>Holati</TableHead>
                  {isAdmin && <TableHead className="w-40" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500">
                      Mahsulotlar topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.name}
                      {product.sku && <span className="ml-2 text-xs text-zinc-500">({product.sku})</span>}
                    </TableCell>
                    <TableCell>{product.category?.name ?? "—"}</TableCell>
                    <TableCell>{formatMoney(product.sellPrice)}</TableCell>
                    <TableCell>
                      {product.stock ? `${formatQuantity(product.stock.quantity)} ${product.unit}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Faol" : "Nofaol"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                          Tahrirlash
                        </Button>
                        {product.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                              O&apos;chirish
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mahsulotni faolsizlantirish</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{product.name}&quot; nofaol qilinadi, u sotuv va kirim ro&apos;yxatlarida
                                  ko&apos;rinmaydi.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                  Tasdiqlash
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
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
