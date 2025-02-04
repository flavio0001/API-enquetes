class AuthManager {
    constructor() {
        this.apiUrl = "http://localhost:8000/users"; // Ajuste conforme necessário
        this.registerForm = document.getElementById("registerForm");
        this.loginForm = document.getElementById("loginForm");

        this.init();
    }

    // Inicializa eventos nos formulários
    init() {
        if (this.registerForm) {
            this.registerForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                await this.cadastrarUsuario();
            });
        }

        if (this.loginForm) {
            this.loginForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                await this.fazerLogin();
            });
        }

        this.configurarExibicaoSenha();
        this.configurarMascaraTelefone();
    }

    // Exibir mensagens na tela com `document.write()`
    exibirErroNaTela(mensagem, erro = null) {
        document.write(`<h3 style="color: red;">Erro:</h3><p>${mensagem}</p>`);
        if (erro) {
            document.write(`<pre>${JSON.stringify(erro, null, 2)}</pre>`);
        }
    }

    // Configurar exibição da senha
    configurarExibicaoSenha() {
        document.querySelectorAll("#showPassword, #showPasswordLogin").forEach((checkbox) => {
            checkbox.addEventListener("change", (event) => {
                const inputId = event.target.id === "showPassword" ? "password" : "passwordLogin";
                const senhaInput = document.getElementById(inputId);
                if (senhaInput) {
                    senhaInput.type = event.target.checked ? "text" : "password";
                }
            });
        });
    }

    // Configura máscara de telefone
    configurarMascaraTelefone() {
        const telefoneInput = document.getElementById("celular");
        if (!telefoneInput) return;

        telefoneInput.addEventListener("input", function () {
            let valor = telefoneInput.value.replace(/\D/g, ""); // Remove tudo que não é número
            if (valor.length > 10) {
                valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
            } else {
                valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
            }
            telefoneInput.value = valor;
        });
    }

    // Cadastro de usuário (Agora fixando `tipoId: 2` para CLIENTE)
    async cadastrarUsuario() {
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value;
        const celular = document.getElementById("celular").value.trim();

        if (!nome || !email || !senha) {
            this.exibirErroNaTela("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: nome,
                    email,
                    password: senha,
                    celular,
                    tipoId: 2, // CLIENTE fixo
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Conta criada com sucesso! Faça login.");
                new bootstrap.Modal(document.getElementById("registerModal")).hide();
                new bootstrap.Modal(document.getElementById("loginModal")).show();
            } else {
                this.exibirErroNaTela("Erro ao cadastrar.", data);
            }
        } catch (error) {
            this.exibirErroNaTela("Erro ao conectar ao servidor.", error);
        }
    }

    // Fazer login do usuário
    async fazerLogin() {
        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("passwordLogin").value;

        if (!email || !senha) {
            this.exibirErroNaTela("Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                alert("Login realizado com sucesso!");
                window.location.href = data.redirectUrl || "/security/dashboard-area-do-usuario.html";
            } else {
                this.exibirErroNaTela("Erro ao fazer login.", data);
            }
        } catch (error) {
            this.exibirErroNaTela("Erro ao conectar ao servidor.", error);
        }
    }
}

// Inicializa o gerenciador de autenticação
document.addEventListener("DOMContentLoaded", () => new AuthManager());
