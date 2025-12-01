import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import { 
  initializeDatabase, 
  getConnectionStatus, 
  recordVisit, 
  getStats, 
  query as dbQuery,
  closePool 
} from './database.js';

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

// Database initialization
let dbInitialized = false;
let dbStatus = { connected: false };

// Initialize database on startup
(async () => {
  try {
    logger.info('🔄 Attempting to connect to database...');
    await initializeDatabase();
    dbStatus = await getConnectionStatus();
    dbInitialized = true;
    logger.info('✅ Database initialized successfully', { 
      version: dbStatus.version,
      host: process.env.DB_HOST 
    });
  } catch (error) {
    logger.error('❌ Failed to initialize database', { error: error.message });
    logger.warn('⚠️  API will continue without database functionality');
  }
})();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint (para o ALB da AWS)
app.get('/health', async (req, res) => {
  const dbHealth = await getConnectionStatus();
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth
  });
});

// API Routes
app.get('/api', async (req, res) => {
  // Record visit if database is available
  if (dbInitialized) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    await recordVisit(ip, userAgent, '/api');
  }

  const stats = dbInitialized ? await getStats() : null;
  
  res.json({ 
    message: 'Bem-vindo à API dx01! 🚀',
    version: '2.0.0',
    database: dbInitialized ? 'connected' : 'not available',
    stats: stats
  });
});

app.get('/api/health', async (req, res) => {
  const dbHealth = await getConnectionStatus();
  const stats = dbInitialized ? await getStats() : null;
  
  res.status(200).json({ 
    status: 'healthy',
    message: 'API está funcionando! 🚀',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth,
    stats: stats
  });
});

app.get('/api/users', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.json({
        users: [
          { id: 1, name: 'Marina', role: 'DevOps Engineer' },
          { id: 2, name: 'GitHub Copilot', role: 'AI Assistant' }
        ],
        source: 'fallback (database not connected)'
      });
    }

    const result = await dbQuery('SELECT * FROM app_users ORDER BY created_at DESC');
    res.json({
      users: result.rows,
      source: 'database',
      count: result.rows.length
    });
  } catch (error) {
    logger.error('Error fetching users', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).trim().escape(),
    body('role').isString().isLength({ min: 1, max: 100 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, role } = req.body;

    try {
      if (!dbInitialized) {
        return res.status(503).json({ 
          error: 'Database not available',
          message: 'Cannot create user without database connection' 
        });
      }

      const result = await dbQuery(
        'INSERT INTO app_users (name, role) VALUES ($1, $2) RETURNING *',
        [name, role]
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso no banco de dados! 🎉',
        user: result.rows[0]
      });
    } catch (error) {
      logger.error('Error creating user', { error: error.message });
      res.status(500).json({ error: 'Failed to create user' });
    }
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

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: ${process.env.DB_HOST ? `${process.env.DB_HOST}:${process.env.DB_PORT}` : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await closePool();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await closePool();
    process.exit(0);
  });
});
