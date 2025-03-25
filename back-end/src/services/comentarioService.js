// src/services/comentarioService.js
import comentarioRepository from '../repositories/comentarioRepository.js';
import enqueteRepository from '../repositories/enqueteRepository.js';
import { AppError } from '../utils/errors/AppError.js';

/**
 * Serviço para lógica de negócio relacionada a comentários
 */
export class ComentarioService {
  constructor(repository, enqueteRepo) {
    this.repository = repository;
    this.enqueteRepo = enqueteRepo;
  }

  /**
   * Cria um novo comentário
   * @param {number} userId - ID do usuário que está comentando
   * @param {number} enqueteId - ID da enquete que está sendo comentada
   * @param {string} texto - Texto do comentário
   * @returns {Promise<Object>} - Comentário criado
   */
  async criarComentario(userId, enqueteId, texto) {
    // Validações básicas
    if (isNaN(enqueteId)) {
      throw new AppError('ID da enquete inválido.', 400);
    }

    if (!texto || texto.trim().length === 0) {
      throw new AppError('O texto do comentário é obrigatório.', 400);
    }

    if (texto.length > 1000) {
      throw new AppError('O comentário deve ter no máximo 1000 caracteres.', 400);
    }

    // Verifica se a enquete existe
    const enquete = await this.enqueteRepo.findById(enqueteId);
    if (!enquete) {
      throw new AppError('Enquete não encontrada.', 404);
    }

    // Verifica se a enquete está ativa
    if (!enquete.ativa) {
      throw new AppError('Esta enquete não está mais ativa.', 400);
    }

    // Cria o comentário
    const comentario = await this.repository.create({
      texto: texto.trim(),
      userId,
      enqueteId
    });

    return comentario;
  }

  /**
   * Lista comentários de uma enquete
   * @param {number} enqueteId - ID da enquete
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Object>} - Lista de comentários e metadados
   */
  async listarComentariosPorEnquete(enqueteId, options = {}) {
    if (isNaN(enqueteId)) {
      throw new AppError('ID da enquete inválido.', 400);
    }

    // Verifica se a enquete existe
    const enquete = await this.enqueteRepo.findById(enqueteId);
    if (!enquete) {
      throw new AppError('Enquete não encontrada.', 404);
    }

    // Obtém comentários com paginação
    const comentarios = await this.repository.findByEnquete(enqueteId, options);
    const total = await this.repository.countByEnquete(enqueteId);
    
    // Calcula metadados de paginação
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      comentarios,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Atualiza um comentário
   * @param {number} comentarioId - ID do comentário
   * @param {number} userId - ID do usuário que está atualizando
   * @param {string} texto - Novo texto do comentário
   * @returns {Promise<Object>} - Comentário atualizado
   */
  async atualizarComentario(comentarioId, userId, texto) {
    if (isNaN(comentarioId)) {
      throw new AppError('ID do comentário inválido.', 400);
    }

    if (!texto || texto.trim().length === 0) {
      throw new AppError('O texto do comentário é obrigatório.', 400);
    }

    if (texto.length > 1000) {
      throw new AppError('O comentário deve ter no máximo 1000 caracteres.', 400);
    }

    // Verifica se o comentário existe
    const comentario = await this.repository.findById(comentarioId);
    if (!comentario) {
      throw new AppError('Comentário não encontrado.', 404);
    }

    // Verifica se o usuário é o autor do comentário ou um administrador
    const isOwner = await this.repository.isOwner(comentarioId, userId);
    if (!isOwner && userId !== 1) { // Supõe que o ID 1 é um admin ou implementa verificação adequada
      throw new AppError('Você não tem permissão para editar este comentário.', 403);
    }

    // Atualiza o comentário
    const comentarioAtualizado = await this.repository.update(comentarioId, {
      texto: texto.trim()
    });

    return comentarioAtualizado;
  }

  /**
   * Exclui um comentário (exclusão lógica)
   * @param {number} comentarioId - ID do comentário
   * @param {number} userId - ID do usuário que está excluindo
   * @returns {Promise<Object>} - Resultado da operação
   */
  async excluirComentario(comentarioId, userId) {
    if (isNaN(comentarioId)) {
      throw new AppError('ID do comentário inválido.', 400);
    }

    // Verifica se o comentário existe
    const comentario = await this.repository.findById(comentarioId);
    if (!comentario) {
      throw new AppError('Comentário não encontrado.', 404);
    }

    // Verifica se o usuário é o autor do comentário, o autor da enquete ou um administrador
    const isOwner = await this.repository.isOwner(comentarioId, userId);
    const isEnqueteOwner = comentario.enquete.autorId === userId;
    const isAdmin = userId === 1; // Supõe que o ID 1 é um admin ou implementa verificação adequada
    
    if (!isOwner && !isEnqueteOwner && !isAdmin) {
      throw new AppError('Você não tem permissão para excluir este comentário.', 403);
    }

    // Exclui logicamente o comentário
    await this.repository.softDelete(comentarioId);

    return { 
      message: 'Comentário excluído com sucesso.'
    };
  }

  /**
   * Busca um comentário por ID
   * @param {number} comentarioId - ID do comentário
   * @returns {Promise<Object>} - Comentário encontrado
   */
  async buscarComentarioPorId(comentarioId) {
    if (isNaN(comentarioId)) {
      throw new AppError('ID do comentário inválido.', 400);
    }

    const comentario = await this.repository.findById(comentarioId);
    if (!comentario) {
      throw new AppError('Comentário não encontrado.', 404);
    }

    if (!comentario.ativo) {
      throw new AppError('Este comentário foi removido.', 404);
    }

    return comentario;
  }

  /**
   * Lista comentários de um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Object>} - Lista de comentários e metadados
   */
  async listarComentariosPorUsuario(userId, options = {}) {
    if (isNaN(userId)) {
      throw new AppError('ID do usuário inválido.', 400);
    }

    // Obtém comentários com paginação
    const comentarios = await this.repository.findByUser(userId, options);
    
    return {
      comentarios
    };
  }
}

export default new ComentarioService(comentarioRepository, enqueteRepository);