# CreativeGini Production Readiness Audit

## 1. Executive Verdict

**VERDICT: GO WITH CONDITIONS**

The core application platform demonstrates solid architecture: zero tenant-isolation leaks (31/31 security tests passing), zero RBAC bypasses (all unauthorized cross-role route attempts blocked and redirected), successful Vite production build, robust request lifecycle state machines across Boosting, Digitalising, and UI/Design, and non-destructive database startup.

However, deployment to a live public server cannot proceed until **4 pre-deployment conditions** (P1 findings) are remediated in the server environment configuration and build arguments:
1. `VITE_API_URL` must not be baked as `http://localhost:5000/api` into the production frontend bundle.
2. Hardcoded test credential auto-fill buttons (exposing administrative logins) must be disabled or omitted in production builds.
3. Production Object Storage (MinIO or S3-compatible service) must be provisioned and accessible.
4. Permissive CORS configuration with `credentials: true` must be constrained to approved production origins.

*Payment Status*: **DEFERRED — INTENTIONALLY ON HOLD** per product decision. Core platform readiness is evaluated independently of payment gateway integration.

---

## 2. Current Commit & Environment State

- **Branch**: `updated-code` (up to date with `origin/updated-code`)
- **Commit**: `2192292785cfa812d0e8710c72456ce458d82a16`
- **Commit Message**: `fix: remove local env file from repository`
- **Working Tree**: Modified application files and untracked QA test suites present
- **Node Version**: `v24.14.0`
- **npm Version**: `11.6.2`
- **PostgreSQL Version**: `18.3` (x86_64-windows)
- **Frontend Version**: `1.0.0` (`creativegini-react`)
- **Backend Version**: `1.0.0` (`creativegini-backend`)
- **Storage Driver**: MinIO with PostgreSQL base64 fallback
- **Process Manager**: PM2 (`ecosystem.config.cjs` configured for Ubuntu VM target)

---

## 3. Critical Findings (P0 — Must Not Deploy)

*No P0 architectural vulnerabilities were found.*
- No authentication bypasses
- No RBAC bypasses
- No cross-tenant data leakage
- No destructive deployment behaviors on application start

---

## 4. High Findings (P1 — Pre-Deployment Conditions)

1. **[P1-CONFIG-01] Frontend Production Bundle Hardcodes Localhost API Endpoint**
   - **File**: `frontend/.env` & `frontend/src/services/api.js`
   - **Evidence**: `VITE_API_URL=http://localhost:5000/api` is statically inlined during `npm run build` into `dist/assets/index-*.js`.
   - **Impact**: When served behind Nginx on a public domain, client browsers will send API requests to `http://localhost:5000/api` instead of the reverse-proxy `/api` endpoint, breaking all remote client functionality.
   - **Required Condition**: Build the production frontend with `VITE_API_URL=/api` or empty string so relative proxying applies.

2. **[P1-SEC-01] Hardcoded Demo Credentials Exposed on Public Sign-In Page**
   - **File**: `frontend/src/components/auth/SignInPage.jsx`
   - **Evidence**: Array of one-click test credentials including Super Admin (`team@creativegini.com` / `Admin@2026`) and Admin (`admin@creativegini.com` / `Admin@123`) is embedded directly in UI JSX.
   - **Impact**: Any public visitor to the deployed login page can inspect or click autofill credentials and obtain Super Admin access unless these accounts are manually changed in the production database.
   - **Required Condition**: Gate test credential buttons behind `import.meta.env.DEV` or remove from production bundle.

3. **[P1-STORAGE-01] MinIO Object Storage Unreachable on Local Target**
   - **File**: `backend/src/services/storageService.js`
   - **Evidence**: HTTP check against `127.0.0.1:9000` returned `ECONNREFUSED`.
   - **Impact**: The application falls back to storing full base64 document payloads in PostgreSQL (`submission_files.url`). Large design deliverables and multi-page dossiers will cause severe PostgreSQL table bloat and high memory consumption under production usage.
   - **Required Condition**: Ensure MinIO daemon or S3-compatible bucket is provisioned, active, and accessible on target host before uploading production assets.

4. **[P1-SEC-02] Permissive Wildcard CORS with `credentials: true`**
   - **File**: `backend/src/server.js` (Lines 32–41)
   - **Evidence**:
     ```javascript
     origin: (origin, callback) => {
       if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
         callback(null, true);
       } else {
         callback(null, true); // Permissive for production flexibility
       }
     }
     ```
   - **Impact**: Every origin is allowed with credentials permitted, leaving authenticated sessions vulnerable to cross-origin abuse.
   - **Required Condition**: Restrict CORS callback in production to strictly match `CLIENT_URL` whitelist domains.

---

## 5. Medium Findings (P2 — Deployable with Known Limitations)

1. **[P2-EMAIL-01] SMTP Authentication Failing (Gmail App Password)**
   - **File**: `backend/src/services/emailService.js`
   - **Evidence**: `npm test` logs Google SMTP error `535 5.7.8 Username and Password not accepted`.
   - **Classification**: `ENVIRONMENT LIMITATION — EMAIL DELIVERY NOT VERIFIED`. Non-blocking because `emailService` isolates send errors with `.catch()` without breaking HTTP requests or database transactions.
2. **[P2-DB-01] `magic_login_tokens` Missing from Baseline `schema.sql`**
   - **File**: `backend/scripts/schema.sql` vs `backend/src/repositories/magicTokenRepository.js`
   - **Evidence**: `magicTokenRepository.js` executes runtime `CREATE TABLE IF NOT EXISTS magic_login_tokens`. A fresh database initialized strictly via `psql < schema.sql` relies on runtime DDL permissions.
3. **[P2-RELIABILITY-01] Missing Process Signal Handlers in `server.js`**
   - **File**: `backend/src/server.js`
   - **Evidence**: No `process.on('SIGTERM')` or `process.on('SIGINT')` to drain pool connections during zero-downtime PM2 restarts.

---

## 6. Low Findings (P3 — Post-Deploy Improvements)

1. **[P3-DEP-01] DevDependency Vulnerabilities in Frontend Tooling**
   - **Evidence**: `npm audit` on frontend flags 3 vulnerabilities in `vite`, `esbuild`, `source-map-js`. Runtime production packages have 0 vulnerabilities.
2. **[P3-DEP-02] Minor Subdependency Audit Flags in Backend**
   - **Evidence**: `npm audit` on backend flags 4 moderate vulnerabilities in `minio` subdependencies (`decode-uri-component`, `stream-json`).

---

## 7. Security Audit

| Subsystem | Status | Details / Evidence |
|---|---|---|
| **Authentication** | **PASS** | JWT token authentication, bcrypt password hashing with salt rounds = 10, magic link hash validation, token expiration enforced. |
| **RBAC** | **PASS** | `test-rbac-isolation.js` verified 9/9 unauthorized route attempts across USER, COMPANY_BOOST, and COMPANY_LEAD are blocked and redirected to role home. |
| **Tenant Isolation** | **PASS** | `tests/security/tenant-isolation-idor.test.js` verified 31/31 tests passing across company records, leads, key people, tickets, messages, deliverables, and asset streams. |
| **IDOR Protection** | **PASS** | Cross-client attempts to view tickets, download assets, stream media, approve submissions, or request changes return HTTP 403. |
| **File Security** | **PASS** | `/api/assets/:id/stream` and `/download` verify user ownership and company matching before piping streams. |
| **Secret Protection** | **PASS** | Secrets are externalized to `.env`; `.gitignore` excludes `.env*` files; git commit history verified clean of committed env files. |
| **CORS** | **CONDITIONAL** | Needs production domain lockdown (see P1-SEC-02). |

---

## 8. Application Portals & Workflow Audit

| Portal / Feature | Status | Evidence |
|---|---|---|
| **Client Portal (`/portal`)** | **PASS** | Full navigation across Dashboard, Requests, Boosting, Digitalising, UI/Design, Deliverables, Messages, Billing, Profile. |
| **Lead Portal (`/lead`)** | **PASS** | Specialist workspace, leads management, dossier review, study uploads validated. |
| **Boost Portal (`/boost`)** | **PASS** | Strategic Planner, Content, Creatives, Video, DevRel sprint queues operational. |
| **Design Portal (`/design`)** | **PASS** | UI/UX Audit workspace, Figma project viewer, redesign sprint management active. |
| **Super Admin (`/admin`)** | **PASS** | Operations dashboard, user provisioning, activity logs, role governance operational. |
| **Core Request Lifecycle** | **PASS** | Creation -> Ticket Generation -> Assignment -> In Progress -> Deliverable V1 -> Client Review -> Changes Requested -> Deliverable V2 -> Approval -> COMPLETED verified end-to-end. |
| **Messaging** | **PASS** | Ticket conversation threads persist in PostgreSQL with multi-role attribution and read receipts. |
| **Deliverables & Versioning**| **PASS** | Multi-versioning (V1, V2) supported with version history and file association intact. |

---

## 9. Infrastructure & Deployment Setup

| Component | Audit Observation |
|---|---|
| **PostgreSQL** | Version 18.3 healthy. Connection pool max 10. `connectPostgres()` verifies database connection on startup. |
| **Storage (MinIO)** | Service driver ready with S3 API integration. Local port 9000 offline, graceful DB fallback active. Target host must run MinIO service. |
| **PM2** | `ecosystem.config.cjs` defined with production `NODE_ENV`, memory limit 512M, 10 restart limit, fork execution mode. |
| **Nginx** | Deep-link routing requires standard `try_files $uri $uri/ /index.html;` configuration for SPA client routing. |
| **Environment Configuration** | All database, JWT, and application keys externalized via `dotenv`. |

---

## 10. Reliability & Safety

- **Startup Safety**: `server.js` startup does not modify or drop existing tables.
- **Data Safeguards**: `seed-pg.js` contains hardcoded production block:
  ```javascript
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PRODUCTION_SEED) {
    console.error('[CRITICAL SAFEGUARD] seed-pg.js execution is strictly prohibited in production environment.');
    process.exit(1);
  }
  ```
- **Error Boundaries**: Frontend wrapped with `ErrorBoundary` capturing React tree render exceptions without exposing raw stack traces.
- **Backend Error Handling**: Global error handler intercepts JSON parsing errors, entity too large errors (HTTP 413), and unhandled route requests.

---

## 11. Payment Status

**STATUS: DEFERRED — INTENTIONALLY ON HOLD**
- Excluded from current production scope by product decision.
- In `requestController.js`, new tickets default to `paymentStatus: 'CONFIRMED'` to allow unblocked operational request progression.
- No live payment processor credentials are required for this deployment milestone.

---

## 12. AI / QN Status

- **Status**: Client-side Heuristic Synthesis (`qwenAuditGenerator.js`) and simulated compliance workflow in `ResearchWorkspacePage.jsx`.
- **Impact**: Generates contextual design checklists from ticket parameters.
- **Deployment Blocker**: **NO**. Functions purely client-side without external GPU or API dependencies.

---

## 13. Production Readiness Scorecard

| Category | Status | Severity | Evidence |
|---|---|---|---|
| Build | PASS | Low | `npm run build` exits with code 0 (1,728 modules transformed). |
| Startup | PASS | Low | Server starts cleanly on port 5000; DB connected. |
| Authentication | PASS | Low | JWT + bcrypt + passwordless magic login functioning. |
| RBAC | PASS | Low | 9/9 route barrier tests passed (`test-rbac-isolation.js`). |
| Tenant Isolation | PASS | Low | 31/31 isolation tests passed (`tenant-isolation-idor.test.js`). |
| API Security | PASS | Low | IDOR prevention verified on company, lead, asset, ticket APIs. |
| Client Portal | PASS | Low | All sub-routes and features render cleanly. |
| Lead Portal | PASS | Low | Specialist research and dossier submission operational. |
| Boost Portal | PASS | Low | Growth sprint management and deliverables operational. |
| Design Portal | PASS | Low | UI/UX audit, Figma links, and redesign flows operational. |
| Request Lifecycle | PASS | Low | Multi-service lifecycle test passed (`multi-service-lifecycle.test.js`). |
| Messaging | PASS | Low | Message persistence and ticket thread isolation verified. |
| Notifications | PASS | Low | In-app user notifications operational and tenant-scoped. |
| Deliverables | PASS | Low | Versioning (V1, V2) and review transitions operational. |
| Storage | CONDITIONAL | High | Graceful fallback operational; MinIO daemon offline locally. |
| Database | PASS | Low | PostgreSQL schema consistent; health check operational. |
| Error Handling | PASS | Low | HTTP 413, 400, 404, 500 handled safely without stack exposure. |
| Environment | CONDITIONAL | High | `VITE_API_URL` baked as localhost; requires build-time fix. |
| Secrets | CONDITIONAL | High | Public login page contains hardcoded demo credential buttons. |
| Nginx | PASS | Low | SPA deep-link routing compatible with standard Nginx configuration. |
| PM2 | PASS | Low | `ecosystem.config.cjs` configured with production settings. |
| Logging | PASS | Low | Structured request and database diagnostic logging present. |
| Backup/Recovery | PARTIAL | Medium | Local dump script available; automated cron backup needed on server. |
| Dependency Risk | PASS | Low | 0 critical/high runtime production vulnerabilities. |
| Payment | DEFERRED | N/A | Intentionally on hold; excluded from production scope. |
| AI / QN | PASS | Low | Heuristic client-side generator operational. |

---

## 14. Conditions Before Server Deployment

To proceed safely with server deployment:

1. **Set `VITE_API_URL` for Production Build**:
   ```bash
   # In frontend build environment:
   VITE_API_URL=/api npm run build
   # or build with empty VITE_API_URL so relative /api routing is used
   ```
2. **Restrict CORS in `backend/src/server.js`**:
   Ensure `origin` callback strictly verifies incoming `origin` against the configured `CLIENT_URL` domain list before returning `true`.
3. **Hide Demo Credentials on Sign-In Page**:
   Remove or conditionally disable the quick test credential buttons in production so Super Admin passwords are not displayed on the public internet.
4. **Start MinIO Daemon on Server**:
   Ensure MinIO server is running on the target server with the bucket created before pointing traffic to the upload pipeline.
5. **Configure Server Automated Backups**:
   Establish a daily `pg_dump` cron job for the `creativegini` database on the Ubuntu server.
