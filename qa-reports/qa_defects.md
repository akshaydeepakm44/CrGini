# CREATIVEGINI QA DEFECT LOG

**Phase:** 7/8 — Full Live Browser E2E Lifecycle QA  
**Defect Classification Standard:** P0 (Critical Security/Integrity), P1 (Major Functional/Architectural Blockers), P2 (Moderate/UX Defects), P3 (Minor Cosmetic/Typo)  
**Rule:** Strictly zero application alterations performed during this phase.

---

## 1. Executive Defect Summary Table

| ID | Severity | Area | Service | Problem Summary | Evidence |
|---|---|---|---|---|---|
| **DEF-001** | **P0** | RBAC / Auth | Platform Security | Internal specialist routes (`/lead`, `/boost`, `/design`) accessible to clients and cross-role specialists | `rbac_client_access__boost.png`, `rbac_client_access__lead.png` |
| **DEF-002** | **P1** | Queue Filtering | DevRel (`DEVREL`) | DevRel requests created by clients do not appear in `COMPANY_BOOST` `/boost/requests` queue table | `e2e_svc_7_04_queue.png` |
| **DEF-003** | **P1** | Client Architecture | UI / Design Services | UI/UX Audit, Figma Project, and Redesign Request completely unexposed in Client Portal | `e2e_svc_12_unsupported.png` |
| **DEF-004** | **P2** | Billing / Checkout | Platform Checkout | Checkout flow bypasses real payment gateway and confirms requests without credit card charge | `phase_b_07_billing.png`, `admin_09_billing.png` |
| **DEF-005** | **P2** | AI / Enrichment | Platform Intelligence | AI/QN features claimed in UI have no backend model or API integration (Zero LLM integration) | `backend/src/services/` |
| **DEF-006** | **P2** | UI / Responsive | Ticket Chat | Chat input form pushed below viewport fold on ticket detail by large deliverables previews | `s1_09_ticket_detail.png` |
| **DEF-007** | **P3** | UX / Forms | Request Wizard | Placeholder text duplicates input label strings verbatim across multiple modal steps | `s1_04_validation_errors.png` |

---

## 2. Detailed Defect Reports

---

### DEF-001

#### Severity
**P0 — Critical Security Defect**

#### Area
RBAC / Route Authorization

#### Role
`USER`, `COMPANY_BOOST`, `COMPANY_LEAD`

#### Service
Platform Security Core

#### Preconditions
User is authenticated with valid JWT token as client (`testclient@datai2i.com`) or specialist.

#### Steps to Reproduce
1. Log in as client `USER` at `http://localhost:5173/signin`.
2. In the browser address bar, directly navigate to `http://localhost:5173/lead`.
3. In the browser address bar, directly navigate to `http://localhost:5173/boost`.
4. In the browser address bar, directly navigate to `http://localhost:5173/design/dashboard`.

#### Expected Result
Unauthorized users must be denied access with immediate redirection to `/portal` or a `403 Forbidden` screen.

#### Actual Result
The browser renders the internal specialist portal (`/lead`, `/boost`, `/design`), exposing internal queue views and specialist action controls to client accounts. Furthermore, `COMPANY_BOOST` specialists can load `/lead`, and `COMPANY_LEAD` specialists can load `/boost`.

#### Evidence
- Screenshot: [`rbac_client_access__boost.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/rbac_client_access__boost.png)
- Screenshot: [`rbac_client_access__lead.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/rbac_client_access__lead.png)
- Screenshot: [`rbac_client_access__design_dashboard.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/rbac_client_access__design_dashboard.png)

#### Business Impact
High compliance and security vulnerability. Clients can view other clients' confidential briefs and internal operational communications by accessing specialist queues.

#### Frequency
Always (100% reproducible).

#### Workaround
None in UI. Users must manually avoid navigating to internal URLs.

#### Suggested Investigation Area
Inspect `frontend/src/components/common/ProtectedRoute.jsx` and `App.jsx`. Route wrappers for `/lead/*`, `/boost/*`, and `/design/*` lack strict role verification logic.

---

### DEF-002

#### Severity
**P1 — Major Functional Defect**

#### Area
Routing / Queue Predicate

#### Role
`COMPANY_BOOST`

#### Service
DevRel (`DEVREL`)

#### Preconditions
A client raises a DevRel sprint request via `/portal/boosting`.

#### Steps to Reproduce
1. Log in as `USER` and raise a DevRel sprint request (`CG-1006`).
2. Log out and log in as `COMPANY_BOOST` (`boost@creativegini.com`).
3. Open `http://localhost:5173/boost/requests`.

#### Expected Result
Ticket `CG-1006` appears in the Boost Requests queue with status `SUBMITTED`.

#### Actual Result
The ticket is saved in PostgreSQL with `service_type = 'COMPANY_BOOST'`, but does not display in the requests table because the frontend filter in `BoostRequestsPage.jsx` only looks for specific hardcoded subservices and drops `DEVREL`.

#### Evidence
- Screenshot: [`e2e_svc_7_04_queue.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/e2e_svc_7_04_queue.png)

#### Business Impact
DevRel sprint requests raised by paying clients are invisible to specialists, leading to missed SLAs and unfulfilled sprint deliverables.

#### Frequency
Always (100% reproducible).

#### Workaround
Specialist must navigate directly to the ticket URL (`/boost/requests/CG-1006`) to view and work on it.

#### Suggested Investigation Area
Inspect `frontend/src/features/boost/data/boostAdapters.js` or `BoostRequestsPage.jsx` filtering predicates where `subService === 'DEVREL'` is omitted.

---

### DEF-003

#### Severity
**P1 — Major Architectural Gap**

#### Area
Client Portal Information Architecture

#### Role
`USER`

#### Service
UI / Design Services (`UI/UX Audit`, `Figma Project`, `Redesign Request`)

#### Preconditions
Client logs into `/portal`.

#### Steps to Reproduce
1. Log in as client `USER` at `http://localhost:5173/portal`.
2. Inspect the left sidebar and channel options.
3. Open the New Request modal.
4. Search for UI/UX Audit, Figma Project, or Landing Page Redesign.

#### Expected Result
Client can select UI/Design from channels and raise design sprint tickets.

#### Actual Result
Only Boosting and Digitalising channels exist. `SERVICE_CONFIGS` in `NewRequestModal.jsx` lacks definitions for UI/Design services. The internal UI/Design specialist portal (`/design`) is completely disconnected from client intake.

#### Evidence
- Screenshot: [`e2e_svc_12_unsupported.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/e2e_svc_12_unsupported.png)

#### Business Impact
CreativeGini cannot sell or fulfill UI/UX audit, Figma, or redesign services through the automated platform.

#### Frequency
Always (100% reproducible).

#### Workaround
None. Design tickets must be manually inserted into the database by an administrator.

#### Suggested Investigation Area
Inspect `frontend/src/features/client/components/NewRequestModal.jsx`, `servicesData.js`, and `ClientPortal.jsx`.

---

### DEF-004

#### Severity
**P2 — Moderate Functional Defect**

#### Area
Billing & Checkout Integration

#### Role
`USER`, `SUPER_ADMIN`

#### Service
Platform Monetization Core

#### Preconditions
Client proceeds through Step 3 (Pricing) of the New Request wizard.

#### Steps to Reproduce
1. Select any service sprint in the New Request modal.
2. Advance through Step 1 (Scope) and Step 2 (Review).
3. Step 3 (Pricing) displays the calculated scope fee (e.g. `$799 USD`).
4. Click "Confirm & Submit Request".

#### Expected Result
A payment gateway (Stripe Checkout / Elements / Razorpay) handles payment capture or authorization before ticket issuance.

#### Actual Result
No credit card input or gateway trigger occurs; the request immediately transitions to `SUBMITTED` with simulated ledger records. Client billing shows `$0` spent while Admin ledger displays static test receipts.

#### Evidence
- Screenshot: [`s1_07_step3_pricing.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/s1_07_step3_pricing.png)
- Screenshot: [`phase_b_07_billing.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/phase_b_07_billing.png)

#### Business Impact
Platform cannot process live credit card transactions in production without manual billing workarounds.

#### Frequency
Always (100% reproducible).

#### Workaround
Manual invoicing or offline settlement.

#### Suggested Investigation Area
Inspect `frontend/src/features/client/components/NewRequestModal.jsx` (lines 507-537) and `backend/src/controllers/paymentController.js`.

---

### DEF-005

#### Severity
**P2 — Moderate Functional Defect**

#### Area
Platform Intelligence

#### Role
All Roles

#### Service
AI / QN Enrichment

#### Preconditions
User navigates to any service or workspace.

#### Steps to Reproduce
1. Inspect specialist ticket workspace and client request pages for AI features.
2. Inspect backend services codebase for external model SDKs (OpenAI, Gemini, Anthropic).

#### Expected Result
Interactive AI analysis generates dynamic summaries, brief recommendations, or prompt evaluations.

#### Actual Result
Zero external model calls or AI generation pipelines exist in backend or frontend; all brief data is static text.

#### Evidence
- Codebase grep results across `backend/src/services` and `frontend/src`.

#### Business Impact
Marketing claims regarding "AI Agents & Autonomous Research Pods" are not fulfilled by the software.

#### Frequency
Always (100% reproducible).

#### Workaround
Human specialists perform manual requirement interpretation.

#### Suggested Investigation Area
Backend service architecture (requires dedicated LLM provider integration).

---

### DEF-006

#### Severity
**P2 — Moderate UI/UX Defect**

#### Area
Ticket Detail Workspace

#### Role
`USER`

#### Service
Communications / Chat Drawer

#### Preconditions
Open any active ticket detail page (`/portal/requests/:ticketId`) with multiple deliverables or lead cards.

#### Steps to Reproduce
1. Open `http://localhost:5173/portal/requests/CG-1002`.
2. Observe right-hand column containing "Specialist Conversation".

#### Expected Result
The message input form and send button remain pinned and visible within the viewport fold.

#### Actual Result
The chat input container is pushed down and requires vertical scrolling to reach the send button because the left column expands and inflates document height.

#### Evidence
- Screenshot: [`s1_09_ticket_detail.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/s1_09_ticket_detail.png)

#### Business Impact
Degraded usability for clients attempting to communicate with specialists upon first viewing their ticket.

#### Frequency
Always on viewport heights below 1080px.

#### Workaround
Scroll down to access message input.

#### Suggested Investigation Area
Inspect `frontend/src/features/client/pages/RequestDetailPage.jsx` (lines 955-967) container height styling.

---

### DEF-007

#### Severity
**P3 — Minor UI/UX Defect**

#### Area
Request Wizard Modal

#### Role
`USER`

#### Service
New Request Intake

#### Preconditions
Open New Request wizard modal on any service.

#### Steps to Reproduce
1. Click "New Request".
2. Observe input labels and placeholders across steps.

#### Expected Result
Placeholders provide helpful context hints or format examples that complement the field title.

#### Actual Result
Several text inputs display placeholders that repeat the exact label string (e.g. "Main Goal" has placeholder "Main Goal is required" upon validation trigger, or duplicate descriptions).

#### Evidence
- Screenshot: [`s1_04_validation_errors.png`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots/s1_04_validation_errors.png)

#### Business Impact
Minor cosmetic redundancy.

#### Frequency
Always.

#### Workaround
None needed.

#### Suggested Investigation Area
Inspect `frontend/src/features/client/components/NewRequestModal.jsx`.
