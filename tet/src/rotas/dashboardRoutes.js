import express from "express";
import DashboardController from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const routes = express.Router();

// Rota protegida para exibir o dashboard
routes.get("/", authMiddleware, DashboardController.exibirDashboard);

export default routes;
