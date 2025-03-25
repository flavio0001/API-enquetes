// src/middlewares/rateLimiter.js

// Armazenamento em memória para IPs e contagens de requisições
// Em produção, use Redis ou outro armazenamento distribuído
const requestCounts = new Map();

// Configurações do limitador
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 100; // Número máximo de requisições por janela de tempo

/**
 * Middleware para limitar a taxa de requisições por IP
 * Protege contra abusos e ataques de força bruta
 */
export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Limpa entradas antigas periodicamente
  cleanupOldEntries();
  
  // Obtém ou cria o registro para o IP atual
  const record = requestCounts.get(ip) || { 
    count: 0, 
    resetTime: Date.now() + WINDOW_MS 
  };
  
  // Verifica se o limite foi atingido
  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      status: 'error',
      message: 'Muitas requisições, por favor tente novamente mais tarde',
      retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000)
    });
  }
  
  // Incrementa a contagem e atualiza o mapa
  record.count += 1;
  requestCounts.set(ip, record);
  
  // Adiciona cabeçalhos de limitação
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - record.count);
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
  
  next();
};

/**
 * Limpa entradas antigas do mapa de contagem de requisições
 */
function cleanupOldEntries() {
  const now = Date.now();
  
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}