import express from 'express';
import {
  apiClientAuth,
  requireScope,
} from '../middleware/apiClientAuth.js';
import {
  regularIntegrationLimiter,
  assetUploadLimiter,
  failedAuthLimiter,
} from '../middleware/integrationLimiter.js';
import {
  getIntegrationHealth,
  getIntegrationSchema,
  uploadIntegrationAsset,
} from '../controllers/integrationController.js';

const router = express.Router();

// -----------------------------------------------------------------------------
// 1. Feature Flag Guard: Disabled by default (returns 404 on all integration routes)
// -----------------------------------------------------------------------------
router.use((req, res, next) => {
  if (process.env.ENABLE_INTEGRATION_API !== 'true') {
    return res.status(404).json({
      success: false,
      error: 'INTEGRATION_API_DISABLED',
      message: 'Integration API is disabled.',
    });
  }
  next();
});

// -----------------------------------------------------------------------------
// 2. Integration v1 Sub-Router
// -----------------------------------------------------------------------------
const v1Router = express.Router();

// Apply failed auth brute-force limiter across all integration endpoints
v1Router.use(failedAuthLimiter);

// GET /api/integration/v1/health
v1Router.get(
  '/health',
  apiClientAuth,
  regularIntegrationLimiter,
  getIntegrationHealth
);

// GET /api/integration/v1/schema
v1Router.get(
  '/schema',
  apiClientAuth,
  requireScope('prospects:write'),
  regularIntegrationLimiter,
  getIntegrationSchema
);

// POST /api/integration/v1/assets
v1Router.post(
  '/assets',
  apiClientAuth,
  requireScope('assets:write'),
  assetUploadLimiter,
  uploadIntegrationAsset
);

router.use('/v1', v1Router);

export default router;

