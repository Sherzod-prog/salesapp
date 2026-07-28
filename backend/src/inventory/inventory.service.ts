import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { stock: true, category: true },
      orderBy: { name: 'asc' },
    });

    return products.map((product) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      category: product.category?.name ?? null,
      quantity: product.stock ? Number(product.stock.quantity) : 0,
      avgCost: product.stock ? Number(product.stock.avgCost) : 0,
      sellPrice: Number(product.sellPrice),
      minStock: Number(product.minStock),
      isLow: (product.stock ? Number(product.stock.quantity) : 0) <= Number(product.minStock),
    }));
  }

  async lowStock() {
    const all = await this.findAll();
    return all.filter((item) => item.isLow);
  }
}
