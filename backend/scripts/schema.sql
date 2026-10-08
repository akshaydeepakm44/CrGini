-- CreativeGini PostgreSQL Schema
-- Run this once to initialize all tables in a fresh database

-- 1. companies
CREATE TABLE IF NOT EXISTS companies (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  contact_person   VARCHAR(255),
  email            VARCHAR(255),
  phone            VARCHAR(100),
  website          VARCHAR(500),
  industry         VARCHAR(255),
  company_info     TEXT,
  research_summary TEXT,
  created_by       INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password        VARCHAR(255) NOT NULL,
  role            VARCHAR(50) NOT NULL DEFAULT 'USER',
  company_boost   BOOLEAN NOT NULL DEFAULT FALSE,
  company_lead    BOOLEAN NOT NULL DEFAULT FALSE,
  company_ui      BOOLEAN NOT NULL DEFAULT FALSE,
  company_id      INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  phone           VARCHAR(100),
  status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  avatar          TEXT,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. company_leads
CREATE TABLE IF NOT EXISTS company_leads (
  id              SERIAL PRIMARY KEY,
  company_id      INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  title           VARCHAR(255),
  lead_company    VARCHAR(255),
  email           VARCHAR(255),
  linkedin        VARCHAR(500),
  location        VARCHAR(255),
  status          VARCHAR(100) DEFAULT 'Unverified',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. company_key_people
CREATE TABLE IF NOT EXISTS company_key_people (
  id              SERIAL PRIMARY KEY,
  company_id      INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(255),
  department      VARCHAR(255),
  contact         VARCHAR(255),
  social_profile  VARCHAR(500),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. requests (tickets)
CREATE TABLE IF NOT EXISTS requests (
  id                          SERIAL PRIMARY KEY,
  ticket_id                   VARCHAR(50) UNIQUE NOT NULL,
  user_id                     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id                  INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  service_type                VARCHAR(100) NOT NULL,
  title                       VARCHAR(500) NOT NULL,
  description                 TEXT,
  priority                    VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  status                      VARCHAR(100) NOT NULL DEFAULT 'REQUEST_CREATED',
  price                       NUMERIC(10, 2) DEFAULT 0,
  payment_status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  assigned_team               VARCHAR(255),
  assigned_to                 INTEGER REFERENCES users(id) ON DELETE SET NULL,
  current_submission_version  INTEGER DEFAULT 0,
  due_date                    TIMESTAMPTZ,
  notes                       TEXT,
  approved_at                 TIMESTAMPTZ,
  approved_by                 INTEGER REFERENCES users(id) ON DELETE SET NULL,
  completed_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. request_attachments
CREATE TABLE IF NOT EXISTS request_attachments (
  id              SERIAL PRIMARY KEY,
  request_id      INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  name            VARCHAR(500) NOT NULL,
  url             TEXT NOT NULL,
  size            VARCHAR(50),
  type            VARCHAR(255),
  uploaded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. request_deliverables
CREATE TABLE IF NOT EXISTS request_deliverables (
  id              SERIAL PRIMARY KEY,
  request_id      INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  title           VARCHAR(500) NOT NULL,
  url             TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. submissions
CREATE TABLE IF NOT EXISTS submissions (
  id                SERIAL PRIMARY KEY,
  request_id        INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  ticket_code       VARCHAR(50),
  version           INTEGER NOT NULL DEFAULT 1,
  title             VARCHAR(500),
  description       TEXT,
  external_link     TEXT,
  notes             TEXT,
  submitted_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  submitted_by_name VARCHAR(255),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status            VARCHAR(100) NOT NULL DEFAULT 'PENDING_REVIEW',
  reviewed_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name     VARCHAR(255),
  review_status     VARCHAR(100),
  review_feedback   TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. submission_files
CREATE TABLE IF NOT EXISTS submission_files (
  id              SERIAL PRIMARY KEY,
  submission_id   INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  name            VARCHAR(500) NOT NULL,
  url             TEXT NOT NULL,
  size            VARCHAR(50),
  type            VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. messages
CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  request_id      INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  sender_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sender_name     VARCHAR(255),
  sender_role     VARCHAR(100),
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. message_attachments
CREATE TABLE IF NOT EXISTS message_attachments (
  id              SERIAL PRIMARY KEY,
  message_id      INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  name            VARCHAR(500),
  url             TEXT,
  size            VARCHAR(50),
  type            VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. message_read_by
CREATE TABLE IF NOT EXISTS message_read_by (
  id              SERIAL PRIMARY KEY,
  message_id      INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- 13. payments
CREATE TABLE IF NOT EXISTS payments (
  id                SERIAL PRIMARY KEY,
  invoice_number    VARCHAR(100) UNIQUE,
  request_id        INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  user_id           INTEGER REFERENCES users(id) ON DELETE SET NULL,
  company_id        INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  amount            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency          VARCHAR(10) NOT NULL DEFAULT 'USD',
  status            VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payment_method    VARCHAR(255),
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(100) NOT NULL,
  title           VARCHAR(500),
  message         TEXT,
  ticket_id       INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  ticket_code     VARCHAR(50),
  submission_id   INTEGER REFERENCES submissions(id) ON DELETE SET NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name       VARCHAR(255),
  company_id      INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  action          VARCHAR(255) NOT NULL,
  details         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token           VARCHAR(500) NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  used            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role            VARCHAR(50) PRIMARY KEY,
  permissions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant all permissions to app user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO creativegini_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO creativegini_app;
