import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL muhit o'zgaruvchisi aniqlanmadi.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email = 'admin@salesapp.local';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin foydalanuvchi allaqachon mavjud:', email);
    return;
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({
    data: {
      fullName: 'Bosh administrator',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin yaratildi -> email: admin@salesapp.local, parol: Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
