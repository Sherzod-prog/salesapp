"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import type { Category } from "@/lib/types";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function load() {
    if (!token) return;
    apiFetch<Category[]>("/categories", { token })
      .then(setCategories)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(load, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch<Category>("/categories", { method: "POST", token, body: { name } });
      toast.success("Kategoriya qo'shildi");
      setName("");
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
      await apiFetch(`/categories/${id}`, { method: "DELETE", token });
      toast.success("Kategoriya o'chirildi");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kategoriyalar</CardTitle>
            <CardDescription>Mahsulot kategoriyalari ro&apos;yxati</CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={<Button />}>Yangi kategoriya</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi kategoriya qo&apos;shish</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={handleCreate}>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Nomi</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
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
        </CardHeader>
        <CardContent>
          {categories === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  {isAdmin && <TableHead className="w-24" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-zinc-500">
                      Kategoriyalar topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                            O&apos;chirish
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kategoriyani o&apos;chirish</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{category.name}&quot; kategoriyasini o&apos;chirishni tasdiqlaysizmi?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)}>
                                O&apos;chirish
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
