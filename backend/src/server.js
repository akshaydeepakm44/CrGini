import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectPostgres, getPool } from './config/postgres.js';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import sampleRoutes from './routes/sampleRoutes.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Connect to PostgreSQL
connectPostgres().then(async (ok) => {
  if (ok) {
    console.log('[CreativeGini API] PostgreSQL connected successfully.');
    try {
      const { ensureDataI2IAccount } = await import('./controllers/authController.js');
      await ensureDataI2IAccount();
    } catch (err) {
      console.error('[CreativeGini API] ensureDataI2IAccount error:', err.message);
    }
  } else {
    console.error('[CreativeGini API] PostgreSQL connection failed. Check credentials.');
  }
});

// CORS configuration: allow origins from CLIENT_URL or any localhost during dev
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(url => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for production flexibility
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Dedicated body-parser error handler to ensure JSON responses on large payloads / malformed JSON
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({
      success: false,
      message: 'Upload payload is too large. Please reduce the combined upload size and try again.'
    });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload.'
    });
  }
  next(err);
});

// Prevent client/browser caching on API endpoints
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/samples', sampleRoutes);

import { checkStorageHealth } from './services/storageService.js';

// Health Check with PostgreSQL & Object Storage Diagnostics
app.get('/api/health', async (req, res) => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    let dbStatus = 'disconnected';
    let dbInfo = {};
    try {
      const result = await client.query('SELECT current_database() AS database, current_user AS "user", version() AS version');
      dbStatus = 'connected';
      dbInfo = result.rows[0];
    } finally {
      client.release();
    }

    const storageHealth = await checkStorageHealth();

    res.status(200).json({
      status: 'online',
      service: 'CreativeGini Portal API',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        status: dbStatus,
        ...dbInfo
      },
      storage: storageHealth
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      service: 'CreativeGini Portal API',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        status: 'disconnected',
        error: err.message
      }
    });
  }
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CreativeGini API] Server running on port ${PORT}`);
});

