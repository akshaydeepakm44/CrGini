import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

const sanitizeEnv = (val) => {
  if (!val) return val;
  const str = String(val).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
};

const pgPassword = sanitizeEnv(process.env.POSTGRES_PASSWORD);
const pgUser = sanitizeEnv(process.env.POSTGRES_USER) || 'postgres';
const pgHost = sanitizeEnv(process.env.POSTGRES_HOST) || '127.0.0.1';
const pgPort = Number(process.env.POSTGRES_PORT || 5432);
const pgDatabase = sanitizeEnv(process.env.POSTGRES_DB) || 'creativegini';
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const poolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      max: Number(process.env.POSTGRES_MAX_POOL || 15),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 7000,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: pgHost,
      port: pgPort,
      database: pgDatabase,
      user: pgUser,
      password: pgPassword,
      max: Number(process.env.POSTGRES_MAX_POOL || 15),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 7000,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

export const connectPostgres = async () => {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT current_database() AS database, current_user AS user'
      );

      console.log('[PostgreSQL]: Connection established successfully');
      console.log(`[PostgreSQL]: Database: ${result.rows[0].database}`);
      console.log(`[PostgreSQL]: User: ${result.rows[0].user}`);

      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[PostgreSQL Connection Error]:', error.message);
    return false;
  }
};

export const checkDatabaseHealth = async () => {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'unhealthy', error: err.message };
  }
};

export const query = (text, params) => pool.query(text, params);

export const getPool = () => pool;

export default pool;

