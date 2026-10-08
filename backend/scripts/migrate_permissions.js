import { query, connectPostgres } from '../src/config/postgres.js';

async function migrateRolePermissions() {
  await connectPostgres();

  console.log('Ensuring role_permissions table exists...');
  await query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role VARCHAR(50) PRIMARY KEY,
      permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    INSERT INTO role_permissions (role, permissions)
    VALUES
      ('SUPER_ADMIN', '["clients.view", "clients.create", "clients.edit", "clients.deactivate", "requests.view", "requests.create", "requests.assign", "requests.reassign", "requests.change_status", "requests.cancel", "deliverables.view", "deliverables.upload", "deliverables.review", "deliverables.approve", "team.view", "team.manage", "team.assign", "billing.view", "billing.manage", "reports.view", "audit.view", "settings.view", "settings.manage"]'::jsonb),
      ('ADMIN', '["clients.view", "clients.create", "clients.edit", "clients.deactivate", "requests.view", "requests.create", "requests.assign", "requests.reassign", "requests.change_status", "requests.cancel", "deliverables.view", "deliverables.upload", "deliverables.review", "deliverables.approve", "team.view", "team.manage", "team.assign", "billing.view", "billing.manage", "reports.view", "audit.view", "settings.view"]'::jsonb),
      ('COMPANY_LEAD', '["clients.view", "requests.view", "requests.assign", "requests.change_status", "deliverables.view", "deliverables.upload", "deliverables.review", "team.view", "billing.view", "reports.view"]'::jsonb),
      ('COMPANY_BOOST', '["clients.view", "requests.view", "requests.assign", "requests.change_status", "deliverables.view", "deliverables.upload", "deliverables.review", "team.view", "billing.view", "reports.view"]'::jsonb),
      ('LANDING_PAGE', '["clients.view", "requests.view", "requests.assign", "requests.change_status", "deliverables.view", "deliverables.upload", "deliverables.review", "team.view", "billing.view", "reports.view"]'::jsonb),
      ('USER', '["requests.view", "requests.create", "deliverables.view", "deliverables.approve", "billing.view"]'::jsonb)
    ON CONFLICT (role) DO NOTHING;
  `);

  const res = await query('SELECT role, jsonb_array_length(permissions) as perm_count FROM role_permissions');
  console.log('Migration successful. Seeded roles:', res.rows);
  process.exit(0);
}

migrateRolePermissions().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
