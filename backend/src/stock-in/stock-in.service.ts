import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockInDto } from './dto/create-stock-in.dto';

@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStockInDto, userId: string) {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== new Set(productIds).size) {
      throw new NotFoundException('Ro\'yxatdagi ba\'zi mahsulotlar topilmadi');
    }

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
      if (!supplier) throw new NotFoundException('Ta\'minotchi topilmadi');
    }

    const totalCost = dto.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

    return this.prisma.$transaction(async (tx) => {
      const stockIn = await tx.stockIn.create({
        data: {
          supplierId: dto.supplierId,
          userId,
          note: dto.note,
          totalCost,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              costPrice: item.costPrice,
            })),
          },
        },
        include: { items: true, supplier: true },
      });

      for (const item of dto.items) {
        const stock = await tx.stock.findUnique({ where: { productId: item.productId } });
        const currentQty = stock ? Number(stock.quantity) : 0;
        const currentAvgCost = stock ? Number(stock.avgCost) : 0;
        const newQty = currentQty + item.quantity;
        const newAvgCost =
          newQty > 0 ? (currentQty * currentAvgCost + item.quantity * item.costPrice) / newQty : 0;

        await tx.stock.upsert({
          where: { productId: item.productId },
          create: { productId: item.productId, quantity: newQty, avgCost: newAvgCost },
          update: { quantity: newQty, avgCost: newAvgCost },
        });
      }

      return stockIn;
    });
  }

  findAll() {
    return this.prisma.stockIn.findMany({
      include: { items: { include: { product: true } }, supplier: true, user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const stockIn = await this.prisma.stockIn.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, supplier: true, user: { select: { fullName: true } } },
    });
    if (!stockIn) throw new NotFoundException('Kirim hujjati topilmadi');
    return stockIn;
  }
}
