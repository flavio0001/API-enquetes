// src/controllers/denunciaController.js
import denunciaService from '../services/denunciaService.js';
import { AppError } from '../utils/errors/AppError.js';
import { validateDenuncia, validateStatusUpdate } from '../utils/validators/denunciaValidator.js';

/**
 * Controller para gerenciar requisições relacionadas a denúncias
 */
export class DenunciaController {
  /**
   * Registra uma denúncia de enquete
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async registrarDenuncia(req, res, next) {
    try {
      // Valida os dados de entrada
      const errors = validateDenuncia(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const userId = parseInt(req.user.id);
      const resultado = await denunciaService.registrarDenuncia(userId, req.body);
      
      return res.status(201).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Lista todas as denúncias (para administradores)
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async listarDenuncias(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      
      const resultado = await denunciaService.listarDenuncias({
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Obtém detalhes de uma denúncia específica
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async obterDenuncia(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const denuncia = await denunciaService.obterDenuncia(id);
      
      return res.status(200).json(denuncia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Atualiza o status de uma denúncia
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async atualizarStatus(req, res, next) {
    try {
      // Valida os dados de entrada
      const errors = validateStatusUpdate(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const id = parseInt(req.params.id);
      const { status, desativarEnquete = false } = req.body;
      
      const resultado = await denunciaService.atualizarStatus(id, status, desativarEnquete);
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Obtém dados para o dashboard de denúncias
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async obterDashboard(req, res, next) {
    try {
      const dashboard = await denunciaService.obterDashboard();
      
      return res.status(200).json(dashboard);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default new DenunciaController();