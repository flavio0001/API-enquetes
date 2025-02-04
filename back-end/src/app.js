import express from "express";
import cors from "cors"; 
import errorHandler from "./middlewares/error-handler.js";
import enqueteRoutes from "./rotas/enqueteRoutes.js";
import userRoutes from "./rotas/user-routes.js"; 
import DashboardRoutes from "./rotas/dashboardRoutes.js";

const app = express();

// ✅ Configuração de CORS para permitir qualquer origem
app.use(cors({
    origin: "*", // Permite requisições de qualquer origem
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

// ✅ Desativando Content Security Policy (CSP)
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(express.json());

// Rotas principais
app.use("/", DashboardRoutes);
app.use("/enquetes", enqueteRoutes);
app.use("/users", userRoutes); 

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
