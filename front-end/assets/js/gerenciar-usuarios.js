document.addEventListener("DOMContentLoaded", async () => {
    const listaUsuarios = document.getElementById("lista-usuarios");
    const filtroClientes = document.getElementById("filtro-clientes");
    const filtroAdministradores = document.getElementById("filtro-administradores");

    let usuarios = [];

    // Exibir mensagem de erro/sucesso
    function exibirMensagem(tipo, mensagem) {
        const toastContainer = document.getElementById("toast-container") || criarToastContainer();
        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-bg-${tipo} border-0 show`;
        toast.innerHTML = `<div class="d-flex"><div class="toast-body">${mensagem}</div>
                           <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function criarToastContainer() {
        const toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.className = "position-fixed top-0 end-0 p-3";
        toastContainer.style.zIndex = "1050";
        document.body.appendChild(toastContainer);
        return toastContainer;
    }

    // Função para carregar usuários do banco
    async function carregarUsuarios(tipo = null) {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Usuário não autenticado. Faça login novamente.");

            const response = await fetch("http://localhost:8000/users/list", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao carregar usuários.");
            usuarios = await response.json();

            // Ordenar alfabeticamente pelo nome
            usuarios.sort((a, b) => a.username.localeCompare(b.username));

            // Filtrar por tipo, se necessário
            if (tipo) {
                usuarios = usuarios.filter(user => user.tipo.nome === tipo);
            }

            renderizarUsuarios();
        } catch (error) {
            exibirMensagem("danger", error.message);
            console.error("Erro ao carregar usuários:", error);
        }
    }

    // Renderiza a lista de usuários na tela
    function renderizarUsuarios() {
        listaUsuarios.innerHTML = "";
        if (usuarios.length === 0) {
            listaUsuarios.innerHTML = "<p class='text-center text-muted'>Nenhum usuário encontrado.</p>";
            return;
        }

        usuarios.forEach(user => {
            const div = document.createElement("div");
            div.className = "list-group-item list-group-item-action";
            div.innerText = user.username;
            div.onclick = () => abrirModal(user);
            listaUsuarios.appendChild(div);
        });
    }

    // Abre o modal com as informações do usuário
    function abrirModal(user) {
        document.getElementById("modalNome").innerText = user.username;
        document.getElementById("modalEmail").innerText = user.email;
        //document.getElementById("modalCelular").innerText = user.celular || "Não informado";
        document.getElementById("modalTipo").innerText = user.tipo.nome;

        const btnAdicionarAdmin = document.getElementById("btnAdicionarAdmin");
        const btnRemoverAdmin = document.getElementById("btnRemoverAdmin");
        const btnRemoverUsuario = document.getElementById("btnRemoverUsuario");

        btnAdicionarAdmin.style.display = user.tipo.nome === "CLIENTE" ? "block" : "none";
        btnRemoverAdmin.style.display = user.tipo.nome === "ADMINISTRADOR" ? "block" : "none";

        btnAdicionarAdmin.onclick = () => alterarTipoUsuario(user.id, "ADMINISTRADOR");
        btnRemoverAdmin.onclick = () => alterarTipoUsuario(user.id, "CLIENTE");
        btnRemoverUsuario.onclick = () => removerUsuario(user.id);

        new bootstrap.Modal(document.getElementById("modalUsuario")).show();
    }

    // Altera o tipo do usuário (Cliente <-> Administrador)
    async function alterarTipoUsuario(userId, novoTipo) {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Usuário não autenticado.");

            const response = await fetch(`http://localhost:8000/users/${userId}/update-role`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: novoTipo })
            });

            if (!response.ok) throw new Error("Erro ao atualizar usuário.");
            exibirMensagem("success", "Tipo de usuário atualizado!");
            await carregarUsuarios();
        } catch (error) {
            exibirMensagem("danger", error.message);
            console.error(error);
        }
    }

    // Remove um usuário
    async function removerUsuario(userId) {
        if (!confirm("Tem certeza que deseja remover este usuário?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Usuário não autenticado.");

            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao remover usuário.");
            exibirMensagem("success", "Usuário removido com sucesso!");
            await carregarUsuarios();
        } catch (error) {
            exibirMensagem("danger", error.message);
            console.error(error);
        }
    }

    // Eventos de filtragem
    filtroClientes.onclick = () => carregarUsuarios("CLIENTE");
    filtroAdministradores.onclick = () => carregarUsuarios("ADMINISTRADOR");

    // Carregar usuários ao iniciar a página
    await carregarUsuarios();
});
