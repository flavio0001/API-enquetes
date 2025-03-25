import userService from '../services/userService.js';
import { AppError } from '../utils/errors/AppError.js';
import { validateUserRegistration, validateLogin, validateRoleUpdate } from '../utils/validators/userValidator.js';
import bcrypt from 'bcrypt';

/**
 * Controller para gerenciar requisições relacionadas a usuários
 */
export class UserController {
  /**
   * Registra um novo usuário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async register(req, res, next) {
    try {
      // Valida os dados de entrada
      const errors = validateUserRegistration(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const result = await userService.registerUser(req.body);
      
      return res.status(201).json({ 
        message: 'Usuário registrado com sucesso!', 
        userId: result.userId, 
        tipoId: result.tipoId 
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Autentica um usuário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async login(req, res, next) {
    try {
      // Valida os dados de entrada
      const errors = validateLogin(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const result = await userService.loginUser(req.body);
      
      return res.status(200).json({ 
        message: 'Login bem-sucedido!', 
        token: result.token,
        user: result.user
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Lista todos os usuários
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async listUsers(req, res, next) {
    try {
      // Verifica se o usuário tem permissão de administrador
      if (req.user.tipoNome !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
      }

      const users = await userService.listUsers();
      return res.status(200).json(users);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Atualiza o tipo de um usuário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async updateRole(req, res, next) {
    try {
      // Verifica se o usuário tem permissão de administrador
      if (req.user.tipoNome !== 'ADMINISTRADOR') {
        return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
      }

      // Valida os dados de entrada
      const errors = validateRoleUpdate(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Erro de validação', errors });
      }

      const result = await userService.updateUserRole(req.params.id, req.body.role);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Obtém o perfil do usuário atual
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   */
  getProfile(req, res) {
    // Utiliza os dados do middleware de autenticação
    const { id, username, tipoNome } = req.user;
    
    return res.status(200).json({
      id,
      username,
      role: tipoNome,
      isAdmin: tipoNome === 'ADMINISTRADOR'
    });
  }

  /**
   * Atualiza o perfil do usuário
   * @param {Request} req - Objeto de requisição Express
   * @param {Response} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async updateProfile(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { username, currentPassword, newPassword } = req.body;

      // Validação básica
      if (!username || username.trim().length < 3) {
        return res.status(400).json({ message: 'Nome de usuário deve ter pelo menos 3 caracteres.' });
      }

      // Se senha nova for fornecida, validar senha atual
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Senha atual é obrigatória para definir uma nova senha.' });
        }
        
        // Verificar senha atual
        const user = await userService.findUserById(userId);
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Senha atual incorreta.' });
        }
        
        if (newPassword.length < 6) {
          return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres.' });
        }
      }

      // Atualizar usuário
      const updatedUser = await userService.updateProfile(userId, {
        username,
        password: newPassword // será processado no serviço apenas se existir
      });

      return res.status(200).json({ 
        message: 'Perfil atualizado com sucesso!',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.tipo.nome,
          isAdmin: updatedUser.tipo.nome === 'ADMINISTRADOR'
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export default new UserController();