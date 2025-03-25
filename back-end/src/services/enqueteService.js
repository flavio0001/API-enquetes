// src/services/enqueteService.js
import enqueteRepository from '../repositories/enqueteRepository.js';
import { AppError } from '../utils/errors/AppError.js';

export class EnqueteService {
  constructor(repository) {
    this.repository = repository;
  }

  async listarEnquetesPorUsuario(userId) {
    if (isNaN(userId)) {
      throw new AppError('ID do usuário inválido.', 400);
    }

    return this.repository.findByUser(userId);
  }

  async listarTodasEnquetes(options = {}) {
    return this.repository.findAll(options);
  }

  async criarEnquete(enqueteData, autorId) {
    const { titulo, descricao, dataFim, opcoes } = enqueteData;

    if (!titulo || !descricao || !dataFim || !opcoes) {
      throw new AppError('Todos os campos são obrigatórios.', 400);
    }

    if (isNaN(autorId)) {
      throw new AppError('ID do autor inválido.', 400);
    }

    let opcoesFormatadas = [];

    if (typeof opcoes === "string") {
      opcoesFormatadas = opcoes.split("\n")
        .map(op => op.trim())
        .filter(op => op.length > 0);
    } 
    else if (Array.isArray(opcoes)) {
      opcoesFormatadas = opcoes
        .map(op => typeof op === 'string' ? op.trim() : op.texto.trim())
        .filter(op => op.length > 0);
    } 
    else {
      throw new AppError('Formato inválido para as opções.', 400);
    }

    if (opcoesFormatadas.length < 2) {
      throw new AppError('A enquete precisa ter pelo menos duas opções válidas.', 400);
    }

    const dataFimObj = new Date(dataFim);
    if (isNaN(dataFimObj.getTime()) || dataFimObj <= new Date()) {
      throw new AppError('A data de término deve ser uma data futura válida.', 400);
    }

    return this.repository.create({
      titulo,
      descricao,
      dataFim: dataFimObj,
      autorId,
      opcoes: opcoesFormatadas
    });
  }

  async votarNaOpcao(opcaoId, userId) {
    if (isNaN(opcaoId) || isNaN(userId)) {
      throw new AppError('ID inválido.', 400);
    }

    const opcao = await this.repository.findOpcaoById(opcaoId);
    if (!opcao) {
      throw new AppError('Opção não encontrada.', 404);
    }

    const enqueteId = opcao.enqueteId;
    
    const enquete = await this.repository.findById(enqueteId);
    if (!enquete.ativa || new Date(enquete.dataFim) < new Date()) {
      throw new AppError('Esta enquete não está mais ativa.', 400);
    }

    const votosExistentes = await this.repository.findVotosByUserAndEnquete(userId, enqueteId);

    const votoExistente = votosExistentes.find(voto => voto.opcaoId === opcaoId);
    if (votoExistente) {
      await this.repository.deleteVoto(votoExistente.id);
      return { 
        message: 'Voto removido.', 
        action: 'removed', 
        opcaoId: votoExistente.opcaoId 
      };
    }

    if (votosExistentes.length > 0) {
      await this.repository.deleteVoto(votosExistentes[0].id);
    }

    const novoVoto = await this.repository.createVoto(userId, opcaoId);
    return { 
      message: 'Voto registrado com sucesso!', 
      action: 'created', 
      opcaoId: novoVoto.opcaoId 
    };
  }

  async buscarEnquetePorId(enqueteId) {
    if (isNaN(enqueteId)) {
      throw new AppError('ID inválido.', 400);
    }

    const enquete = await this.repository.findById(enqueteId);
    if (!enquete) {
      throw new AppError('Enquete não encontrada.', 404);
    }

    return enquete;
  }

  async excluirEnquete(enqueteId, userId) {
    if (isNaN(enqueteId)) {
      throw new AppError('ID inválido.', 400);
    }

    const enquete = await this.repository.findById(enqueteId);
    if (!enquete) {
      throw new AppError('Enquete não encontrada.', 404);
    }

    const isOwner = await this.repository.isOwner(enqueteId, userId);
    if (!isOwner && userId !== 1) {
      throw new AppError('Você não tem permissão para excluir esta enquete.', 403);
    }

    await this.repository.delete(enqueteId);
    return { message: 'Enquete excluída com sucesso' };
  }
  
  async adicionarComentario(enqueteId, userId, texto) {
    // Implementar lógica para adicionar comentários quando o modelo estiver pronto
  }

  async buscarVotoPorUsuarioEEnquete(userId, enqueteId) {
    if (isNaN(userId) || isNaN(enqueteId)) {
      throw new AppError('ID inválido.', 400);
    }

    const votos = await this.repository.findVotosByUserAndEnquete(userId, enqueteId);
    
    return votos.length > 0 ? votos[0] : null;
  }
}

export default new EnqueteService(enqueteRepository);