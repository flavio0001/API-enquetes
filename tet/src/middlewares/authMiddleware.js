import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
    // Ignorar a autenticação para rotas públicas
    if (req.path === "/public" || req.path === "/enquetes/public") {
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token não fornecido. Acesso negado!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário à requisição
        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido. Acesso negado!" });
    }
};

export default authMiddleware;
