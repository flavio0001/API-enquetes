import authMiddleware from '../middlewares/authMiddleware.js';
import express from 'express';
import { registerUser, loginUser } from '../controllers/user-controller.js'; // Nome corrigido

const router = express.Router();

// Rota para registrar um novo usuário (rota aberta)
router.post('/register', async (req, res, next) => {
    try {
        await registerUser(req, res);
    } catch (error) {
        next(error); // Encaminha para o middleware de erros
    }
});

// Rota para autenticar um usuário (rota aberta)
router.post('/login', async (req, res, next) => {
    try {
        await loginUser(req, res);
    } catch (error) {
        next(error); // Encaminha para o middleware de erros
    }
});

// Exemplo de rota protegida para informações do perfil do usuário autenticado
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.username}!` });
});

// Log para depuração
console.log("Diretório atual:", process.cwd());

export default router;
