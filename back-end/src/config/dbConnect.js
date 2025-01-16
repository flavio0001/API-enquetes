import mongoose from "mongoose";
import dotenv from "dotenv";

// Carrega o arquivo .env
dotenv.config();

// Função para conectar ao banco de dados
async function conectaNaDatabase() {
  try {
    const uri = process.env.DATABASE_URL;

    if (!uri) {
      throw new Error("A string de conexão (DATABASE_URL) não foi definida no arquivo .env");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Conectado ao MongoDB com sucesso!");

    // Gerenciamento de eventos de conexão
    const conexao = mongoose.connection;

    conexao.on("error", (erro) => {
      console.error("Erro de conexão", erro);
    });

    conexao.once("open", () => {
      console.log("Conexão com o banco feita com sucesso");
    });

    return conexao;
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
}

export default conectaNaDatabase;
