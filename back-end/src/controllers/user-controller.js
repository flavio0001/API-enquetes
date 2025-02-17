import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Função para registrar um novo usuário
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verifica se o e-mail ou nome de usuário já estão em uso
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário ou e-mail já estão em uso.' });
    }

    // Busca o ID do tipo de usuário
    const userType = await prisma.tipoUsuario.findUnique({
      where: { nome: role === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'CLIENTE' },
    });

    if (!userType) {
      return res.status(500).json({ message: 'Erro interno: Tipo de usuário não encontrado.' });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria um novo usuário com o tipo correto
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        tipoId: userType.id,
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser.id, tipoId: userType.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
};

// Função para autenticar um usuário
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tipo: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    const redirectUrl = user.tipo.nome === 'ADMINISTRADOR'
      ? '/security/dashboard-panel-admin.html'
      : '/security/dashboard-area-do-usuario.html';

    // Gera um token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, tipoId: user.tipoId, tipoNome: user.tipo.nome },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login bem-sucedido!', token, redirectUrl });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao autenticar usuário.', error: error.message });
  }
};

//Função para listar todos os usuários
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        tipo: { select: { nome: true } },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { username: "asc" }
    });

    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários.", error: error.message });
  }
};

//Função para atualizar o tipo de usuário (Administrador <-> Cliente)
export const atualizarTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Verifica se o novo tipo é válido
    if (!["ADMINISTRADOR", "CLIENTE"].includes(role)) {
      return res.status(400).json({ message: "Tipo de usuário inválido." });
    }

    // Busca o ID do novo tipo de usuário
    const userType = await prisma.tipoUsuario.findUnique({
      where: { nome: role },
    });

    if (!userType) {
      return res.status(400).json({ message: "Tipo de usuário não encontrado." });
    }

    // Atualiza o tipo do usuário no banco
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { tipoId: userType.id }
    });

    res.status(200).json({ message: "Tipo de usuário atualizado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar usuário.", error: error.message });
  }
};
