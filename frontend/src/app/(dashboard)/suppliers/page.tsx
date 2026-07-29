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
import type { Supplier } from "@/lib/types";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", phone: "", address: "" };

export default function SuppliersPage() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function load() {
    if (!token) return;
    apiFetch<Supplier[]>("/suppliers", { token })
      .then(setSuppliers)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(load, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch<Supplier>("/suppliers", {
        method: "POST",
        token,
        body: {
          name: form.name,
          phone: form.phone || undefined,
          address: form.address || undefined,
        },
      });
      toast.success("Ta'minotchi qo'shildi");
      setForm(EMPTY_FORM);
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
      await apiFetch(`/suppliers/${id}`, { method: "DELETE", token });
      toast.success("Ta'minotchi o'chirildi");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    }
  }

  return (
    <AdminOnly>
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ta&apos;minotchilar</CardTitle>
            <CardDescription>Tovar yetkazib beruvchilar ro&apos;yxati</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button />}>Yangi ta&apos;minotchi</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi ta&apos;minotchi qo&apos;shish</DialogTitle>
              </DialogHeader>
              <form className="flex flex-col gap-4" onSubmit={handleCreate}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nomi</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address">Manzil</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
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
          {suppliers === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Manzil</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500">
                      Ta&apos;minotchilar topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.phone ?? "—"}</TableCell>
                    <TableCell>{supplier.address ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                          O&apos;chirish
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ta&apos;minotchini o&apos;chirish</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{supplier.name}&quot;ni o&apos;chirishni tasdiqlaysizmi?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(supplier.id)}>
                              O&apos;chirish
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
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
