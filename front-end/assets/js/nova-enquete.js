document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formNovaEnquete");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Capturar os valores do formulário
        const titulo = document.getElementById("tituloEnquete").value.trim();
        const descricao = document.getElementById("descricaoEnquete").value.trim();
        const opcoesTexto = document.getElementById("opcoesEnquete").value.trim();
        const dataFim = document.getElementById("dataFimEnquete").value;

        // Validar campos obrigatórios
        if (!titulo || !descricao || !opcoesTexto || !dataFim) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        // Validar se `dataFim` é uma data válida e futura
        const dataFimObj = new Date(dataFim);
        const hoje = new Date();
        if (isNaN(dataFimObj.getTime()) || dataFimObj <= hoje) {
            alert("A data de término deve ser uma data futura válida.");
            return;
        }

        // Transformar as opções em um array (separadas por nova linha "\n")
        const opcoes = opcoesTexto.split("\n").map(opcao => opcao.trim()).filter(opcao => opcao !== "");

        if (opcoes.length === 0) {
            alert("Adicione pelo menos uma opção válida.");
            return;
        }

        // Criar objeto da enquete
        const enqueteData = {
            titulo,
            descricao,
            dataFim,
            opcoes
        };

        try {
            const token = localStorage.getItem("token"); // Pegando o token de autenticação

            const response = await fetch("http://localhost:8000/enquetes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(enqueteData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Enquete criada com sucesso!");
                window.location.href = "../security/dashboard-area-do-usuario.html"; // Redireciona para o painel
            } else {
                alert("Erro ao criar enquete: " + result.message);
                console.error("Erro ao criar enquete:", result);
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
            console.error("Erro ao enviar requisição:", error);
        }
    });
});