// src/utils/errors/AppError.js

/**
 * Classe para erros personalizados da aplicação
 * Permite definir mensagens de erro e códigos de status HTTP
 */
export class AppError extends Error {
  /**
   * Cria uma nova instância de AppError
   * @param {string} message - Mensagem de erro
   * @param {number} statusCode - Código de status HTTP (padrão: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    
    // Captura o stack trace (para debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}