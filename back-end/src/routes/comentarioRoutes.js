// src/routes/comentarioRoutes.js
import express from 'express';
import comentarioController from '../controllers/comentarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { validateComentario, validateListParams } from '../utils/validators/comentarioValidator.js';

const router = express.Router();

/**
 * @route POST /api/comentarios
 * @desc Cria um novo comentário
 * @access Private
 */
router.post('/', 
  authMiddleware, 
  validateRequest(validateComentario),
  comentarioController.criarComentario.bind(comentarioController)
);

/**
 * @route GET /api/comentarios/enquete/:enqueteId
 * @desc Lista comentários de uma enquete
 * @access Public
 */
router.get('/enquete/:enqueteId', 
  (req, res, next) => {
    // Valida parâmetros de consulta
    const errors = validateListParams(req.query);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Erro de validação', errors });
    }
    next();
  },
  comentarioController.listarComentariosPorEnquete.bind(comentarioController)
);

/**
 * @route GET /api/comentarios/:id
 * @desc Busca um comentário específico por ID
 * @access Public
 */
router.get('/:id', 
  comentarioController.buscarComentarioPorId.bind(comentarioController)
);

/**
 * @route PUT /api/comentarios/:id
 * @desc Atualiza um comentário
 * @access Private
 */
router.put('/:id', 
  authMiddleware, 
  validateRequest(validateComentario),
  comentarioController.atualizarComentario.bind(comentarioController)
);

/**
 * @route DELETE /api/comentarios/:id
 * @desc Exclui um comentário
 * @access Private
 */
router.delete('/:id', 
  authMiddleware, 
  comentarioController.excluirComentario.bind(comentarioController)
);

/**
 * @route GET /api/comentarios/usuario/meus
 * @desc Lista comentários do usuário autenticado
 * @access Private
 */
router.get('/usuario/meus', 
  authMiddleware,
  (req, res, next) => {
    // Valida parâmetros de consulta
    const errors = validateListParams(req.query);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Erro de validação', errors });
    }
    next();
  },
  comentarioController.listarComentariosPorUsuario.bind(comentarioController)
);

export default router;