import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('MySQL connected');
  } catch (err) {
    console.error('Failed to connect to MySQL:', err);
    process.exitCode=1
  }
};

// Fechar a conexão do Prisma Client quando o processo terminar
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MySQL connection');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing MySQL connection');
  await prisma.$disconnect();
  process.exit(0);
});

export default connectDB;
