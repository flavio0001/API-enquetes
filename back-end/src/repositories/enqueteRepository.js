import { prisma } from '../config/database.js';

export class EnqueteRepository {
  async findByUser(userId) {
    const enquetes = await prisma.enquete.findMany({
      where: { autorId: userId },
      include: {
        opcoes: {
          include: {
            _count: { select: { votosRegistro: true } }
          }
        },
        autor: true
      }
    });
    
    // Verifica e atualiza enquetes expiradas
    const dataAtual = new Date();
    const enquetesAtualizadas = [];
    
    for (const enquete of enquetes) {
      if (enquete.ativa && new Date(enquete.dataFim) < dataAtual) {
        // Atualiza no banco de dados
        await prisma.enquete.update({
          where: { id: enquete.id },
          data: { ativa: false }
        });
        
        // Atualiza localmente
        enquete.ativa = false;
      }
      enquetesAtualizadas.push(this._addTotalVotos(enquete));
    }
    
    return enquetesAtualizadas;
  }
  
  async findAll(options = {}) {
    const { limit } = options;
    
    // Recupera as enquetes marcadas como ativas no banco de dados
    const enquetes = await prisma.enquete.findMany({
      where: { ativa: true },
      include: {
        opcoes: {
          include: {
            _count: { select: { votosRegistro: true } }
          }
        },
        autor: { 
          select: { 
            id: true,
            username: true 
          } 
        }
      },
      orderBy: { criadoEm: 'desc' },
      ...(limit && { take: Number(limit) })
    });
    
    // Verifica e atualiza enquetes que já expiraram mas ainda estão marcadas como ativas
    const dataAtual = new Date();
    const enquetesAtualizadas = [];
    
    // Processamento de enquetes e verificação de expiração
    for (const enquete of enquetes) {
      const dataFim = new Date(enquete.dataFim);
      
      if (dataFim < dataAtual) {
        // Enquete expirada - atualiza no banco
        await prisma.enquete.update({
          where: { id: enquete.id },
          data: { ativa: false }
        });
        
        // Para fins de listagem atual, podemos mostrar ou não dependendo da regra de negócio
        // Se quiser ocultar enquetes expiradas da lista, comente o código abaixo
        enquete.ativa = false;
        enquetesAtualizadas.push(this._addTotalVotos(enquete));
      } else {
        // Enquete ainda válida
        enquetesAtualizadas.push(this._addTotalVotos(enquete));
      }
    }
    
    return enquetesAtualizadas;
  }
  
  async create(enqueteData) {
    const { titulo, descricao, dataFim, autorId, opcoes } = enqueteData;
    
    const enquete = await prisma.enquete.create({
      data: {
        titulo,
        descricao,
        dataFim,
        autorId,
        opcoes: { 
          create: opcoes.map(texto => ({ texto }))
        }
      },
      include: {
        opcoes: true
      }
    });
    
    // Como é uma nova enquete, totalVotos sempre será 0
    return { ...enquete, totalVotos: 0 };
  }
  
  async findById(id) {
    const enquete = await prisma.enquete.findUnique({
      where: { id },
      include: {
        opcoes: {
          include: {
            _count: { select: { votosRegistro: true } }
          }
        },
        autor: { 
          select: { 
            id: true,
            username: true 
          } 
        }
      }
    });
    
    if (!enquete) return null;
    
    // Verifica se a enquete está expirada, mas ainda marcada como ativa
    if (enquete.ativa && new Date(enquete.dataFim) < new Date()) {
      // Atualiza o status no banco de dados
      await prisma.enquete.update({
        where: { id },
        data: { ativa: false }
      });
      
      // Atualiza o objeto local
      enquete.ativa = false;
    }
    
    // Adiciona totalVotos à enquete
    return this._addTotalVotos(enquete);
  }
  
  async delete(id) {
    return prisma.enquete.delete({
      where: { id }
    });
  }
  
  async findOpcaoById(id) {
    return prisma.opcao.findUnique({
      where: { id },
      include: { 
        enquete: true,
        votosRegistro: true 
      }
    });
  }
  
  async findVotoByUserAndEnquete(userId, enqueteId) {
    return prisma.voto.findFirst({
      where: {
        userId,
        opcao: { 
          enqueteId: enqueteId 
        }
      },
      include: {
        opcao: true
      }
    });
  }
  
  async findVotosByUserAndEnquete(userId, enqueteId) {
    return prisma.voto.findMany({
      where: {
        userId,
        opcao: { 
          enqueteId: enqueteId 
        }
      },
      include: {
        opcao: true
      }
    });
  }
  
  async createVoto(userId, opcaoId) {
    return prisma.voto.create({
      data: {
        userId,
        opcaoId
      },
      include: {
        opcao: true
      }
    });
  }
  
  async deleteVoto(id) {
    return prisma.voto.delete({
      where: { id }
    });
  }
  
  async isOwner(enqueteId, userId) {
    const enquete = await prisma.enquete.findUnique({
      where: { id: enqueteId },
      select: { autorId: true }
    });
    
    return enquete?.autorId === userId;
  }
  
  async update(id, data) {
    return prisma.enquete.update({
      where: { id },
      data
    });
  }
  
  // Método auxiliar para adicionar a contagem total de votos a uma enquete
  _addTotalVotos(enquete) {
    if (!enquete) return null;
    
    // Calcula o total de votos somando os votos de todas as opções
    const totalVotos = enquete.opcoes.reduce((total, opcao) => {
      return total + (opcao._count?.votosRegistro || 0);
    }, 0);
    
    // Retorna a enquete com o total de votos adicionado
    return {
      ...enquete,
      totalVotos
    };
  }
}

export default new EnqueteRepository();