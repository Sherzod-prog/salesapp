import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
