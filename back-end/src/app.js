import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './middlewares/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import enqueteRoutes from './routes/enqueteRoutes.js';
import denunciaRoutes from './routes/denunciaRoutes.js';
import comentarioRoutes from './routes/comentarioRoutes.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { iniciarJobsEnquete } from './jobs/enqueteStatusJob.js';

const app = express();

// Configurações de segurança básicas
app.use(helmet());

// Configuração de CORS segura
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Em produção, deve ser configurado para origens específicas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limitador de taxa de requisições
app.use(rateLimiter);

// Parser para JSON
app.use(express.json({ limit: '1mb' }));

// Rotas principais da API
app.use('/api/users', userRoutes);
app.use('/api/enquetes', enqueteRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/comentarios', comentarioRoutes);

// Rota de saúde para monitoramento
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Captura rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: `Rota ${req.originalUrl} não encontrada` 
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicia o job de verificação de enquetes expiradas
iniciarJobsEnquete();

export default app;