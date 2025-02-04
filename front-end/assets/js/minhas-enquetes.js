document.addEventListener("DOMContentLoaded", async () => {
    const listaEnquetes = document.getElementById("enquetes-list");
    let token = localStorage.getItem("token");

    // Se o usuário não estiver autenticado, redireciona para login
    if (!token) {
        exibirMensagem("warning", "Você precisa estar autenticado para ver suas enquetes.");
        window.location.href = "login.html";
        return;
    }

    console.log("🔑 Token recuperado do localStorage:", token);

    // Função para exibir notificações (toasts Bootstrap)
    function exibirMensagem(tipo, mensagem) {
        const toastContainer = document.getElementById("toast-container");

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

    // Função para carregar as enquetes do usuário autenticado
    async function carregarEnquetes() {
        try {
            console.log("📤 Enviando requisição para carregar enquetes...");
            console.log("📥 Token enviado na requisição:", token);

            const response = await fetch("http://localhost:8000/enquetes", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log(`📥 Resposta do servidor (Status: ${response.status})`);

            if (response.status === 401) {
                console.warn("🚫 Token inválido ou expirado. Redirecionando para login...");
                exibirMensagem("danger", "Sessão expirada. Faça login novamente.");
                localStorage.removeItem("token");
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Erro ao carregar enquetes: ${errorMessage}`);
            }

            const enquetes = await response.json();
            listaEnquetes.innerHTML = "";

            if (enquetes.length === 0) {
                listaEnquetes.innerHTML = "<tr><td colspan='4' class='text-center'>Nenhuma enquete encontrada.</td></tr>";
                return;
            }

            enquetes.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

            enquetes.forEach((enquete) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${enquete.titulo}</td>
                    <td>${enquete.criadoEm ? new Date(enquete.criadoEm).toLocaleDateString() : "Desconhecido"}</td>
                    <td>${enquete.dataFim ? new Date(enquete.dataFim).toLocaleDateString() : "Sem Data"}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="abrirModal(${enquete.id})">
                            <i class="bi bi-eye"></i> Ver Detalhes
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="excluirEnquete(${enquete.id}, this)">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </td>
                `;

                listaEnquetes.appendChild(tr);
            });

            console.log("✅ Enquetes carregadas com sucesso.");
        } catch (error) {
            console.error("❌ Erro ao carregar enquetes:", error);
            exibirMensagem("danger", error.message);
        }
    }

    carregarEnquetes();
});
