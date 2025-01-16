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

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        togglePasswordVisibility('mostrar-senha', 'senha');

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    exibirMensagem(data.message);
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    exibirMensagem(data.message || 'Erro ao fazer login.', false);
                }
            } catch (error) {
                exibirMensagem('Erro ao se conectar ao servidor.', false);
            }
        });
    }
});
