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
import {
  createIntegrationProspect,
  createIntegrationProspectBatch,
  getIntegrationProspect,
  getIntegrationBatch,
  getProspectMailTemplate,
  regenerateProspectMailTemplate,
} from '../controllers/prospectIntegrationController.js';
import { requireIdempotency } from '../middleware/idempotency.js';

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

// POST /api/integration/v1/prospects/batch
v1Router.post(
  '/prospects/batch',
  apiClientAuth,
  requireScope('prospects:write'),
  regularIntegrationLimiter,
  requireIdempotency,
  createIntegrationProspectBatch
);

// POST /api/integration/v1/prospects (Single prospect push)
v1Router.post(
  '/prospects',
  apiClientAuth,
  requireScope('prospects:write'),
  regularIntegrationLimiter,
  requireIdempotency,
  createIntegrationProspect
);

// GET /api/integration/v1/batches/:batchId
v1Router.get(
  '/batches/:batchId',
  apiClientAuth,
  regularIntegrationLimiter,
  getIntegrationBatch
);

// GET /api/integration/v1/prospects/:id/mail-template
v1Router.get(
  '/prospects/:id/mail-template',
  apiClientAuth,
  regularIntegrationLimiter,
  getProspectMailTemplate
);

// POST /api/integration/v1/prospects/:id/mail-template (Regenerate template)
v1Router.post(
  '/prospects/:id/mail-template',
  apiClientAuth,
  requireScope('prospects:write'),
  regularIntegrationLimiter,
  regenerateProspectMailTemplate
);

// GET /api/integration/v1/prospects/:id
v1Router.get(
  '/prospects/:id',
  apiClientAuth,
  regularIntegrationLimiter,
  getIntegrationProspect
);

// GET /api/integration/v1/prospects/:externalCampaignId/:externalProspectId
v1Router.get(
  '/prospects/:externalCampaignId/:externalProspectId',
  apiClientAuth,
  regularIntegrationLimiter,
  getIntegrationProspect
);

router.use('/v1', v1Router);

export default router;
