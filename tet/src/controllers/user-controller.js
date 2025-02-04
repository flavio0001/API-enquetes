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

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Define o tipo de usuário (padrão CLIENTE, ADMIN precisa ser definido manualmente)
    const userRole = role === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'CLIENTE';

    // Cria um novo usuário
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser.id, role: userRole });
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
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    // Define a URL de redirecionamento com base no tipo de usuário
    const redirectUrl = user.role === 'ADMINISTRADOR'
      ? '/security/dashboard-panel-admin.html'
      : '/security/dashboard-area-do-usuario.html';

    // Gera um token JWT com o tipo de usuário
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login bem-sucedido!', token, redirectUrl });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao autenticar usuário.', error: error.message });
  }
};
