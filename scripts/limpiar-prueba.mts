import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const deleted = await prisma.reserva.deleteMany({
  where: {
    fecha: new Date('2026-04-15'),
    horaInicio: '10:00'
  }
});

console.log('Reservas eliminadas:', deleted.count);
await prisma.$disconnect();
