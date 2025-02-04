import express from "express";
import EnqueteController from "../controllers/enqueteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const routes = express.Router();

// Rota pública para listar todas as enquetes disponíveis
routes.get("/public", EnqueteController.listarTodasEnquetes);

// Rota protegida para registrar voto em uma opção específica
routes.post("/opcoes/:id/votar", authMiddleware, EnqueteController.votarNaOpcao);

// Rotas protegidas (necessitam de autenticação)
routes.get("/", authMiddleware, EnqueteController.listarEnquetes);
routes.post("/", authMiddleware, EnqueteController.criarEnquete);
routes.get("/:id", authMiddleware, EnqueteController.buscarEnquetePorId);
routes.put("/:id", authMiddleware, EnqueteController.atualizarTitulo);
routes.delete("/:id", authMiddleware, EnqueteController.excluirEnquete);

export default routes;
