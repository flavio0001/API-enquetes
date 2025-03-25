// src/controllers/comentarioController.js
import comentarioService from '../services/comentarioService.js';
import { AppError } from '../utils/errors/AppError.js';
import { validateComentario } from '../utils/validators/comentarioValidator.js';

/**
 * Controller para gerenciar requisições relacionadas a comentários
 */
export class ComentarioController {
  /**
   * Cria um novo comentário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async criarComentario(req, res, next) {
    try {
      // Valida os dados de entrada
      const errors = validateComentario(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const { enqueteId, texto } = req.body;
      const userId = parseInt(req.user.id);
      
      const comentario = await comentarioService.criarComentario(
        userId, 
        parseInt(enqueteId), 
        texto
      );
      
      return res.status(201).json(comentario);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Lista comentários de uma enquete
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async listarComentariosPorEnquete(req, res, next) {
    try {
      const enqueteId = parseInt(req.params.enqueteId);
      const { page, limit } = req.query;
      
      const resultado = await comentarioService.listarComentariosPorEnquete(
        enqueteId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20
        }
      );
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Atualiza um comentário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async atualizarComentario(req, res, next) {
    try {
      // Valida os dados de entrada
      const errors = validateComentario(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const comentarioId = parseInt(req.params.id);
      const userId = parseInt(req.user.id);
      const { texto } = req.body;
      
      const comentario = await comentarioService.atualizarComentario(
        comentarioId,
        userId,
        texto
      );
      
      return res.status(200).json(comentario);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Exclui um comentário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async excluirComentario(req, res, next) {
    try {
      const comentarioId = parseInt(req.params.id);
      const userId = parseInt(req.user.id);
      
      const resultado = await comentarioService.excluirComentario(
        comentarioId,
        userId
      );
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Busca um comentário por ID
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async buscarComentarioPorId(req, res, next) {
    try {
      const comentarioId = parseInt(req.params.id);
      
      const comentario = await comentarioService.buscarComentarioPorId(comentarioId);
      
      return res.status(200).json(comentario);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Lista comentários de um usuário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async listarComentariosPorUsuario(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { page, limit } = req.query;
      
      const resultado = await comentarioService.listarComentariosPorUsuario(
        userId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20
        }
      );
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default new ComentarioController();