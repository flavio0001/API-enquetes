document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:8000/users';

    const exibirMensagem = (mensagem, sucesso = true) => {
        const mensagemEl = document.createElement('p');
        mensagemEl.textContent = mensagem;
        mensagemEl.style.color = sucesso ? 'green' : 'red';
        document.body.prepend(mensagemEl);

        setTimeout(() => mensagemEl.remove(), 3000);
    };

    const togglePasswordVisibility = (checkboxId, inputId) => {
        const checkbox = document.getElementById(checkboxId);
        const input = document.getElementById(inputId);

        checkbox?.addEventListener('change', () => {
            input.type = checkbox.checked ? 'text' : 'password';
        });
    };

    const formCriarConta = document.getElementById('form-criar-conta');
    if (formCriarConta) {
        togglePasswordVisibility('mostrar-senha', 'senha');
        togglePasswordVisibility('mostrar-confirmar-senha', 'confirmar-senha');

        formCriarConta.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;

            if (senha !== confirmarSenha) {
                exibirMensagem('As senhas não coincidem.', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: nome, email, password: senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    exibirMensagem(data.message);
                    window.location.href = 'login.html';
                } else {
                    exibirMensagem(data.message || 'Erro ao criar conta.', false);
                }
            } catch (error) {
                exibirMensagem('Erro ao se conectar ao servidor.', false);
            }
        });
    }
});
