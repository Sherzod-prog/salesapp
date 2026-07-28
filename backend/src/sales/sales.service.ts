import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto, userId: string) {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { stock: true },
    });
    if (products.length !== new Set(productIds).size) {
      throw new NotFoundException('Ro\'yxatdagi ba\'zi mahsulotlar topilmadi');
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let totalProfit = 0;
      const itemsData: {
        productId: string;
        quantity: number;
        sellPrice: number;
        costPrice: number;
      }[] = [];

      for (const item of dto.items) {
        const product = productById.get(item.productId)!;
        const available = product.stock ? Number(product.stock.quantity) : 0;
        if (available < item.quantity) {
          throw new BadRequestException(
            `"${product.name}" mahsulotidan omborda yetarli qoldiq yo'q (mavjud: ${available})`,
          );
        }

        const sellPrice = item.sellPrice ?? Number(product.sellPrice);
        const costPrice = product.stock ? Number(product.stock.avgCost) : 0;

        totalAmount += sellPrice * item.quantity;
        totalProfit += (sellPrice - costPrice) * item.quantity;

        itemsData.push({ productId: item.productId, quantity: item.quantity, sellPrice, costPrice });

        await tx.stock.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      const sale = await tx.sale.create({
        data: {
          userId,
          paymentMethod: dto.paymentMethod ?? 'CASH',
          totalAmount,
          totalProfit,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } } },
      });

      return sale;
    });
  }

  findAll() {
    return this.prisma.sale.findMany({
      include: { items: { include: { product: true } }, user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: { select: { fullName: true } } },
    });
    if (!sale) throw new NotFoundException('Chek topilmadi');
    return sale;
  }
}
