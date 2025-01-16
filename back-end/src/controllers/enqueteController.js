import Enquete from "../models/Enquete.js";

class EnqueteController {
    static async listarEnquetes(req, res) {
        try {
            const enquetes = await Enquete.find();
            res.status(200).json(enquetes);
        } catch (error) {
            res.status(500).send("Erro ao buscar enquetes");
        }
    }

    static async criarEnquete(req, res) {
        try {
            const { título, opções, autor } = req.body;
            if (!título || !opções || !autor) {
                return res.status(400).send("Todos os campos são obrigatórios");
            }
            const novaEnquete = new Enquete({ título, opções, autor });
            await novaEnquete.save();
            res.status(201).json(novaEnquete);
        } catch (error) {
            res.status(400).send("Erro ao criar enquete");
        }
    }

    static async buscarEnquetePorId(req, res) {
        try {
            const enquete = await Enquete.findById(req.params.id); // Busca enquete pelo ID
            if (!enquete) {
                return res.status(404).send("Enquete não encontrada");
            } // Se não encontrar, retorna 404
            res.status(200).json(enquete); // Se encontrar, retorna a enquete
        } catch (error) {
            res.status(400).send("Erro ao buscar enquete"); // Se der erro, retorna 400
        }
    }

    static async atualizarTitulo(req, res) {
        try {
            const { título } = req.body; // Pega o novo título do corpo da requisição
            if (!título) {
                return res.status(400).send("O título é obrigatório");
            } // Se não tiver título, retorna 400
            const enqueteAtualizada = await Enquete.findByIdAndUpdate(
                req.params.id,
                { título },
                { new: true }
            ); // Atualiza o título da enquete
            if (!enqueteAtualizada) {
                return res.status(404).send("Enquete não encontrada");
            } // Se não encontrar a enquete, retorna 404
            res.status(200).json(enqueteAtualizada); // Se encontrar, retorna a enquete atualizada
        } catch (error) {
            res.status(400).send("Erro ao atualizar enquete");
        } // Se der erro, retorna 400
    }

    static async excluirEnquete(req, res) { // Método para excluir enquete
        try {
            const enqueteExcluida = await Enquete.findByIdAndDelete(req.params.id);
            if (!enqueteExcluida) {
                return res.status(404).send("Enquete não encontrada");
            } // Se não encontrar a enquete, retorna 404
            res.status(200).send("Enquete excluída com sucesso");
        } catch (error) {
            res.status(400).send("Erro ao excluir enquete");
        } // Se der erro, retorna 400
    }
}

export default EnqueteController;
