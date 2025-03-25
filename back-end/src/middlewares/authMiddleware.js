import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';
import { AppError } from '../utils/errors/AppError.js';

/**
 * Middleware para verificar autenticação do usuário através de token JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extrai o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('Token não fornecido. Acesso negado!', 401);
    }
    
    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      throw new AppError('Formato de token inválido. Use "Bearer [token]"', 401);
    }
    
    // Verifica e decodifica o token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado. Faça login novamente!', 401);
      } else {
        throw new AppError('Token inválido. Acesso negado!', 403);
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno na verificação de autenticação.' 
    });
  }
};

export default authMiddleware;