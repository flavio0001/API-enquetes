// src/routes/denunciaRoutes.js
import express from 'express';
import denunciaController from '../controllers/denunciaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { validateDenuncia, validateStatusUpdate, validateListParams } from '../utils/validators/denunciaValidator.js';

const router = express.Router();

/**
 * @route POST /api/denuncias
 * @desc Registra uma denúncia de enquete
 * @access Private
 */
router.post('/', 
  authMiddleware, 
  validateRequest(validateDenuncia),
  denunciaController.registrarDenuncia.bind(denunciaController)
);

/**
 * @route GET /api/denuncias
 * @desc Lista todas as denúncias (acesso admin)
 * @access Private/Admin
 */
router.get('/', 
  authMiddleware, 
  adminMiddleware, 
  (req, res, next) => {
    // Valida parâmetros de consulta
    const errors = validateListParams(req.query);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Erro de validação', errors });
    }
    next();
  },
  denunciaController.listarDenuncias.bind(denunciaController)
);

/**
 * @route GET /api/denuncias/:id
 * @desc Obtém detalhes de uma denúncia específica (acesso admin)
 * @access Private/Admin
 */
router.get('/:id', 
  authMiddleware, 
  adminMiddleware, 
  denunciaController.obterDenuncia.bind(denunciaController)
);

/**
 * @route PUT /api/denuncias/:id/status
 * @desc Atualiza o status de uma denúncia (acesso admin)
 * @access Private/Admin
 */
router.put('/:id/status', 
  authMiddleware, 
  adminMiddleware, 
  validateRequest(validateStatusUpdate),
  denunciaController.atualizarStatus.bind(denunciaController)
);

/**
 * @route GET /api/denuncias/dashboard
 * @desc Obtém dados para o dashboard de denúncias (acesso admin)
 * @access Private/Admin
 */
router.get('/dashboard/stats', 
  authMiddleware, 
  adminMiddleware, 
  denunciaController.obterDashboard.bind(denunciaController)
);

export default router;