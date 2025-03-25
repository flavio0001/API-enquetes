// src/routes/enqueteRoutes.js
import express from 'express';
import enqueteController from '../controllers/enqueteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { validateEnqueteCreation, validateComentario } from '../utils/validators/enqueteValidator.js';

const router = express.Router();

/**
 * @route GET /api/enquetes/public
 * @desc Lista todas as enquetes disponíveis
 * @access Public
 */
router.get('/public', enqueteController.listarTodasEnquetes);

/**
 * @route GET /api/enquetes
 * @desc Lista enquetes do usuário autenticado
 * @access Private
 */
router.get('/', authMiddleware, enqueteController.listarEnquetes.bind(enqueteController));

/**
 * @route POST /api/enquetes
 * @desc Cria uma nova enquete
 * @access Private
 */
router.post('/', 
  authMiddleware, 
  validateRequest(validateEnqueteCreation),
  enqueteController.criarEnquete.bind(enqueteController)
);

/**
 * @route GET /api/enquetes/:id/meu-voto
 * @desc Verifica se o usuário atual já votou na enquete
 * @access Private
 */
router.get('/:id/meu-voto', 
  authMiddleware, 
  enqueteController.verificarMeuVoto.bind(enqueteController)
);

/**
 * @route POST /api/enquetes/:id/comentarios
 * @desc Adiciona um comentário a uma enquete
 * @access Private
 */
router.post('/:id/comentarios', 
  authMiddleware, 
  validateRequest(validateComentario),
  enqueteController.adicionarComentario.bind(enqueteController)
);

/**
 * @route GET /api/enquetes/:id
 * @desc Busca uma enquete específica por ID
 * @access Private
 */
router.get('/:id', 
  authMiddleware, 
  enqueteController.buscarEnquetePorId.bind(enqueteController)
);

/**
 * @route DELETE /api/enquetes/:id
 * @desc Exclui uma enquete
 * @access Private
 */
router.delete('/:id', 
  authMiddleware, 
  enqueteController.excluirEnquete.bind(enqueteController)
);

/**
 * @route POST /api/enquetes/opcoes/:id/votar
 * @desc Registra voto em uma opção
 * @access Private
 */
router.post('/opcoes/:id/votar', 
  authMiddleware, 
  enqueteController.votarNaOpcao.bind(enqueteController)
);

export default router;