import { query } from '../config/postgres.js';
import { ensureServiceSettingsTable } from '../config/ensureSchema.js';

/**
 * Get all service channel & sub-service visibility settings
 */
export async function getServiceVisibility(req, res) {
  try {
    let result;
    try {
      result = await query(
        'SELECT id, channel, name, description, is_active, is_channel, updated_at FROM service_channel_settings ORDER BY is_channel DESC, channel ASC, name ASC'
      );
      if (!result.rows || result.rows.length === 0) {
        await ensureServiceSettingsTable();
        result = await query(
          'SELECT id, channel, name, description, is_active, is_channel, updated_at FROM service_channel_settings ORDER BY is_channel DESC, channel ASC, name ASC'
        );
      }
    } catch (dbErr) {
      console.warn('[getServiceVisibility] table missing or query failed, initializing table:', dbErr.message);
      await ensureServiceSettingsTable();
      result = await query(
        'SELECT id, channel, name, description, is_active, is_channel, updated_at FROM service_channel_settings ORDER BY is_channel DESC, channel ASC, name ASC'
      );
    }

    return res.json({
      success: true,
      services: result.rows,
    });
  } catch (error) {
    console.error('[getServiceVisibility] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve service visibility settings.',
      error: error.message,
    });
  }
}

/**
 * Update / toggle visibility of a specific service or channel
 */
export async function updateServiceVisibility(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive boolean flag is required.',
      });
    }

    // Ensure table exists
    await ensureServiceSettingsTable();

    const checkRes = await query('SELECT * FROM service_channel_settings WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Service or channel setting "${id}" not found.`,
      });
    }

    const item = checkRes.rows[0];

    // If updating a channel, optionally cascade to child services if desired
    await query(
      'UPDATE service_channel_settings SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, id]
    );

    // If disabling a whole channel, also disable child services of that channel
    if (item.is_channel) {
      const channelSlug = item.channel;
      await query(
        'UPDATE service_channel_settings SET is_active = $1, updated_at = NOW() WHERE channel = $2',
        [isActive, channelSlug]
      );
    }

    const updatedList = await query(
      'SELECT id, channel, name, description, is_active, is_channel, updated_at FROM service_channel_settings ORDER BY is_channel DESC, channel ASC, name ASC'
    );

    return res.json({
      success: true,
      message: `Service "${item.name}" is now ${isActive ? 'ACTIVATED' : 'DEACTIVATED'}.`,
      services: updatedList.rows,
    });
  } catch (error) {
    console.error('[updateServiceVisibility] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update service visibility.',
      error: error.message,
    });
  }
}
