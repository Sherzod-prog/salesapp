import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function resolveRange(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = from ? new Date(from) : new Date(end.getFullYear(), end.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(from?: string, to?: string) {
    const { start, end } = resolveRange(from, to);
    const result = await this.prisma.sale.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { totalAmount: true, totalProfit: true },
      _count: { id: true },
    });

    return {
      from: start,
      to: end,
      revenue: Number(result._sum.totalAmount ?? 0),
      profit: Number(result._sum.totalProfit ?? 0),
      salesCount: result._count.id,
    };
  }

  async daily(from?: string, to?: string) {
    const { start, end } = resolveRange(from, to);
    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, totalAmount: true, totalProfit: true },
    });

    const map = new Map<string, { date: string; revenue: number; profit: number; salesCount: number }>();
    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      const entry = map.get(day) ?? { date: day, revenue: 0, profit: 0, salesCount: 0 };
      entry.revenue += Number(sale.totalAmount);
      entry.profit += Number(sale.totalProfit);
      entry.salesCount += 1;
      map.set(day, entry);
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async topProducts(from?: string, to?: string, limit = 10) {
    const { start, end } = resolveRange(from, to);
    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: {
        items: {
          select: {
            productId: true,
            quantity: true,
            sellPrice: true,
            costPrice: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    const map = new Map<
      string,
      { productId: string; name: string; quantity: number; revenue: number; profit: number }
    >();
    for (const sale of sales) {
      for (const item of sale.items) {
        const entry = map.get(item.productId) ?? {
          productId: item.productId,
          name: item.product.name,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
        const qty = Number(item.quantity);
        entry.quantity += qty;
        entry.revenue += Number(item.sellPrice) * qty;
        entry.profit += (Number(item.sellPrice) - Number(item.costPrice)) * qty;
        map.set(item.productId, entry);
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }
}
