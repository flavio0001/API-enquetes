import dotenv from 'dotenv';

dotenv.config();

// Configurações de autenticação
export const SALT_ROUNDS = 10;
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_dev_only';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Verifica se está em ambiente de produção e se a chave secreta é a padrão
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'default_secret_key_dev_only') {
  console.error('ALERTA DE SEGURANÇA: JWT_SECRET não configurado em ambiente de produção!');
  process.exit(1); // Encerra a aplicação para evitar problemas de segurança
}