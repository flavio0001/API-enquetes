import app from "./src/app.js";
import conectaNaDatabase from "./src/config/dbConnect.js";

const PORT = 8000;

// Conecta ao banco e inicia o servidor
(async () => {
  const conexao = await conectaNaDatabase();
  if (conexao) {
    app.listen(PORT, () => {
      console.log(`Servidor ativado na porta ${PORT}`);
    });
  }
})();
