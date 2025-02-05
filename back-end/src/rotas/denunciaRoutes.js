import express from "express";
import DenunciaController from "../controllers/denunciaController.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // Importando middleware de autenticação

const router = express.Router();

// Rota para registrar denúncia (usuário precisa estar autenticado)
router.post("/enquetes/denunciar", authMiddleware, async (req, res, next) => {
    try {
        await DenunciaController.registrarDenuncia(req, res);
    } catch (error) {
        next(error); // Encaminha para o middleware de erro caso ocorra
    }
});

// Rota para listar todas as denúncias (somente administradores podem acessar)
router.get("/enquetes/denuncias", authMiddleware, async (req, res, next) => {
    try {
        await DenunciaController.listarDenuncias(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
