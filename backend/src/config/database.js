import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test connection
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((e) => console.error('❌ Database connection failed:', e));

export default prisma;
