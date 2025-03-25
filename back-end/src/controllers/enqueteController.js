// src/controllers/enqueteController.js
import enqueteService from '../services/enqueteService.js';
import { AppError } from '../utils/errors/AppError.js';
import { validateEnqueteCreation } from '../utils/validators/enqueteValidator.js';

export class EnqueteController {
  async listarEnquetes(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const enquetes = await enqueteService.listarEnquetesPorUsuario(userId);
      return res.status(200).json(enquetes);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async listarTodasEnquetes(req, res, next) {
    try {
      const { limit } = req.query;
      const enquetes = await enqueteService.listarTodasEnquetes({ limit });
      return res.status(200).json(enquetes);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async criarEnquete(req, res, next) {
    try {
      const errors = validateEnqueteCreation(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const autorId = parseInt(req.user.id);
      const enquete = await enqueteService.criarEnquete(req.body, autorId);
      
      return res.status(201).json(enquete);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async votarNaOpcao(req, res, next) {
    try {
      const opcaoId = parseInt(req.params.id);
      const userId = parseInt(req.user.id);
      
      const resultado = await enqueteService.votarNaOpcao(opcaoId, userId);
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async buscarEnquetePorId(req, res, next) {
    try {
      const enqueteId = parseInt(req.params.id);
      const enquete = await enqueteService.buscarEnquetePorId(enqueteId);
      
      return res.status(200).json(enquete);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async excluirEnquete(req, res, next) {
    try {
      const enqueteId = parseInt(req.params.id);
      const userId = parseInt(req.user.id);
      
      const resultado = await enqueteService.excluirEnquete(enqueteId, userId);
      
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
  
  async adicionarComentario(req, res, next) {
    try {
      const enqueteId = parseInt(req.params.id);
      const userId = parseInt(req.user.id);
      const { texto } = req.body;
      
      if (!texto || texto.trim().length === 0) {
        return res.status(400).json({ message: 'O texto do comentário é obrigatório.' });
      }
      
      const comentario = await enqueteService.adicionarComentario(enqueteId, userId, texto);
      
      return res.status(201).json(comentario);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async verificarMeuVoto(req, res, next) {
    try {
      const enqueteId = parseInt(req.params.id);
      const userId = parseInt(req.user.id);
      
      const voto = await enqueteService.buscarVotoPorUsuarioEEnquete(userId, enqueteId);
      
      if (!voto) {
        return res.status(404).json({ message: 'Voto não encontrado' });
      }
      
      return res.status(200).json(voto);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default new EnqueteController();