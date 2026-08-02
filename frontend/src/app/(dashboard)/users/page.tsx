"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminOnly } from "@/components/admin-only";
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
import type { Role, User } from "@/lib/types";
import { toast } from "sonner";

const EMPTY_FORM = { fullName: "", email: "", password: "", role: "CASHIER" as Role };

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  CASHIER: "Kassir",
  MANAGER: "Menejer",
};

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function load() {
    if (!token) return;
    apiFetch<User[]>("/users", { token })
      .then(setUsers)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(load, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch<User>("/users", {
        method: "POST",
        token,
        body: {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
        },
      });
      toast.success("Foydalanuvchi qo'shildi");
      setForm(EMPTY_FORM);
      setIsDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(target: User) {
    try {
      await apiFetch<User>(`/users/${target.id}`, {
        method: "PATCH",
        token,
        body: { isActive: !target.isActive },
      });
      toast.success(target.isActive ? "Foydalanuvchi bloklandi" : "Foydalanuvchi faollashtirildi");
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
              <CardTitle>Foydalanuvchilar</CardTitle>
              <CardDescription>Tizim foydalanuvchilarini boshqarish</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={<Button />}>Yangi foydalanuvchi</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi foydalanuvchi qo&apos;shish</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={handleCreate}>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fullName">To&apos;liq ism</Label>
                    <Input
                      id="fullName"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Parol</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Rol</Label>
                    <Select
                      value={form.role}
                      onValueChange={(value) => setForm({ ...form, role: (value ?? "CASHIER") as Role })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rol tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASHIER">Kassir</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                        <SelectItem value="MANAGER">Menejer</SelectItem>
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
          </CardHeader>
          <CardContent>
            {users === null ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To&apos;liq ism</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead className="w-32" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500">
                        Foydalanuvchilar topilmadi
                      </TableCell>
                    </TableRow>
                  )}
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.fullName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? "secondary" : "destructive"}>
                          {u.isActive ? "Faol" : "Bloklangan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={u.id === currentUser?.id}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.isActive ? "Bloklash" : "Faollashtirish"}
                        </Button>
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
