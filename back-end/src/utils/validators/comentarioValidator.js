// src/utils/validators/comentarioValidator.js

/**
 * Valida os dados de um comentário
 * @param {Object} data - Dados do comentário
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateComentario(data) {
  const errors = [];
  const { texto, enqueteId } = data;

  // Validação do texto
  if (!texto) {
    errors.push('O texto do comentário é obrigatório');
  } else if (texto.trim().length === 0) {
    errors.push('O comentário não pode ser vazio');
  } else if (texto.length > 1000) {
    errors.push('O comentário deve ter no máximo 1000 caracteres');
  }

  // Validação do ID da enquete, se fornecido (para criar comentário)
  if (enqueteId !== undefined) {
    if (isNaN(parseInt(enqueteId))) {
      errors.push('ID da enquete inválido');
    }
  }

  return errors;
}

/**
 * Valida os parâmetros de consulta para listar comentários
 * @param {Object} params - Parâmetros de consulta
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateListParams(params) {
  const errors = [];
  const { page, limit } = params;

  // Validação da página, se fornecida
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Página deve ser um número positivo');
    }
  }

  // Validação do limite, se fornecido
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limite deve ser um número entre 1 e 100');
    }
  }

  return errors;
}