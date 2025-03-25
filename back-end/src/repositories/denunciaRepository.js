// src/repositories/denunciaRepository.js
import { prisma } from '../config/database.js';
import { COMPLAINT_STATUS } from '../config/constants.js';

/**
 * Repositório para operações de banco de dados relacionadas a denúncias
 */
export class DenunciaRepository {
  /**
   * Verifica se uma denúncia já existe para um usuário e enquete
   * @param {number} userId - ID do usuário
   * @param {number} enqueteId - ID da enquete
   * @returns {Promise<Object|null>} - Denúncia encontrada ou null
   */
  async findByUserAndEnquete(userId, enqueteId) {
    return prisma.denuncia.findUnique({
      where: {
        userId_enqueteId: { userId, enqueteId }
      }
    });
  }

  /**
   * Cria uma nova denúncia
   * @param {Object} denunciaData - Dados da denúncia
   * @returns {Promise<Object>} - Denúncia criada
   */
  async create(denunciaData) {
    const { userId, enqueteId, motivo } = denunciaData;
    
    return prisma.denuncia.create({
      data: {
        userId,
        enqueteId,
        motivo,
        status: COMPLAINT_STATUS.PENDING
      }
    });
  }

  /**
   * Lista todas as denúncias
   * @param {Object} options - Opções de filtragem
   * @returns {Promise<Array>} - Lista de denúncias
   */
  async findAll(options = {}) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    
    return prisma.denuncia.findMany({
      where,
      include: {
        user: { 
          select: { 
            id: true,
            username: true, 
            email: true 
          } 
        },
        enquete: { 
          select: { 
            id: true,
            titulo: true,
            ativa: true,
            autor: {
              select: {
                id: true,
                username: true
              }
            }
          } 
        }
      },
      orderBy: { criadoEm: 'desc' },
      skip,
      take: limit
    });
  }

  /**
   * Conta o número total de denúncias
   * @param {Object} options - Opções de filtragem
   * @returns {Promise<number>} - Total de denúncias
   */
  async count(options = {}) {
    const { status } = options;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    
    return prisma.denuncia.count({ where });
  }

  /**
   * Busca uma denúncia por ID
   * @param {number} id - ID da denúncia
   * @returns {Promise<Object|null>} - Denúncia encontrada ou null
   */
  async findById(id) {
    return prisma.denuncia.findUnique({
      where: { id },
      include: {
        user: { 
          select: { 
            id: true,
            username: true, 
            email: true 
          } 
        },
        enquete: { 
          select: { 
            id: true,
            titulo: true,
            ativa: true,
            autor: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Atualiza o status de uma denúncia
   * @param {number} id - ID da denúncia
   * @param {string} status - Novo status
   * @returns {Promise<Object>} - Denúncia atualizada
   */
  async updateStatus(id, status) {
    return prisma.denuncia.update({
      where: { id },
      data: { 
        status,
        analisadaEm: new Date()
      }
    });
  }

  /**
   * Lista as enquetes mais denunciadas
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Array>} - Lista de enquetes com contagem de denúncias
   */
  async findMostReportedEnquetes(limit = 10) {
    const result = await prisma.$queryRaw`
      SELECT 
        e.id, 
        e.titulo, 
        e.ativa,
        COUNT(d.id) as totalDenuncias 
      FROM 
        enquetes e 
      JOIN 
        denuncias d ON e.id = d.enqueteId 
      GROUP BY 
        e.id 
      ORDER BY 
        totalDenuncias DESC 
      LIMIT ${limit}
    `;
    
    return result;
  }

  /**
   * Obtém resumo de denúncias por status
   * @returns {Promise<Object>} - Contagem de denúncias por status
   */
  async getDenunciasSummary() {
    const pendentes = await prisma.denuncia.count({
      where: { status: COMPLAINT_STATUS.PENDING }
    });
    
    const analisadas = await prisma.denuncia.count({
      where: { status: COMPLAINT_STATUS.ANALYZED }
    });
    
    const aceitas = await prisma.denuncia.count({
      where: { status: COMPLAINT_STATUS.ACCEPTED }
    });
    
    const rejeitadas = await prisma.denuncia.count({
      where: { status: COMPLAINT_STATUS.REJECTED }
    });
    
    const total = await prisma.denuncia.count();
    
    return {
      pendentes,
      analisadas,
      aceitas,
      rejeitadas,
      total
    };
  }
}

export default new DenunciaRepository();