import mongoose from "mongoose";

// Define o esquema da enquete
const enqueteSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId, // Define o tipo como ObjectId
      default: () => new mongoose.Types.ObjectId(), // Gera automaticamente um ObjectId
    },
    título: {
      type: String,
      required: true,
    },
    opções: [
      {
        texto: { type: String, required: true },
        votos: { type: Number, default: 0 },
      },
    ],
    autor: {
      type: mongoose.Schema.Types.ObjectId, // Referência a um usuário
      ref: "User",
      required: true,
    },
    criadoEm: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false, // Desativa o campo "__v" criado automaticamente pelo Mongoose
  }
);

const Enquete = mongoose.model("Enquete", enqueteSchema);

export default Enquete;
