// src/utils/validators/enqueteValidator.js

/**
 * Valida os dados de criação de uma enquete
 * @param {Object} data - Dados do formulário de criação de enquete
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateEnqueteCreation(data) {
  const errors = [];
  const { titulo, descricao, dataFim, opcoes } = data;

  // Validação do título
  if (!titulo) {
    errors.push('O título da enquete é obrigatório');
  } else if (titulo.length < 5) {
    errors.push('O título deve ter pelo menos 5 caracteres');
  } else if (titulo.length > 100) {
    errors.push('O título deve ter no máximo 100 caracteres');
  }

  // Validação da descrição
  if (!descricao) {
    errors.push('A descrição da enquete é obrigatória');
  } else if (descricao.length > 500) {
    errors.push('A descrição deve ter no máximo 500 caracteres');
  }

  // Validação da data de término
  if (!dataFim) {
    errors.push('A data de término é obrigatória');
  } else {
    const dataFimObj = new Date(dataFim);
    const agora = new Date();
    
    if (isNaN(dataFimObj.getTime())) {
      errors.push('A data de término é inválida');
    } else if (dataFimObj <= agora) {
      errors.push('A data de término deve ser no futuro');
    }
  }

  // Validação das opções
  if (!opcoes) {
    errors.push('As opções são obrigatórias');
  } else {
    let opcoesParaValidar = [];

    if (typeof opcoes === 'string') {
      opcoesParaValidar = opcoes.split('\n')
        .map(op => op.trim())
        .filter(op => op.length > 0);
    } else if (Array.isArray(opcoes)) {
      opcoesParaValidar = opcoes
        .map(op => typeof op === 'string' ? op.trim() : op.texto?.trim())
        .filter(op => op && op.length > 0);
    }

    if (opcoesParaValidar.length < 2) {
      errors.push('A enquete deve ter pelo menos 2 opções válidas');
    }

    // Verificar opções duplicadas
    const opcoesUnicas = new Set(opcoesParaValidar);
    if (opcoesUnicas.size !== opcoesParaValidar.length) {
      errors.push('Não são permitidas opções duplicadas');
    }
  }

  return errors;
}

/**
 * Valida os dados de um comentário
 * @param {Object} data - Dados do comentário
 * @returns {Array} - Array de erros, vazio se não houver erros
 */
export function validateComentario(data) {
  const errors = [];
  const { texto } = data;

  if (!texto) {
    errors.push('O texto do comentário é obrigatório');
  } else if (texto.trim().length === 0) {
    errors.push('O comentário não pode ser vazio');
  } else if (texto.length > 1000) {
    errors.push('O comentário deve ter no máximo 1000 caracteres');
  }

  return errors;
}
