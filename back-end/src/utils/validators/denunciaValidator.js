// src/utils/validators/denunciaValidator.js
import { COMPLAINT_STATUS } from '../../config/constants.js';

/**
 * Valida os dados de uma denúncia
 * @param {Object} data - Dados da denúncia
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateDenuncia(data) {
  const errors = [];
  const { enqueteId, motivo } = data;

  // Validação do ID da enquete
  if (!enqueteId) {
    errors.push('ID da enquete é obrigatório');
  } else if (isNaN(parseInt(enqueteId))) {
    errors.push('ID da enquete deve ser um número');
  }

  // Validação do motivo, se fornecido
  if (motivo !== undefined) {
    if (typeof motivo !== 'string') {
      errors.push('Motivo deve ser um texto');
    } else if (motivo.trim().length > 0 && motivo.length > 500) {
      errors.push('Motivo deve ter no máximo 500 caracteres');
    }
  }

  return errors;
}

/**
 * Valida os dados de atualização de status de denúncia
 * @param {Object} data - Dados de atualização
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateStatusUpdate(data) {
  const errors = [];
  const { status, desativarEnquete } = data;

  // Validação do status
  if (!status) {
    errors.push('Status é obrigatório');
  } else if (!Object.values(COMPLAINT_STATUS).includes(status)) {
    errors.push(`Status inválido. Valores válidos: ${Object.values(COMPLAINT_STATUS).join(', ')}`);
  }

  // Validação do flag de desativação de enquete, se fornecido
  if (desativarEnquete !== undefined && typeof desativarEnquete !== 'boolean') {
    errors.push('O campo desativarEnquete deve ser um valor booleano');
  }

  return errors;
}

/**
 * Valida os parâmetros de consulta para listar denúncias
 * @param {Object} params - Parâmetros de consulta
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateListParams(params) {
  const errors = [];
  const { status, page, limit } = params;

  // Validação do status, se fornecido
  if (status && !Object.values(COMPLAINT_STATUS).includes(status)) {
    errors.push(`Status inválido. Valores válidos: ${Object.values(COMPLAINT_STATUS).join(', ')}`);
  }

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