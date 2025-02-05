import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class DenunciaController {
    /**
     * Registra uma denúncia de enquete feita por um usuário
     */
    static async registrarDenuncia(req, res) {
        try {
            const userId = parseInt(req.user.id);
            const { enqueteId } = req.body;

            if (isNaN(enqueteId)) {
                return res.status(400).json({ message: "ID da enquete inválido." });
            }

            // Verifica se a enquete existe
            const enqueteExistente = await prisma.enquete.findUnique({
                where: { id: enqueteId },
            });

            if (!enqueteExistente) {
                return res.status(404).json({ message: "Enquete não encontrada." });
            }

            // Verifica se o usuário já denunciou esta enquete
            const denunciaExistente = await prisma.denuncia.findUnique({
                where: { userId_enqueteId: { userId, enqueteId } },
            });

            if (denunciaExistente) {
                return res.status(400).json({ message: "Você já denunciou esta enquete." });
            }

            // Registra a denúncia no banco de dados
            await prisma.denuncia.create({
                data: {
                    userId,
                    enqueteId,
                },
            });

            res.status(201).json({ message: "Denúncia registrada com sucesso!" });
        } catch (error) {
            console.error("Erro ao registrar denúncia:", error.message);
            res.status(500).json({ message: "Erro ao registrar denúncia.", error: error.message });
        }
    }

    /**
     * Lista todas as denúncias (apenas para administradores)
     */
    static async listarDenuncias(req, res) {
        try {
            // Busca todas as denúncias com detalhes do usuário e enquete
            const denuncias = await prisma.denuncia.findMany({
                include: {
                    user: { select: { username: true, email: true } },
                    enquete: { select: { titulo: true } },
                },
            });

            res.status(200).json(denuncias);
        } catch (error) {
            console.error("Erro ao listar denúncias:", error.message);
            res.status(500).json({ message: "Erro ao listar denúncias.", error: error.message });
        }
    }
}

export default DenunciaController;
