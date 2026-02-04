import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultLocales = [
  'Mataro Plus',
  'Aseguritanca',
  'Cerrajeroplus',
  'El Promanya',
  'Mikey',
  'FortiPany',
  'Cornepany',
  'Balesseps',
  'ObriTop',
  'CerraSaba'
];

async function main() {
  console.log('🌱 Starting seed...');

  // Crear admin por defecto si no existe
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@estadistica.local' },
    update: {},
    create: {
      email: 'admin@estadistica.local',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created/updated:', admin.email);

  // Crear locales por defecto
  for (const name of defaultLocales) {
    await prisma.local.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  console.log('✅ Default locales created');

  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
