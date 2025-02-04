document.addEventListener("DOMContentLoaded", async () => {
    const listaEnquetes = document.getElementById("lista-enquetes");
    let votosUsuario = {}; 

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

    async function carregarEnquetes() {
        try {
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
                const totalVotos = enquete.opcoes.reduce((acc, opcao) => acc + (opcao._count?.votosRegistro || 0), 0);

                const div = document.createElement("div");
                div.className = "col-md-6 mb-3";

                div.innerHTML = `
                    <button class="btn btn-outline-primary w-100" onclick="abrirModal(${enquete.id})">
                        ${enquete.titulo} (${totalVotos} votos)
                    </button>
                `;

                listaEnquetes.appendChild(div);
            });

            await carregarVotosUsuario();
        } catch (error) {
            console.error("Erro ao carregar enquetes:", error);
            listaEnquetes.innerHTML = "<p class='text-danger text-center'>Erro ao carregar enquetes.</p>";
        }
    }

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
            }
        } catch (error) {
            console.error("Erro ao carregar votos do usuário:", error);
        }
    }

    window.abrirModal = async (id) => {
        try {
            let token = localStorage.getItem("token");

            if (!token) {
                exibirMensagem("warning", "Você precisa estar logado para acessar esta enquete.");
                window.location.href = "dashboard.html";
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

            document.getElementById("modalTitulo").innerText = enquete.titulo;
            document.getElementById("modalDescricao").innerText = enquete.descricao;

            const opcoesContainer = document.getElementById("modalOpcoes");
            opcoesContainer.innerHTML = "";

            await carregarVotosUsuario();
            let opcaoVotada = votosUsuario[id] || null;

            enquete.opcoes.forEach(opcao => {
                const totalVotos = opcao._count?.votosRegistro || 0;

                const btn = document.createElement("button");
                btn.className = "btn btn-outline-secondary d-block w-100 mt-2";
                btn.innerText = `${opcao.texto} (${totalVotos} votos)`;
                btn.onclick = () => votarOpcao(enquete.id, opcao.id);

                if (opcaoVotada) {
                    if (opcaoVotada === opcao.id) {
                        btn.classList.add("btn-success");
                    } else {
                        btn.disabled = true;
                    }
                }

                opcoesContainer.appendChild(btn);
            });

            const modal = new bootstrap.Modal(document.getElementById("modalEnquete"));
            modal.show();
        } catch (error) {
            console.error("Erro ao abrir modal:", error);
            exibirMensagem("danger", "Erro ao carregar detalhes da enquete.");
        }
    };

    async function votarOpcao(idEnquete, idOpcao) {
        let token = localStorage.getItem("token");

        if (!token) {
            exibirMensagem("warning", "Você precisa estar logado para votar.");
            return;
        }

        if (votosUsuario[idEnquete] && votosUsuario[idEnquete] === idOpcao) {
            try {
                const response = await fetch(`http://localhost:8000/enquetes/opcoes/${idOpcao}/votar`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const resultado = await response.json();

                if (!response.ok) throw new Error(resultado.message || "Erro ao remover voto.");

                delete votosUsuario[idEnquete];

                exibirMensagem("success", "Seu voto foi removido com sucesso.");

                await carregarVotosUsuario();
                await carregarEnquetes();
                abrirModal(idEnquete);
            } catch (error) {
                console.error("Erro ao remover voto:", error);
                exibirMensagem("danger", "Erro ao remover voto.");
            }
            return;
        }

        if (votosUsuario[idEnquete]) {
            exibirMensagem("danger", "Você já votou nesta enquete.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/enquetes/opcoes/${idOpcao}/votar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const resultado = await response.json();

            if (!response.ok) throw new Error(resultado.message || "Erro ao votar.");

            votosUsuario[idEnquete] = idOpcao;

            exibirMensagem("success", "Seu voto foi registrado com sucesso.");

            await carregarVotosUsuario();
            await carregarEnquetes();
            abrirModal(idEnquete);
        } catch (error) {
            console.error("Erro ao votar:", error);
            exibirMensagem("danger", "Erro ao registrar voto.");
        }
    }

    await carregarEnquetes();
});
