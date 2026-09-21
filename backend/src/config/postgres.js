import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || 'creativegini',
  user: process.env.POSTGRES_USER || 'creativegini_app',
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

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

export const query = (text, params) => pool.query(text, params);

export const getPool = () => pool;

export default pool;
