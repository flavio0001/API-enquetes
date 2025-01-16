import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// Carrega as variáveis de ambiente
dotenv.config();

// Função para registrar um novo usuário
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verifica se o e-mail ou nome de usuário já estão em uso
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário ou e-mail já estão em uso.' });
    }

    // Cria um novo usuário
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
};

// Função para autenticar um usuário
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica a senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    // Gera um token JWT
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login bem-sucedido!', token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao autenticar usuário.', error: error.message });
  }
};
