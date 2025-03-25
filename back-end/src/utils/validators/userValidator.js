// src/utils/validators/userValidator.js
import { USER_TYPES } from '../../config/constants.js';

/**
 * Valida os dados de registro de um usuário
 * @param {Object} data - Dados do formulário de registro
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateUserRegistration(data) {
  const errors = [];
  const { username, email, password, role } = data;

  // Validação de nome de usuário
  if (!username) {
    errors.push('Nome de usuário é obrigatório');
  } else if (username.length < 3) {
    errors.push('Nome de usuário deve ter pelo menos 3 caracteres');
  } else if (username.length > 50) {
    errors.push('Nome de usuário deve ter no máximo 50 caracteres');
  }

  // Validação de email
  if (!email) {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(email)) {
    errors.push('Email inválido');
  }

  // Validação de senha
  if (!password) {
    errors.push('Senha é obrigatória');
  } else if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  } else if (password.length > 100) {
    errors.push('Senha deve ter no máximo 100 caracteres');
  }

  // Validação de tipo de usuário, se fornecido
  if (role && !Object.values(USER_TYPES).includes(role)) {
    errors.push(`Tipo de usuário inválido. Tipos válidos: ${Object.values(USER_TYPES).join(', ')}`);
  }

  return errors;
}

/**
 * Valida os dados de login
 * @param {Object} data - Dados do formulário de login
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateLogin(data) {
  const errors = [];
  const { email, password } = data;

  if (!email) {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(email)) {
    errors.push('Email inválido');
  }

  if (!password) {
    errors.push('Senha é obrigatória');
  }

  return errors;
}

/**
 * Valida os dados de atualização de função/tipo de usuário
 * @param {Object} data - Dados do formulário
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateRoleUpdate(data) {
  const errors = [];
  const { role } = data;

  if (!role) {
    errors.push('Tipo de usuário é obrigatório');
  } else if (!Object.values(USER_TYPES).includes(role)) {
    errors.push(`Tipo de usuário inválido. Tipos válidos: ${Object.values(USER_TYPES).join(', ')}`);
  }

  return errors;
}

/**
 * Verifica se um email é válido
 * @param {string} email - Email para validar
 * @returns {boolean} - Verdadeiro se o email for válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}