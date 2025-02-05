document.addEventListener("DOMContentLoaded", async () => {
    const listaEnquetes = document.getElementById("lista-enquetes");

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
            const token = localStorage.getItem("token");
            if (!token) {
                exibirMensagem("warning", "Você precisa estar logado como administrador.");
                window.location.href = "login.html";
                return;
            }

            const response = await fetch("http://localhost:8000/enquetes/public", {
                headers: { "Authorization": `Bearer ${token}` }
            });

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
        } catch (error) {
            console.error("Erro ao carregar enquetes:", error);
            listaEnquetes.innerHTML = "<p class='text-danger text-center'>Erro ao carregar enquetes.</p>";
        }
    }

    window.abrirModal = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                exibirMensagem("warning", "Você precisa estar logado como administrador.");
                return;
            }

            const response = await fetch(`http://localhost:8000/enquetes/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao buscar detalhes da enquete.");

            const enquete = await response.json();

            document.getElementById("modalTitulo").innerText = enquete.titulo;
            document.getElementById("modalDescricao").innerText = enquete.descricao;
            document.getElementById("modalAutorId").innerText = enquete.autor.id;
            document.getElementById("modalAutorNome").innerText = enquete.autor.username;
            document.getElementById("modalCriadoEm").innerText = new Date(enquete.criadoEm).toLocaleString();
            document.getElementById("modalDataFim").innerText = new Date(enquete.dataFim).toLocaleString();

            const opcoesContainer = document.getElementById("modalOpcoes");
            opcoesContainer.innerHTML = "";

            enquete.opcoes.forEach(opcao => {
                const totalVotos = opcao._count?.votosRegistro || 0;
                const opcaoItem = document.createElement("li");
                opcaoItem.className = "list-group-item";
                opcaoItem.innerText = `${opcao.texto} - ${totalVotos} votos`;
                opcoesContainer.appendChild(opcaoItem);
            });

            document.getElementById("btnRemover").setAttribute("data-enquete-id", id);

            const modal = new bootstrap.Modal(document.getElementById("modalEnquete"));
            modal.show();
        } catch (error) {
            console.error("Erro ao abrir modal:", error);
            exibirMensagem("danger", "Erro ao carregar detalhes da enquete.");
        }
    };

    document.getElementById("btnRemover").addEventListener("click", async function () {
        const idEnquete = this.getAttribute("data-enquete-id");
        if (!idEnquete) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:8000/enquetes/${idEnquete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao remover enquete.");

            exibirMensagem("success", "Enquete removida com sucesso.");
            await carregarEnquetes();

            const modal = bootstrap.Modal.getInstance(document.getElementById("modalEnquete"));
            modal.hide();
        } catch (error) {
            console.error("Erro ao remover enquete:", error);
            exibirMensagem("danger", "Erro ao remover enquete.");
        }
    });

    await carregarEnquetes();
});
