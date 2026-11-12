import { query } from '../config/postgres.js';
import { findSampleBySlug } from '../repositories/sampleRepository.js';

/**
 * GET /api/samples/manage/integration/notifications
 * Paginated list of integration-related notifications.
 * Restricted to ADMIN / SUPER_ADMIN operators.
 */
export async function getAdminIntegrationNotifications(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const countRes = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE is_read = false) AS unread
       FROM notifications
       WHERE type LIKE 'INTEGRATION_%'`
    );

    const rowsRes = await query(
      `SELECT id, user_id, type, title, message, is_read, created_at
       FROM notifications
       WHERE type LIKE 'INTEGRATION_%'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = parseInt(countRes.rows[0]?.total || '0', 10);
    const unread = parseInt(countRes.rows[0]?.unread || '0', 10);

    return res.status(200).json({
      success: true,
      notifications: rowsRes.rows,
      pagination: {
        page,
        limit,
        total,
        unread,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('[getAdminIntegrationNotifications] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve integration notifications.',
    });
  }
}

/**
 * PATCH /api/samples/manage/integration/notifications/:id/read
 * Mark a single notification as read.
 */
export async function markAdminNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const updateRes = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1
       RETURNING id, is_read, title;`,
      [id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
        message: `Notification ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      notification: updateRes.rows[0],
    });
  } catch (err) {
    console.error('[markAdminNotificationRead] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to mark notification as read.',
    });
  }
}

/**
 * GET /api/samples/manage/integration/batches
 * Paginated list of integration push batches.
 */
export async function getAdminIntegrationBatches(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const countRes = await query('SELECT COUNT(*) AS total FROM integration_batches');
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const rowsRes = await query(
      `SELECT
         b.id,
         b.client_id,
         c.client_name,
         b.external_campaign_id,
         b.pushed_by_email,
         b.total_count,
         b.success_count,
         b.fail_count,
         b.status,
         b.created_at,
         b.completed_at
       FROM integration_batches b
       LEFT JOIN api_clients c ON b.client_id = c.client_id
       ORDER BY b.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      batches: rowsRes.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('[getAdminIntegrationBatches] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve integration batches.',
    });
  }
}

/**
 * GET /api/samples/manage/integration/batches/:batchId
 * Returns full batch detail, showcases created, and activity events.
 */
export async function getAdminIntegrationBatchDetail(req, res) {
  try {
    const { batchId } = req.params;

    const batchRes = await query(
      `SELECT
         b.id,
         b.client_id,
         c.client_name,
         b.external_campaign_id,
         b.pushed_by_email,
         b.total_count,
         b.success_count,
         b.fail_count,
         b.status,
         b.created_at,
         b.completed_at
       FROM integration_batches b
       LEFT JOIN api_clients c ON b.client_id = c.client_id
       WHERE b.id = $1`,
      [batchId]
    );

    if (batchRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'BATCH_NOT_FOUND',
        message: `Integration batch '${batchId}' not found.`,
      });
    }

    const showcasesRes = await query(
      `SELECT id, slug, title, company_name, status, source_platform, external_prospect_id, created_at
       FROM public_sample_showcases
       WHERE batch_id = $1
       ORDER BY id ASC`,
      [batchId]
    );

    const eventsRes = await query(
      `SELECT id, event_type, payload, created_at
       FROM integration_events
       WHERE batch_id = $1
       ORDER BY created_at ASC`,
      [batchId]
    );

    return res.status(200).json({
      success: true,
      batch: batchRes.rows[0],
      showcases: showcasesRes.rows,
      events: eventsRes.rows,
    });
  } catch (err) {
    console.error('[getAdminIntegrationBatchDetail] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve batch details.',
    });
  }
}

/**
 * GET /api/samples/manage/preview/:slug
 * Authenticated preview for DRAFT or PUBLISHED showcases.
 */
export async function getAdminShowcasePreview(req, res) {
  try {
    const { slug } = req.params;
    const showcase = await findSampleBySlug(slug, { onlyPublished: false });

    if (!showcase) {
      return res.status(404).json({
        success: false,
        error: 'SHOWCASE_NOT_FOUND',
        message: `Showcase '${slug}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      preview: true,
      sample: showcase,
    });
  } catch (err) {
    console.error('[getAdminShowcasePreview] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'PREVIEW_ERROR',
      message: 'Failed to load showcase preview.',
    });
  }
}

