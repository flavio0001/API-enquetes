// src/middlewares/errorHandler.js
import { AppError } from '../utils/errors/AppError.js';

/**
 * Middleware para tratar erros de forma centralizada
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro para debugging (em produção, deveria usar um logger apropriado)
  console.error(`[Erro ${new Date().toISOString()}]:`, err);
  
  // Se for um erro da aplicação (AppError), usa o código e mensagem definidos
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Se for um erro do Prisma, trata especificamente
  if (err.code && (err.code.startsWith('P') || err.name === 'PrismaClientKnownRequestError')) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro na operação do banco de dados',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Para qualquer outro erro, retorna um erro genérico
  // Em desenvolvimento, inclui mais detalhes para debugging
  const isDev = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor',
    ...(isDev && { 
      stack: err.stack,
      details: err.message 
    })
  });
};

export default errorHandler;