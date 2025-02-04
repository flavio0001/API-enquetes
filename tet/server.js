import app from "./src/app.js";
import { PrismaClient } from "@prisma/client";

const PORT = 8000;

// Inicializa o Prisma Client
const prisma = new PrismaClient();

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor ativado na porta ${PORT}`);
});

// Encerra a conexão com o banco ao finalizar o servidor
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
