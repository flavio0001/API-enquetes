// src/middlewares/adminMiddleware.js
import { USER_TYPES } from '../config/constants.js';

/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser usado após o authMiddleware que define req.user
 */
const adminMiddleware = (req, res, next) => {
  // Verifica se o usuário está autenticado e tem o tipo ADMINISTRADOR
  if (!req.user || req.user.tipoNome !== USER_TYPES.ADMIN) {
    return res.status(403).json({ 
      message: 'Acesso negado. Permissão de administrador necessária.' 
    });
  }
  
  next();
};

export default adminMiddleware;