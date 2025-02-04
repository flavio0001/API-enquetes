import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class EnqueteController {
    // Método para listar enquetes de um usuário
    static async listarEnquetes(req, res) {
        try {
            const userId = parseInt(req.user.id);
            if (isNaN(userId)) {
                return res.status(400).json({ message: "ID do usuário inválido." });
            }

            console.log("Listando enquetes para o usuário:", userId);

            const enquetes = await prisma.enquete.findMany({
                where: { autorId: userId },
                include: { opcoes: true, autor: true },
            });

            res.status(200).json(enquetes);
        } catch (error) {
            console.error("Erro ao buscar enquetes:", error.message);
            res.status(500).json({ message: "Erro ao buscar enquetes", error: error.message });
        }
    }

    // Método para listar todas as enquetes disponíveis
    static async listarTodasEnquetes(req, res) {
        try {
            console.log("Listando todas as enquetes disponíveis");

            const enquetes = await prisma.enquete.findMany({
                include: { opcoes: true, autor: { select: { username: true, email: true } } },
            });

            res.status(200).json(enquetes);
        } catch (error) {
            console.error("Erro ao buscar enquetes:", error.message);
            res.status(500).json({ message: "Erro ao buscar enquetes", error: error.message });
        }
    }

    // Método para criar uma nova enquete
    static async criarEnquete(req, res) {
        try {
            const { titulo, descricao, dataFim, opcoes } = req.body;
            const autorId = parseInt(req.user.id);

            if (!titulo || !descricao || !dataFim || !Array.isArray(opcoes) || opcoes.length === 0 || isNaN(autorId)) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios." });
            }

            const novaEnquete = await prisma.enquete.create({
                data: {
                    titulo,
                    descricao,
                    dataFim: new Date(dataFim),
                    autorId,
                    opcoes: { create: opcoes.map(texto => ({ texto })) },
                },
            });

            res.status(201).json(novaEnquete);
        } catch (error) {
            console.error("Erro ao criar enquete:", error.message);
            res.status(500).json({ message: "Erro ao criar enquete.", error: error.message });
        }
    }

    // Método para votar em uma opção
    static async votarNaOpcao(req, res) {
        try {
            const opcaoId = parseInt(req.params.id);
            const userId = parseInt(req.user.id);

            if (isNaN(opcaoId) || isNaN(userId)) {
                return res.status(400).json({ message: "ID inválido." });
            }

            console.log(`Usuário ${userId} tentando votar na opção ${opcaoId}...`);

            // Verifica se a opção existe
            const opcaoExistente = await prisma.opcao.findUnique({
                where: { id: opcaoId },
                include: { enquete: true },
            });

            if (!opcaoExistente) {
                return res.status(404).json({ message: "Opção não encontrada." });
            }

            const enqueteId = opcaoExistente.enqueteId;

            // Verifica se o usuário já votou em alguma opção dessa enquete
            const votoExistente = await prisma.voto.findFirst({
                where: {
                    userId,
                    opcao: {
                        enqueteId: enqueteId, // 🔥 Correção aplicada aqui
                    },
                },
            });

            if (votoExistente) {
                console.log(`Removendo voto anterior do usuário ${userId} na enquete ${enqueteId}...`);
                await prisma.voto.delete({ where: { id: votoExistente.id } });
            }

            // Registra o novo voto
            await prisma.voto.create({
                data: {
                    userId,
                    opcaoId,
                },
            });

            console.log(`Voto registrado com sucesso para a opção ${opcaoId}.`);
            res.status(200).json({ message: "Voto registrado com sucesso!" });

        } catch (error) {
            console.error("Erro ao registrar voto:", error);
            res.status(500).json({ message: "Erro ao registrar voto.", error: error.message });
        }
    }

    // Método para atualizar o título de uma enquete
    static async atualizarTitulo(req, res) {
        try {
            const { titulo } = req.body;
            const enqueteId = parseInt(req.params.id);

            if (!titulo || isNaN(enqueteId)) {
                return res.status(400).json({ message: "Dados inválidos." });
            }

            // Verifica se a enquete existe antes de atualizar
            const enqueteExistente = await prisma.enquete.findUnique({
                where: { id: enqueteId },
            });

            if (!enqueteExistente) {
                return res.status(404).json({ message: "Enquete não encontrada." });
            }

            const enqueteAtualizada = await prisma.enquete.update({
                where: { id: enqueteId },
                data: { titulo: titulo.trim() }
            });

            res.status(200).json(enqueteAtualizada);
        } catch (error) {
            console.error("Erro ao atualizar título:", error.message);
            res.status(500).json({ message: "Erro ao atualizar título.", error: error.message });
        }
    }

    // Método para buscar uma enquete por ID
    static async buscarEnquetePorId(req, res) {
        try {
            const enqueteId = parseInt(req.params.id);
            if (isNaN(enqueteId)) {
                return res.status(400).json({ message: "ID inválido." });
            }

            const enquete = await prisma.enquete.findUnique({
                where: { id: enqueteId },
                include: { opcoes: true, autor: { select: { username: true } } },
            });

            if (!enquete) {
                return res.status(404).json({ message: "Enquete não encontrada" });
            }

            res.status(200).json(enquete);
        } catch (error) {
            console.error("Erro ao buscar enquete:", error.message);
            res.status(500).json({ message: "Erro ao buscar enquete.", error: error.message });
        }
    }

    // Método para excluir uma enquete
    static async excluirEnquete(req, res) {
        try {
            const enqueteId = parseInt(req.params.id);
            if (isNaN(enqueteId)) {
                return res.status(400).json({ message: "ID inválido." });
            }

            await prisma.enquete.delete({ where: { id: enqueteId } });

            res.status(200).json({ message: "Enquete excluída com sucesso" });
        } catch (error) {
            console.error("Erro ao excluir enquete:", error.message);
            res.status(500).json({ message: "Erro ao excluir enquete.", error: error.message });
        }
    }
}

export default EnqueteController;
