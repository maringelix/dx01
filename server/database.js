import pkg from 'pg';
const { Pool } = pkg;
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dx01_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') 
    ? { rejectUnauthorized: false } 
    : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  logger.info('✅ Database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
});

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Initializing database schema...');
    
    // Create visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45),
        user_agent TEXT,
        path VARCHAR(255),
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create users table (for demonstration)
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON app_users(created_at DESC);
    `);

    logger.info('✅ Database schema initialized successfully');
  } catch (error) {
    logger.error('Error initializing database', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

// Query helper function
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error', { text, error: error.message });
    throw error;
  }
}

// Get database connection status
export async function getConnectionStatus() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    return {
      connected: true,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1],
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingRequests: pool.waitingCount
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// Record a visit
export async function recordVisit(ipAddress, userAgent, path) {
  try {
    await query(
      'INSERT INTO visits (ip_address, user_agent, path) VALUES ($1, $2, $3)',
      [ipAddress, userAgent, path]
    );
  } catch (error) {
    logger.error('Error recording visit', { error: error.message });
  }
}

// Get statistics
export async function getStats() {
  try {
    const totalVisits = await query('SELECT COUNT(*) as count FROM visits');
    const totalUsers = await query('SELECT COUNT(*) as count FROM app_users');
    const recentVisits = await query(
      'SELECT COUNT(*) as count FROM visits WHERE visited_at > NOW() - INTERVAL \'24 hours\''
    );

    return {
      totalVisits: parseInt(totalVisits.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      visitsLast24h: parseInt(recentVisits.rows[0].count)
    };
  } catch (error) {
    logger.error('Error getting stats', { error: error.message });
    return null;
  }
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
  logger.info('Database pool closed');
}

export default pool;
