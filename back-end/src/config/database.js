// src/config/database.js
import { PrismaClient } from '@prisma/client';

// Cria uma instância global do PrismaClient
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Export a função de desconexão para uso durante o desligamento
export async function disconnectDatabase() {
  await prisma.$disconnect();
}