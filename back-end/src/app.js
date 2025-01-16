import express from "express";
import cors from "cors"; // Importa o CORS
import errorHandler from "./middlewares/error-handler.js";
import enqueteRoutes from "./rotas/enqueteRoutes.js";
import userRoutes from "./rotas/user-routes.js"; // Importa as rotas de usuários

const app = express();

// Configuração de middlewares
app.use(cors()); // Habilita o CORS
app.use(express.json());

// Rotas principais
app.use("/", enqueteRoutes);
app.use("/users", userRoutes); // Rotas relacionadas aos usuários

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
