# CreativeGini — Phase 8A Baseline Audit Report
**Scope Lock:** DEF-001, DEF-002, DEF-003 Remediation  
**Status:** Pre-Modification Baseline Captured  
**Timestamp:** 2026-10-07T22:10:00+05:30  

---

## 1. Repository & Git Status

- **Active Branch:** `updated-code`
- **Latest Commit Hash:** `2192292`
- **Commit Message:** `fix: remove local env file from repository`
- **Working Tree State:** Pristine codebase from Phase 7/8 audit with existing test scripts and QA reports present. Zero code modifications performed prior to baseline capture.

---

## 2. Environment Verification

- **Frontend Runtime:** Vite 5.4.21 on Node.js v24.14.0 (Windows) — `http://localhost:5173`
- **Backend Runtime:** Express 4.19.2 on Node.js v24.14.0 (Windows) — `http://localhost:5000`
- **Database Engine:** PostgreSQL 16 (`creativegini` database, port 5432)
- **Browser Automation:** Native Chrome DevTools Protocol (CDP) session via Chromium on debugging port 9222.
- **Application Availability:** Both frontend and backend services are active and responding to HTTP requests.

---

## 3. Build & Automated Test Baseline

### 3.1 Frontend Production Build
- **Command:** `npm run build` (in `frontend/`)
- **Result:** **PASS (Exit code 0)**
- **Modules Transformed:** 1,731 modules
- **Output Artifacts:** `dist/index.html` (0.84 kB), `dist/assets/index-DzoUEyaM.css` (325.61 kB), `dist/assets/index-BBbO4nUr.js` (1,329.38 kB)
- **Compile Errors:** 0

### 3.2 Security / Tenant Isolation Suite
- **Command:** `npm run test:security` (in `backend/`)
- **Result:** **31 / 31 PASSED (Exit code 0)**
  - Group 1: Company Profile & Asset Isolation — 5/5 PASS
  - Group 2: Leads & Key People Isolation — 4/4 PASS
  - Group 3: Tickets, Messages & Activity Isolation — 5/5 PASS
  - Group 4: Submissions, Approvals & Workflow Isolation — 5/5 PASS
  - Group 5: Asset Library & Media Streaming Isolation — 5/5 PASS
  - Group 6: Role Permissions & Admin Route Protection — 3/3 PASS
  - Group 7: State Machine Transitions & Invalidation — 4/4 PASS

### 3.3 Backend Email & Notification Suite
- **Command:** `npm test` (in `backend/`)
- **Result:** 3 Passed, 9 Failed (Known SMTP credential requirement for live external Gmail relays; deduplication and fallback handlers passed).

---

## 4. Defect Reproductions Prior to Code Modifications

### 4.1 DEF-001 — Specialist Route RBAC
- **Defect Description:** Specialist routes (`/lead`, `/boost`, `/design/dashboard`) lack strict role-based route guard enforcement.
- **Reproduction Test:** Executed `test-rbac-isolation.js` via live CDP session.
- **Observed Behavior:**
  - Client (`USER`) navigated to `/boost` $\rightarrow$ Landed on `/boost` (Lacked automatic role redirect to `/portal`).
  - Client (`USER`) navigated to `/lead` $\rightarrow$ Landed on `/lead` (Lacked automatic role redirect to `/portal`).
  - Client (`USER`) navigated to `/design/dashboard` $\rightarrow$ Landed on `/design/dashboard` (Lacked automatic role redirect to `/portal`).
  - `COMPANY_BOOST` navigated to `/lead` $\rightarrow$ Landed on `/lead` (Cross-department isolation missing).
  - `COMPANY_LEAD` navigated to `/boost` $\rightarrow$ Landed on `/boost` (Cross-department isolation missing).
- **Status:** **REPRODUCED (P0 Critical)**

### 4.2 DEF-002 — DevRel Queue Ingestion Visibility
- **Defect Description:** Tickets created with `subService = 'DEVREL'` do not appear in the Boost Specialist request queue (`/boost/requests`).
- **Reproduction Investigation:**
  - Inspected `BoostPortal.jsx` line 62: Queue ingestion filter hardcodes `['STRATEGIC_PLAN', 'CONTENT', 'POSTER', 'CREATIVE', 'VIDEO', 'AD_CREATIVE', 'GTM_STRATEGY', 'DEVREL_PLAN']` and omits `DEVREL`.
  - Inspected `boostAdapters.js`: `raw.notes` JSON payload is parsed for requirements but fails to extract `notes.subService`, causing `detectBoostService(raw)` to fallback to default or fail exact slug match.
- **Status:** **REPRODUCED (P1 Major)**

### 4.3 DEF-003 — UI/Design Client Intake Disconnection
- **Defect Description:** Client Portal exposes only `Boosting` and `Digitalising` channels. `UI/UX Audit`, `Figma Project`, and `Redesign Request` are absent from client navigation, catalog, and request modal.
- **Reproduction Investigation:**
  - Inspected `frontend/src/layouts/ClientLayout.jsx`: Navigation items only register `boosting` and `digitalising`.
  - Inspected `frontend/src/features/client/data/servicesData.js`: `SERVICES_CATALOG` contains zero design services.
  - Inspected `frontend/src/features/client/components/NewRequestModal.jsx`: `SERVICE_CONFIGS` has zero entries for design services (`ui-ux-audit`, `figma-project`, `redesign-request`).
  - LANDING_PAGE specialist portal (`/design`) exists with full internal workflows, but is completely disconnected from client intake.
- **Status:** **REPRODUCED (P1 Major)**

---

## 5. Scope Lock Confirmation

Zero code modifications have been made prior to this baseline report. Remediation will proceed strictly and exclusively on:
1. `DEF-001` (RBAC route enforcement and unauthorized role redirection)
2. `DEF-002` (DevRel queue predicate and subservice mapping)
3. `DEF-003` (UI/Design client channel, services catalog exposure, and LANDING_PAGE request intake)
