# CREATIVEGINI QA BLOCKED TESTS REGISTER

**Phase:** 7/8 — Full Live Browser E2E Lifecycle QA  
**Rule:** When a test cannot proceed due to an upstream platform limitation, the exact blockage is recorded with its root blocker defect.

---

## 1. Blocked Test Cases Summary

| Blocked Test Case | Role / Channel | Reason Blocked | Blocking Defect ID | Required Prerequisite to Unblock |
|---|---|---|---|---|
| **UI/UX Audit End-to-End Workflow** | `USER` $\rightarrow$ `LANDING_PAGE` | Service is completely absent from Client Portal navigation and New Request modal | `DEF-003` | Add UI/Design channel to Client Portal and register `UI_UX_AUDIT` in `NewRequestModal.jsx` |
| **Figma Project End-to-End Workflow** | `USER` $\rightarrow$ `LANDING_PAGE` | Service is completely absent from Client Portal navigation and New Request modal | `DEF-003` | Register `FIGMA_PROJECT` in `NewRequestModal.jsx` and client service registry |
| **Landing Page Redesign End-to-End Workflow** | `USER` $\rightarrow$ `LANDING_PAGE` | Service is completely absent from Client Portal navigation and New Request modal | `DEF-003` | Register `REDESIGN` in `NewRequestModal.jsx` and client service registry |
| **Live Payment Capture & Card Authorization** | `USER` (Checkout) | Step 3 Pricing confirms orders immediately without triggering a payment gateway | `DEF-004` | Integrate Stripe Elements / Checkout or Razorpay SDK into Step 3 submission logic |
| **Live External SMTP Email Dispatch** | All Roles (Notifications) | Backend runs email dispatch in simulation mode due to placeholder credentials (`<GOOGLE_APP_PASSWORD>`) | Environment Limitation | Configure valid Google Workspace App Password or SendGrid/Postmark SMTP API in `backend/.env` |
| **Dynamic AI Brief Analysis & QN Verification** | All Roles | No external LLM provider (OpenAI, Gemini, Anthropic) or local model endpoint is connected | `DEF-005` | Connect an LLM provider and implement backend prompt orchestration services |

---

## 2. Blocked Test Details

### BLK-001: UI/UX Audit E2E Intake
- **Test Objective:** Validate that a real client can raise a UI/UX Audit sprint, that the ticket routes to the `LANDING_PAGE` specialist queue, that a design audit PDF can be uploaded, reviewed, and approved.
- **Why Blocked:** In the client interface (`/portal`), there are only two service channels (`/portal/boosting` and `/portal/digitalising`). There is no UI/Design channel, and the modal's `SERVICE_CONFIGS` does not support `ui-ux-audit`.
- **Status:** **BLOCKED at Client Intake Step.**

### BLK-002: Figma Project E2E Intake
- **Test Objective:** Validate client submission and specialist delivery of a design system / Figma spec.
- **Why Blocked:** No client UI exists to select or configure a Figma design project.
- **Status:** **BLOCKED at Client Intake Step.**

### BLK-003: Redesign Request E2E Intake
- **Test Objective:** Validate client submission and specialist delivery of a landing page redesign blueprint.
- **Why Blocked:** No client UI exists to submit landing page redesign briefs.
- **Status:** **BLOCKED at Client Intake Step.**

### BLK-004: Live Payment Gateway Processing
- **Test Objective:** Validate real credit card charge, 3D-Secure challenge, webhook processing, and settled invoice issuance.
- **Why Blocked:** The application's Step 3 (Pricing) directly dispatches `api.createRequest()` without initiating a payment intent or rendering an iframe/modal gateway.
- **Status:** **BLOCKED at Checkout Step.**
