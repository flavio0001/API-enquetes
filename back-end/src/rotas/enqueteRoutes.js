import express from "express";
import EnqueteController from "../controllers/enqueteController.js";

const routes = express.Router();

routes.get("/enquetes", EnqueteController.listarEnquetes);
routes.post("/enquetes", EnqueteController.criarEnquete);
routes.get("/enquetes/:id", EnqueteController.buscarEnquetePorId);
routes.put("/enquetes/:id", EnqueteController.atualizarTitulo);
routes.delete("/enquetes/:id", EnqueteController.excluirEnquete);

export default routes;
