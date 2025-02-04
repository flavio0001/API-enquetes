import express from "express";
import cors from "cors"; // Importa o CORS
import errorHandler from "./middlewares/error-handler.js";
import enqueteRoutes from "./rotas/enqueteRoutes.js";
import userRoutes from "./rotas/user-routes.js"; // Importa as rotas de usuários
import DashboardController from "./controllers/dashboardController.js";
import DashboardRoutes from "./rotas/dashboardRoutes.js";
const app = express();

// Configuração de middlewares
app.use(cors());
app.use(express.json());

// Rotas principais
app.use("/", DashboardRoutes);
app.use("/enquetes", enqueteRoutes);
app.use("/users", userRoutes); // Rotas relacionadas aos usuários

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
