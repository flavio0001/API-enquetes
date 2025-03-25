import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
const router = express.Router();

/**
 * @route POST /users/register
 * @desc Registra um novo usuário
 * @access Public
 */
router.post('/register', userController.register.bind(userController));

/**
 * @route POST /users/login
 * @desc Autentica um usuário e retorna um token JWT
 * @access Public
 */
router.post('/login', userController.login.bind(userController));

/**
 * @route GET /users/profile
 * @desc Retorna o perfil do usuário autenticado
 * @access Private
 */
router.get('/profile', authMiddleware, userController.getProfile.bind(userController));

/**
 * @route PUT /users/profile
 * @desc Atualiza o perfil do usuário autenticado
 * @access Private
 */
router.put('/profile', authMiddleware, userController.updateProfile.bind(userController));

/**
 * @route GET /users
 * @desc Lista todos os usuários (apenas administradores)
 * @access Private/Admin
 */
router.get('/', authMiddleware, adminMiddleware, userController.listUsers.bind(userController));

/**
 * @route PUT /users/:id/role
 * @desc Atualiza o tipo/função de um usuário (apenas administradores)
 * @access Private/Admin
 */
router.put('/:id/role', authMiddleware, adminMiddleware, userController.updateRole.bind(userController));

export default router;