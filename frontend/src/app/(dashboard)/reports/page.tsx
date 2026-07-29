"use client";

import { useEffect, useState } from "react";
import { AdminOnly } from "@/components/admin-only";
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
import { formatMoney } from "@/lib/format";
import type { DailyReport, ReportSummary, TopProduct } from "@/lib/types";
import { toast } from "sonner";

function firstDayOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const { token } = useAuth();
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [daily, setDaily] = useState<DailyReport[] | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null);

  function load() {
    if (!token) return;
    setSummary(null);
    setDaily(null);
    setTopProducts(null);
    const query = `?from=${from}&to=${to}`;
    apiFetch<ReportSummary>(`/reports/summary${query}`, { token })
      .then(setSummary)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
    apiFetch<DailyReport[]>(`/reports/daily${query}`, { token })
      .then(setDaily)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
    apiFetch<TopProduct[]>(`/reports/top-products${query}`, { token })
      .then(setTopProducts)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklashda xatolik"));
  }

  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminOnly>
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Hisobotlar</CardTitle>
          <CardDescription>Sana oralig&apos;ini tanlab hisobotlarni ko&apos;ring</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="from">Dan</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="to">Gacha</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button type="button" onClick={load}>
            Yangilash
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Tushum</CardDescription>
            <CardTitle className="text-2xl">
              {summary ? formatMoney(summary.revenue) : <Skeleton className="h-8 w-32" />}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Foyda</CardDescription>
            <CardTitle className="text-2xl">
              {summary ? formatMoney(summary.profit) : <Skeleton className="h-8 w-32" />}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cheklar soni</CardDescription>
            <CardTitle className="text-2xl">
              {summary ? summary.salesCount : <Skeleton className="h-8 w-16" />}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kunlik hisobot</CardTitle>
        </CardHeader>
        <CardContent>
          {daily === null ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Tushum</TableHead>
                  <TableHead>Foyda</TableHead>
                  <TableHead>Cheklar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daily.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500">
                      Ma&apos;lumot topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {daily.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{formatMoney(row.revenue)}</TableCell>
                    <TableCell>{formatMoney(row.profit)}</TableCell>
                    <TableCell>{row.salesCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eng ko&apos;p sotilgan mahsulotlar</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts === null ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Tushum</TableHead>
                  <TableHead>Foyda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500">
                      Ma&apos;lumot topilmadi
                    </TableCell>
                  </TableRow>
                )}
                {topProducts.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{formatMoney(row.revenue)}</TableCell>
                    <TableCell>{formatMoney(row.profit)}</TableCell>
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
