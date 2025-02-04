import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
    console.log(`🔍 Verificando autenticação para: ${req.method} ${req.path}`);

    // Ignorar a autenticação para rotas públicas
    if (req.path.startsWith("/public") || req.path.startsWith("/enquetes/public")) {
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("🚫 Acesso negado: Token não fornecido.");
        return res.status(401).json({ message: "Token não fornecido. Acesso negado!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(`✅ Usuário autenticado: ${decoded.username} (ID: ${decoded.id})`);
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            console.log("🚫 Token expirado.");
            return res.status(401).json({ message: "Token expirado. Faça login novamente!" });
        } else {
            console.log("🚫 Token inválido.");
            return res.status(403).json({ message: "Token inválido. Acesso negado!" });
        }
    }
};

export default authMiddleware;
