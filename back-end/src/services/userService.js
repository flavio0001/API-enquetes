import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import { AppError } from '../utils/errors/AppError.js';
import { SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth.js';
import { USER_TYPES } from '../config/constants.js';

/**
 * Serviço para lógica de negócio relacionada a usuários
 */
export class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} - Usuário criado
   */
  async registerUser(userData) {
    const { username, email, password, role } = userData;

    // Verifica dados obrigatórios
    if (!username || !email || !password) {
      throw new AppError('Todos os campos são obrigatórios.', 400);
    }

    // Verifica se o e-mail ou nome de usuário já estão em uso
    const existingUser = await this.repository.findByEmailOrUsername(email, username);
    if (existingUser) {
      throw new AppError('Usuário ou e-mail já estão em uso.', 400);
    }

    // Determina o tipo de usuário (CLIENTE por padrão)
    const userRole = role === USER_TYPES.ADMIN ? USER_TYPES.ADMIN : USER_TYPES.CLIENT;
    
    // Busca o ID do tipo de usuário
    const userType = await this.repository.findUserTypeByName(userRole);
    if (!userType) {
      throw new AppError('Tipo de usuário não encontrado.', 500);
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Cria o usuário
    const newUser = await this.repository.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      tipoId: userType.id,
    });

    return {
      userId: newUser.id,
      tipoId: userType.id
    };
  }

  /**
   * Autentica um usuário e retorna um token JWT
   * @param {Object} credentials - Credenciais do usuário
   * @returns {Promise<Object>} - Token e informações do usuário
   */
  async loginUser(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AppError('Email e senha são obrigatórios.', 400);
    }

    // Busca o usuário pelo email
    const user = await this.repository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    // Verifica se o usuário está ativo
    if (!user.ativo) {
      throw new AppError('Usuário desativado. Entre em contato com o administrador.', 403);
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    // Gera o token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        tipoId: user.tipoId, 
        tipoNome: user.tipo.nome 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const isAdmin = user.tipo.nome === USER_TYPES.ADMIN;

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.tipo.nome,
        isAdmin
      }
    };
  }

  /**
   * Lista todos os usuários
   * @returns {Promise<Array>} - Lista de usuários
   */
  async listUsers() {
    return this.repository.findAll();
  }

  /**
   * Atualiza o tipo de um usuário
   * @param {number} userId - ID do usuário
   * @param {string} role - Novo papel/tipo do usuário
   * @returns {Promise<Object>} - Mensagem de sucesso
   */
  async updateUserRole(userId, role) {
    // Validação do ID
    userId = parseInt(userId);
    if (isNaN(userId)) {
      throw new AppError('ID de usuário inválido.', 400);
    }

    // Verifica se o usuário existe
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    // Verifica se o novo tipo é válido
    if (!Object.values(USER_TYPES).includes(role)) {
      throw new AppError('Tipo de usuário inválido.', 400);
    }

    // Busca o ID do tipo de usuário
    const userType = await this.repository.findUserTypeByName(role);
    if (!userType) {
      throw new AppError('Tipo de usuário não encontrado.', 404);
    }

    // Se o usuário já tem esse tipo, não faz nada
    if (user.tipoId === userType.id) {
      return { message: 'Usuário já possui esse tipo.' };
    }

    // Atualiza o tipo do usuário
    await this.repository.updateUserType(userId, userType.id);

    return { 
      message: "Tipo de usuário atualizado com sucesso!",
      userId,
      newRole: role
    };
  }

  /**
   * Busca um usuário pelo ID com seu tipo
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} - Usuário encontrado
   */
  async findUserById(userId) {
    userId = parseInt(userId);
    if (isNaN(userId)) {
      throw new AppError('ID de usuário inválido.', 400);
    }

    const user = await this.repository.findById(userId, true);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return user;
  }

  /**
   * Atualiza o perfil de um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} userData - Dados do usuário a serem atualizados
   * @returns {Promise<Object>} - Usuário atualizado
   */
  async updateProfile(userId, userData) {
    userId = parseInt(userId);
    if (isNaN(userId)) {
      throw new AppError('ID de usuário inválido.', 400);
    }

    // Verifica se o usuário existe
    const user = await this.repository.findById(userId, true);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    // Verifica se o nome de usuário já está em uso (exceto pelo próprio usuário)
    if (userData.username && userData.username !== user.username) {
      const existingUser = await this.repository.findByUsername(userData.username);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Nome de usuário já está em uso.', 400);
      }
    }

    // Prepara os dados para atualização
    const updateData = {};
    
    if (userData.username) {
      updateData.username = userData.username;
    }

    // Se tiver nova senha, criptografa
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, SALT_ROUNDS);
    }

    // Atualiza o usuário
    const updatedUser = await this.repository.updateUser(userId, updateData);

    return updatedUser;
  }
}

export default new UserService(userRepository);