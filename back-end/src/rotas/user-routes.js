import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { registerUser, loginUser, listarUsuarios, atualizarTipoUsuario } from '../controllers/user-controller.js'; // ✅ Adicionada a função atualizarTipoUsuario

const router = express.Router();

// Rota para registrar um novo usuário (rota aberta)
router.post('/register', async (req, res, next) => {
    try {
        await registerUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Rota para autenticar um usuário (rota aberta)
router.post('/login', async (req, res, next) => {
    try {
        await loginUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Rota protegida para obter informações do perfil do usuário autenticado
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.username}!` });
});

// Rota protegida para listar todos os usuários
router.get('/list', authMiddleware, async (req, res, next) => {
    try {
        await listarUsuarios(req, res);
    } catch (error) {
        next(error);
    }
});

// ✅ Rota protegida para atualizar o tipo de usuário (Administrador <-> Cliente)
router.put('/:id/update-role', authMiddleware, async (req, res, next) => {
    try {
        await atualizarTipoUsuario(req, res);
    } catch (error) {
        next(error);
    }
});

// Log para depuração
console.log("Diretório atual:", process.cwd());

export default router;
