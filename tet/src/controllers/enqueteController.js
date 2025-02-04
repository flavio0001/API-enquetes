import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class EnqueteController {
    // Método para listar enquetes de um usuário
    static async listarEnquetes(req, res) {
        try {
            console.log("Listando enquetes para o usuário:", req.user.id);
            const userId = parseInt(req.user.id);

            const enquetes = await prisma.enquete.findMany({
                where: { autorId: userId },
                include: { opcoes: true },
            });

            if (enquetes.length === 0) {
                console.log("Nenhuma enquete encontrada para o usuário:", userId);
            } else {
                console.log("Enquetes encontradas:", enquetes);
            }

            res.status(200).json(enquetes);
        } catch (error) {
            console.error("Erro ao buscar enquetes para o usuário:", req.user.id, error.message);
            res.status(500).json({ message: "Erro ao buscar enquetes", error: error.message });
        }
    }

    // Método para listar todas as enquetes disponíveis
    static async listarTodasEnquetes(req, res) {
        try {
            console.log("Listando todas as enquetes disponíveis");

            const enquetes = await prisma.enquete.findMany({
                include: { opcoes: true },
            });

            console.log(`Total de enquetes encontradas: ${enquetes.length}`);
            res.status(200).json(enquetes);
        } catch (error) {
            console.error("Erro ao buscar todas as enquetes:", error.message);
            res.status(500).json({ message: "Erro ao buscar enquetes", error: error.message });
        }
    }

    // Método para criar uma nova enquete
    static async criarEnquete(req, res) {
        try {
            console.log("Dados recebidos para criação:", JSON.stringify(req.body, null, 2));
            const { titulo, descricao, dataFim, opcoes } = req.body;

            // Validações de campos obrigatórios
            if (!titulo || !descricao || !dataFim || !opcoes || !Array.isArray(opcoes) || opcoes.length === 0) {
                console.error("Erro de validação: campos obrigatórios ausentes ou inválidos");
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios e deve haver pelo menos uma opção válida.",
                });
            }

            // Valida e formata as opções
            const opcoesFormatadas = opcoes.map((opcao) => {
                if (typeof opcao === "string" && opcao.trim() !== "") {
                    return { texto: opcao.trim() };
                }
                throw new Error("Todas as opções devem ser strings não vazias.");
            });

            // Criação da enquete
            const novaEnquete = await prisma.enquete.create({
                data: {
                    titulo: titulo.trim(),
                    descricao: descricao.trim(),
                    dataFim: new Date(dataFim),
                    autorId: parseInt(req.user.id),
                    opcoes: {
                        create: opcoesFormatadas,
                    },
                },
            });

            console.log("Enquete criada com sucesso:", novaEnquete);
            res.status(201).json(novaEnquete);
        } catch (error) {
            console.error("Erro ao criar enquete:", error.message);
            res.status(500).json({ message: "Erro ao criar enquete.", error: error.message });
        }
    }

    // Método para votar em uma opção
    static async votarNaOpcao(req, res) {
        try {
            const { id } = req.params;
            console.log(`Recebendo voto para a opção ID: ${id}`);

        if (!id || isNaN(id)) {
            console.error("ID da opção inválido ou não fornecido.");
            return res.status(400).json({ message: "ID da opção é obrigatório e deve ser um número." });
        }

            // Verificar se a opção existe antes de atualizar
            const opcaoExistente = await prisma.opcao.findUnique({
                where: { id: parseInt(id) },
            });

            if (!opcaoExistente) {
                console.error(`Opção com ID ${id} não encontrada.`);
                return res.status(404).json({ message: "Opção não encontrada." });
            }

            const opcaoAtualizada = await prisma.opcao.update({
                where: { id: parseInt(id) },
                data: {
                    votos: {
                        increment: 1,
                    },
                },
            });

            console.log(`Voto registrado com sucesso para a opção ID: ${id}`, opcaoAtualizada);
            res.status(200).json({ message: "Voto registrado com sucesso!", novosVotos: opcaoAtualizada.votos });
        } catch (error) {
            console.error("Erro ao registrar voto:", error);
            res.status(500).json({ message: "Erro ao registrar voto.", error: error.message });
        }
    }

    // Método para buscar uma enquete por ID
    static async buscarEnquetePorId(req, res) {
        try {
            console.log("Buscando enquete com ID:", req.params.id);
            const enquete = await prisma.enquete.findUnique({
                where: { id: parseInt(req.params.id) },
                include: { opcoes: true },
            });

            if (!enquete) {
                console.error("Enquete não encontrada:", req.params.id);
                return res.status(404).json({ message: "Enquete não encontrada" });
            }

            console.log("Enquete encontrada:", enquete);
            res.status(200).json(enquete);
        } catch (error) {
            console.error("Erro ao buscar enquete:", error.message);
            res.status(400).json({ message: "Erro ao buscar enquete.", error: error.message });
        }
    }

    // Método para atualizar o título de uma enquete
    static async atualizarTitulo(req, res) {
        try {
            console.log("Atualizando título da enquete com ID:", req.params.id);
            const { titulo } = req.body;

            if (!titulo) {
                console.error("Erro de validação: título ausente");
                return res.status(400).json({ message: "O título é obrigatório" });
            }

            const enqueteAtualizada = await prisma.enquete.update({
                where: { id: parseInt(req.params.id) },
                data: { titulo: titulo.trim() },
            });

            console.log("Título atualizado com sucesso:", enqueteAtualizada);
            res.status(200).json(enqueteAtualizada);
        } catch (error) {
            console.error("Erro ao atualizar enquete:", error.message);
            res.status(400).json({ message: "Erro ao atualizar enquete.", error: error.message });
        }
    }

    // Método para excluir uma enquete
    static async excluirEnquete(req, res) {
        try {
            console.log("Excluindo enquete com ID:", req.params.id);

            await prisma.enquete.delete({
                where: { id: parseInt(req.params.id) },
            });

            console.log(`Enquete excluída com sucesso: ID ${req.params.id}`);
            res.status(200).json({ message: "Enquete excluída com sucesso" });
        } catch (error) {
            console.error("Erro ao excluir enquete:", error.message);
            res.status(400).json({ message: "Erro ao excluir enquete.", error: error.message });
        }
    }
}

export default EnqueteController;
