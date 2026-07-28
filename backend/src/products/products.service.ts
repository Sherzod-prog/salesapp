import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    if (dto.sku) {
      const exists = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
      if (exists) throw new ConflictException('Bu SKU/shtrixkod band');
    }
    return this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        unit: dto.unit ?? 'dona',
        sellPrice: dto.sellPrice,
        minStock: dto.minStock ?? 0,
        categoryId: dto.categoryId,
        stock: { create: { quantity: 0, avgCost: 0 } },
      },
      include: { stock: true, category: true },
    });
  }

  findAll(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { stock: true, category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { stock: true, category: true },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { stock: true, category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }
}
