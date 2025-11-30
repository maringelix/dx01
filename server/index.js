import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 5000;
let userIdCounter = 3;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint (para o ALB da AWS)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bem-vindo à API dx01! 🚀',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'API está funcionando! 🚀',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Marina', role: 'DevOps Engineer' },
      { id: 2, name: 'GitHub Copilot', role: 'AI Assistant' }
    ]
  });
});

app.post('/api/users',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).trim().escape(),
    body('role').isString().isLength({ min: 1, max: 100 }).trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, role } = req.body;
    userIdCounter++;
    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: { id: userIdCounter, name, role }
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
