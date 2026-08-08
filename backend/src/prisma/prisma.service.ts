import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // <-- Shu qator qo'shiladi

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL muhit o'zgaruvchisi aniqlanmadi.");
    }

    // 1. Dastlab 'pg' orqali Pool yaratamiz
    const pool = new Pool({ connectionString });

    // 2. Pool ni PrismaPg adapteriga beramiz
    const adapter = new PrismaPg(pool);

    // 3. Adapterni PrismaClient ga ulaymiz
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}