import cron from 'node-cron';
import { prisma } from '../config/database.js';

// Função para desativar enquetes expiradas
const desativarEnquetesExpiradas = async () => {
  try {
    const result = await prisma.enquete.updateMany({
      where: {
        ativa: true,
        dataFim: {
          lt: new Date() // Enquetes com dataFim menor que a data atual
        }
      },
      data: {
        ativa: false
      }
    });
    
    console.log(`${result.count} enquete(s) desativada(s) por expiração de prazo`);
  } catch (error) {
    console.error('Erro ao desativar enquetes expiradas:', error);
  }
};

// Configurar o cron job para executar a cada hora
// O formato é: minuto hora dia-do-mês mês dia-da-semana
export const iniciarJobsEnquete = () => {
  // Agenda a execução para rodar a cada hora (no minuto 0)
  cron.schedule('0 * * * *', () => {
    console.log('Executando verificação de enquetes expiradas...');
    desativarEnquetesExpiradas();
  });
  
  // Executa imediatamente na inicialização do servidor para garantir a consistência
  console.log('Executando verificação inicial de enquetes expiradas...');
  desativarEnquetesExpiradas();
  
  console.log('Job de verificação de enquetes expiradas iniciado com sucesso');
};

export default {
  iniciarJobsEnquete
};