// src/services/denunciaService.js
import denunciaRepository from '../repositories/denunciaRepository.js';
import enqueteRepository from '../repositories/enqueteRepository.js';
import { COMPLAINT_STATUS } from '../config/constants.js';
import { AppError } from '../utils/errors/AppError.js';

/**
 * Serviço para lógica de negócio relacionada a denúncias
 */
export class DenunciaService {
  constructor(repository, enqueteRepo) {
    this.repository = repository;
    this.enqueteRepo = enqueteRepo;
  }

  /**
   * Registra uma nova denúncia
   * @param {number} userId - ID do usuário que está denunciando
   * @param {Object} denunciaData - Dados da denúncia
   * @returns {Promise<Object>} - Denúncia registrada
   */
  async registrarDenuncia(userId, denunciaData) {
    const { enqueteId, motivo } = denunciaData;
    
    // Validações básicas
    if (isNaN(enqueteId)) {
      throw new AppError('ID da enquete inválido.', 400);
    }

    // Verifica se a enquete existe
    const enquete = await this.enqueteRepo.findById(enqueteId);
    if (!enquete) {
      throw new AppError('Enquete não encontrada.', 404);
    }

    // Verifica se o usuário já denunciou esta enquete
    const denunciaExistente = await this.repository.findByUserAndEnquete(userId, enqueteId);
    if (denunciaExistente) {
      throw new AppError('Você já denunciou esta enquete.', 400);
    }

    // Registra a denúncia
    const denuncia = await this.repository.create({
      userId,
      enqueteId,
      motivo: motivo || null
    });

    return {
      id: denuncia.id,
      message: 'Denúncia registrada com sucesso!'
    };
  }

  /**
   * Lista todas as denúncias com opções de filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Promise<Object>} - Lista de denúncias e metadados
   */
  async listarDenuncias(options = {}) {
    // Valida o status, se fornecido
    if (options.status && !Object.values(COMPLAINT_STATUS).includes(options.status)) {
      throw new AppError('Status de denúncia inválido.', 400);
    }

    // Obtém denúncias com paginação
    const denuncias = await this.repository.findAll(options);
    const total = await this.repository.count({ status: options.status });
    
    // Calcula metadados de paginação
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      denuncias,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Obtém detalhes de uma denúncia específica
   * @param {number} id - ID da denúncia
   * @returns {Promise<Object>} - Denúncia encontrada
   */
  async obterDenuncia(id) {
    if (isNaN(id)) {
      throw new AppError('ID da denúncia inválido.', 400);
    }

    const denuncia = await this.repository.findById(id);
    if (!denuncia) {
      throw new AppError('Denúncia não encontrada.', 404);
    }

    return denuncia;
  }

  /**
   * Atualiza o status de uma denúncia
   * @param {number} id - ID da denúncia
   * @param {string} status - Novo status
   * @param {boolean} desativarEnquete - Se deve desativar a enquete (apenas para ACEITA)
   * @returns {Promise<Object>} - Resultado da operação
   */
  async atualizarStatus(id, status, desativarEnquete = false) {
    // Validações
    if (isNaN(id)) {
      throw new AppError('ID da denúncia inválido.', 400);
    }

    if (!Object.values(COMPLAINT_STATUS).includes(status)) {
      throw new AppError('Status de denúncia inválido.', 400);
    }

    // Verifica se a denúncia existe
    const denuncia = await this.repository.findById(id);
    if (!denuncia) {
      throw new AppError('Denúncia não encontrada.', 404);
    }

    // Se o status já é o mesmo, não faz nada
    if (denuncia.status === status) {
      return { 
        message: `A denúncia já está com o status ${status}.`,
        updated: false
      };
    }

    // Atualiza o status da denúncia
    await this.repository.updateStatus(id, status);

    // Se for aceita e solicitado, desativa a enquete
    if (status === COMPLAINT_STATUS.ACCEPTED && desativarEnquete) {
      await this.enqueteRepo.update(denuncia.enquete.id, { ativa: false });
      return { 
        message: 'Denúncia aceita e enquete desativada com sucesso.',
        updated: true,
        enqueteDesativada: true
      };
    }

    return { 
      message: `Status da denúncia atualizado para ${status}.`,
      updated: true,
      enqueteDesativada: false
    };
  }

  /**
   * Obtém resumo de denúncias para dashboard
   * @returns {Promise<Object>} - Dados para dashboard
   */
  async obterDashboard() {
    const summary = await this.repository.getDenunciasSummary();
    const enquetesMaisDenunciadas = await this.repository.findMostReportedEnquetes(5);

    return {
      summary,
      enquetesMaisDenunciadas
    };
  }
}

export default new DenunciaService(denunciaRepository, enqueteRepository);