// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Cria os tipos de usuário
  await prisma.tipoUsuario.upsert({
    where: { nome: 'ADMINISTRADOR' },
    update: {},
    create: { nome: 'ADMINISTRADOR' }
  });

  await prisma.tipoUsuario.upsert({
    where: { nome: 'CLIENTE' },
    update: {},
    create: { nome: 'CLIENTE' }
  });

  console.log('Tipos de usuário criados com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });