// src/repositories/comentarioRepository.js
import { prisma } from '../config/database.js';

/**
 * Repositório para operações de banco de dados relacionadas a comentários
 */
export class ComentarioRepository {
  /**
   * Cria um novo comentário
   * @param {Object} comentarioData - Dados do comentário
   * @returns {Promise<Object>} - Comentário criado
   */
  async create(comentarioData) {
    const { texto, userId, enqueteId } = comentarioData;
    
    return prisma.comentario.create({
      data: {
        texto,
        userId,
        enqueteId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  /**
   * Lista comentários de uma enquete
   * @param {number} enqueteId - ID da enquete
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Array>} - Lista de comentários
   */
  async findByEnquete(enqueteId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    return prisma.comentario.findMany({
      where: { 
        enqueteId,
        ativo: true 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { criadoEm: 'desc' },
      skip,
      take: limit
    });
  }

  /**
   * Conta o número total de comentários de uma enquete
   * @param {number} enqueteId - ID da enquete
   * @returns {Promise<number>} - Total de comentários
   */
  async countByEnquete(enqueteId) {
    return prisma.comentario.count({
      where: { 
        enqueteId,
        ativo: true 
      }
    });
  }

  /**
   * Busca um comentário por ID
   * @param {number} id - ID do comentário
   * @returns {Promise<Object|null>} - Comentário encontrado ou null
   */
  async findById(id) {
    return prisma.comentario.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        enquete: {
          select: {
            id: true,
            titulo: true,
            autorId: true
          }
        }
      }
    });
  }

  /**
   * Atualiza um comentário
   * @param {number} id - ID do comentário
   * @param {Object} data - Dados a serem atualizados
   * @returns {Promise<Object>} - Comentário atualizado
   */
  async update(id, data) {
    return prisma.comentario.update({
      where: { id },
      data: {
        ...data,
        editadoEm: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  /**
   * Exclui logicamente um comentário (define ativo como false)
   * @param {number} id - ID do comentário
   * @returns {Promise<Object>} - Comentário desativado
   */
  async softDelete(id) {
    return prisma.comentario.update({
      where: { id },
      data: { 
        ativo: false,
        editadoEm: new Date()
      }
    });
  }

  /**
   * Verifica se um usuário é o autor do comentário
   * @param {number} comentarioId - ID do comentário
   * @param {number} userId - ID do usuário
   * @returns {Promise<boolean>} - Verdadeiro se o usuário for o autor
   */
  async isOwner(comentarioId, userId) {
    const comentario = await prisma.comentario.findUnique({
      where: { id: comentarioId },
      select: { userId: true }
    });
    
    return comentario?.userId === userId;
  }

  /**
   * Lista comentários de um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Array>} - Lista de comentários
   */
  async findByUser(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    return prisma.comentario.findMany({
      where: { 
        userId,
        ativo: true 
      },
      include: {
        enquete: {
          select: {
            id: true,
            titulo: true
          }
        }
      },
      orderBy: { criadoEm: 'desc' },
      skip,
      take: limit
    });
  }
}

export default new ComentarioRepository();