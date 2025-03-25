import { prisma } from '../config/database.js';

/**
 * Repositório para operações de banco de dados relacionadas a usuários
 */
export class UserRepository {
  /**
   * Busca um usuário pelo email ou username
   * @param {string} email - Email do usuário
   * @param {string} username - Nome de usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async findByEmailOrUsername(email, username) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: email?.toLowerCase() },
          { username }
        ]
      }
    });
  }

  /**
   * Busca um usuário pelo email
   * @param {string} email - Email do usuário
   * @param {boolean} includeUserType - Se deve incluir o tipo de usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async findByEmail(email, includeUserType = false) {
    return prisma.user.findUnique({
      where: { email: email?.toLowerCase() },
      include: includeUserType ? { tipo: true } : undefined
    });
  }

  /**
   * Busca um usuário pelo nome de usuário
   * @param {string} username - Nome de usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  /**
   * Busca um tipo de usuário pelo nome
   * @param {string} nome - Nome do tipo de usuário
   * @returns {Promise<Object|null>} - Tipo de usuário encontrado ou null
   */
  async findUserTypeByName(nome) {
    return prisma.tipoUsuario.findUnique({
      where: { nome }
    });
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário para criar
   * @returns {Promise<Object>} - Usuário criado
   */
  async create(userData) {
    return prisma.user.create({
      data: userData
    });
  }

  /**
   * Lista todos os usuários com seus tipos
   * @returns {Promise<Array>} - Lista de usuários
   */
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        ativo: true,
        tipo: { select: { nome: true } },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { username: "asc" }
    });
  }

  /**
   * Atualiza o tipo de um usuário
   * @param {number} userId - ID do usuário
   * @param {number} tipoId - ID do tipo de usuário
   * @returns {Promise<Object>} - Usuário atualizado
   */
  async updateUserType(userId, tipoId) {
    return prisma.user.update({
      where: { id: userId },
      data: { tipoId }
    });
  }

  /**
   * Busca um usuário pelo ID
   * @param {number} id - ID do usuário
   * @param {boolean} includeUserType - Se deve incluir o tipo de usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async findById(id, includeUserType = false) {
    return prisma.user.findUnique({
      where: { id },
      include: includeUserType ? { tipo: true } : undefined
    });
  }

  /**
   * Atualiza os dados de um usuário
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados a serem atualizados
   * @returns {Promise<Object>} - Usuário atualizado
   */
  async updateUser(id, userData) {
    return prisma.user.update({
      where: { id },
      data: userData,
      include: { tipo: true }
    });
  }
}

export default new UserRepository();