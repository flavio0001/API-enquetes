// index.js - Ponto de entrada da aplicação
import dotenv from 'dotenv';
import app from './src/app.js';
import { disconnectDatabase } from './src/config/database.js';

// Carrega variáveis de ambiente
dotenv.config();

// Define a porta do servidor
const PORT = process.env.PORT || 8000;

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Tratamento gracioso de encerramento
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Função para encerramento gracioso da aplicação
 */
async function gracefulShutdown() {
  console.log('Encerrando servidor...');
  
  // Fecha o servidor HTTP primeiro para não aceitar novas conexões
  server.close(async () => {
    console.log('Servidor HTTP encerrado.');
    
    try {
      // Desconecta do banco de dados
      await disconnectDatabase();
      console.log('Conexão com o banco de dados encerrada.');
      
      console.log('Aplicação encerrada com sucesso.');
      process.exit(0);
    } catch (error) {
      console.error('Erro ao encerrar a aplicação:', error);
      process.exit(1);
    }
  });
  
  // Dá um tempo para conexões existentes terminarem,
  // mas força o encerramento após 10 segundos
  setTimeout(() => {
    console.error('Encerramento forçado após timeout.');
    process.exit(1);
  }, 10000);
}