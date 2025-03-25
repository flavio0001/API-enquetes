// src/middlewares/validateRequest.js

/**
 * Middleware para validação de requisições usando funções validadoras
 * @param {Function} validatorFn - Função de validação que retorna um array de erros
 * @returns {Function} - Middleware do Express
 */
export const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body);
    
    if (errors && errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Erro de validação',
        errors
      });
    }
    
    next();
  };
};