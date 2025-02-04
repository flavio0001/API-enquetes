document.addEventListener("DOMContentLoaded", async () => {
    const listaEnquetes = document.getElementById("lista-enquetes");
    let votosUsuario = {}; // Objeto para armazenar os votos do usuário

    // Exibir notificações sem alert()
    function exibirMensagem(tipo, mensagem) {
        let toastContainer = document.getElementById("toast-container");

        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toast-container";
            toastContainer.className = "position-fixed top-0 end-0 p-3";
            toastContainer.style.zIndex = "1050";
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-bg-${tipo} border-0 show`;
        toast.role = "alert";
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${mensagem}</div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Carregar todas as enquetes disponíveis
    async function carregarEnquetes() {
        try {
            console.log("📤 Buscando enquetes públicas...");
            const response = await fetch("http://localhost:8000/enquetes/public");

            if (!response.ok) throw new Error("Erro ao carregar enquetes.");

            let enquetes = await response.json();
            enquetes.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

            listaEnquetes.innerHTML = "";

            if (enquetes.length === 0) {
                listaEnquetes.innerHTML = "<p class='text-center'>Nenhuma enquete disponível.</p>";
                return;
            }

            enquetes.forEach(enquete => {
                const div = document.createElement("div");
                div.className = "col-md-6 mb-3";

                div.innerHTML = `
                    <button class="btn btn-outline-primary w-100" onclick="abrirModal(${enquete.id})">
                        ${enquete.titulo}
                    </button>
                `;

                listaEnquetes.appendChild(div);
            });

            // Carregar os votos do usuário no banco de dados
            await carregarVotosUsuario();
        } catch (error) {
            console.error("❌ Erro ao carregar enquetes:", error);
            listaEnquetes.innerHTML = "<p class='text-danger text-center'>Erro ao carregar enquetes.</p>";
        }
    }

    // Obter os votos do usuário
    async function carregarVotosUsuario() {
        let token = localStorage.getItem("token");

        if (!token) return;

        try {
            const response = await fetch("http://localhost:8000/enquetes/votos", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const votos = await response.json();
                votosUsuario = votos.reduce((acc, voto) => {
                    acc[voto.enqueteId] = voto.opcaoId;
                    return acc;
                }, {});
                console.log("📊 Votos do usuário carregados:", votosUsuario);
            } else {
                console.warn("⚠ Nenhum voto encontrado para este usuário.");
            }
        } catch (error) {
            console.error("❌ Erro ao carregar votos do usuário:", error);
        }
    }

    // Abrir o modal da enquete
    window.abrirModal = async (id) => {
        try {
            console.log(`🔍 Buscando detalhes da enquete ID: ${id}...`);

            let token = localStorage.getItem("token");

            if (!token) {
                exibirMensagem("warning", "Você precisa estar logado para acessar esta enquete.");
                window.location.href = "login.html";
                return;
            }

            const response = await fetch(`http://localhost:8000/enquetes/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Erro ao buscar detalhes da enquete.");

            const enquete = await response.json();
            console.log("✅ Enquete carregada:", enquete);

            document.getElementById("modalTitulo").innerText = enquete.titulo;
            document.getElementById("modalDescricao").innerText = enquete.descricao;

            // Adicionar opções de votação
            const opcoesContainer = document.getElementById("modalOpcoes");
            opcoesContainer.innerHTML = "";

            let opcaoVotada = votosUsuario[id] || null;

            enquete.opcoes.forEach(opcao => {
                const btn = document.createElement("button");
                btn.className = "btn btn-outline-secondary d-block w-100 mt-2";
                btn.innerText = `${opcao.texto} (${opcao.votos ?? 0} votos)`;
                btn.onclick = () => votarOpcao(enquete.id, opcao.id);

                // Se já votou, destacar a opção votada
                if (opcaoVotada) {
                    if (opcaoVotada === opcao.id) {
                        btn.classList.add("btn-success");
                    } else {
                        btn.disabled = true;
                    }
                }

                opcoesContainer.appendChild(btn);
            });

            // Mostrar o modal
            const modal = new bootstrap.Modal(document.getElementById("modalEnquete"));
            modal.show();
        } catch (error) {
            console.error("❌ Erro ao abrir modal:", error);
            exibirMensagem("danger", "Erro ao carregar detalhes da enquete.");
        }
    };

    // Função para votar em uma opção
    async function votarOpcao(idEnquete, idOpcao) {
        let token = localStorage.getItem("token");

        if (!token) {
            exibirMensagem("warning", "Você precisa estar logado para votar.");
            return;
        }

        // 🔥 Verifica se o usuário já votou nesta enquete
        if (votosUsuario[idEnquete]) {
            exibirMensagem("danger", "❌ Você já votou nesta enquete!");
            return;
        }

        try {
            console.log(`🗳️ Enviando voto para opção ID: ${idOpcao}...`);

            // Registrar o novo voto no banco
            const response = await fetch(`http://localhost:8000/enquetes/opcoes/${idOpcao}/votar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const resultado = await response.json();
            console.log("📩 Resposta do servidor:", resultado);

            if (!response.ok) throw new Error(resultado.message || "Erro ao votar.");

            // Atualiza localmente o voto do usuário
            votosUsuario[idEnquete] = idOpcao; // 🔥 Agora salva no objeto de votos

            exibirMensagem("success", "✅ Seu voto foi registrado com sucesso!");

            // 🔄 Atualiza os votos no frontend e recarrega enquetes
            await carregarVotosUsuario();
            await carregarEnquetes();
        } catch (error) {
            console.error("❌ Erro ao votar:", error);
            exibirMensagem("danger", "Erro ao registrar voto.");
        }
    }

    // Carregar enquetes ao abrir a página
    await carregarEnquetes();
});
