# Phase 8A Change Inventory

## DEF-001
Files changed:
- `frontend/src/components/common/ProtectedRoute.jsx`
- `frontend/src/App.jsx`

Reason:
Previously, specialist routes (`/lead`, `/boost`, `/design`, `/admin`) either lacked strict `allowedRoles` arrays or rendered an in-place unauthorized message without redirecting, allowing unauthorized authenticated clients and cross-specialists to directly view specialist layouts and URLs upon manual navigation or refresh.

Behavior changed:
- `ProtectedRoute.jsx`: Evaluates `allowedRoles` and `requiredPermission`. When access is denied, instead of rendering an in-place text block, it immediately issues `<Navigate to={getRoleHome(user)} replace />`, dynamically routing unauthorized users to their designated home portal (`/portal` for `USER`, `/lead` for `COMPANY_LEAD`, `/boost` for `COMPANY_BOOST`, `/design` for `LANDING_PAGE`, and `/signin` for unauthenticated sessions).
- `App.jsx`: Explicitly assigned `allowedRoles={['COMPANY_LEAD', 'ADMIN', 'SUPER_ADMIN']}` to `/lead/*`, `allowedRoles={['COMPANY_BOOST', 'ADMIN', 'SUPER_ADMIN']}` to `/boost/*`, `allowedRoles={['LANDING_PAGE', 'ADMIN', 'SUPER_ADMIN']}` to `/design/*`, and `allowedRoles={['ADMIN', 'SUPER_ADMIN']}` to `/admin/*`.

Tests:
- Live CDP browser tests across all 5 roles (`USER`, `COMPANY_LEAD`, `COMPANY_BOOST`, `LANDING_PAGE`, `SUPER_ADMIN`).
- Direct URL navigation tested for `/lead`, `/boost`, `/design`, `/admin`.
- Screenshots captured: `phase8a_def001_user_lead.png`, `phase8a_def001_user_boost.png`, `phase8a_def001_user_design.png`, `phase8a_def001_user_admin.png`, `phase8a_def001_lead_lead_pass.png`, `phase8a_def001_lead_boost_blocked.png`, `phase8a_def001_boost_boost_pass.png`, `phase8a_def001_boost_lead_blocked.png`, `phase8a_def001_landing_design_pass.png`, `phase8a_def001_landing_lead_blocked.png`, `phase8a_def001_admin_pass.png`.

---

## DEF-002
Files changed:
- `frontend/src/features/boost/BoostPortal.jsx`
- `frontend/src/features/boost/data/boostAdapters.js`

Reason:
DevRel sprint requests were persisted successfully in the database under `service_type = 'COMPANY_BOOST'` with `subService` stored inside `notes` JSON (`{"subService":"DEVREL", ...}`). However, `BoostPortal.jsx` queue filtering logic checked `r.subService` directly on the root object against a list omitting `DEVREL`, and `adaptBoostRequest()` did not parse `subService` from `notes` when missing from `raw.subService`, causing all DevRel tickets to be filtered out of the specialist queue.

Behavior changed:
- `BoostPortal.jsx`: Extracted `sub` from `r.subService || r.sub_service || parsedNotes.subService`, and added `DEVREL` and `DEVREL_PLAN` to the allowed subservice filter.
- `boostAdapters.js`: In `adaptBoostRequest()`, extracts `notesSubService` from parsed `notes` and passes `{ ...raw, subService: raw.subService || notesSubService }` to `detectBoostService()`. DevRel requests now correctly appear in the queue, match the DevRel service category, open in the specialist workspace, and support messaging, deliverable submissions, and client approvals.

Tests:
- Created DevRel ticket `CG-1010` (Marker: `D2I-DEVREL-P8A-1791394308731`).
- Verified ticket appears in `/boost/requests` queue (`visible: true`).
- Executed specialist messaging, deliverable V1 submission, and client approval.
- Screenshots captured: `phase8a_def002_validation.png`, `phase8a_def002_client_request.png`, `phase8a_def002_ticket_created.png`, `phase8a_def002_boost_queue.png`, `phase8a_def002_ticket_opened.png`, `phase8a_def002_specialist_response.png`, `phase8a_def002_v1_submitted.png`, `phase8a_def002_client_review.png`, `phase8a_def002_final_completed.png`.

---

## DEF-003
Files changed:
- `frontend/src/features/client/data/servicesData.js`
- `frontend/src/layouts/ClientLayout.jsx`
- `frontend/src/features/client/pages/DesignChannelPage.jsx`
- `frontend/src/features/client/ClientPortal.jsx`
- `frontend/src/features/client/utils/clientAdapters.js`
- `frontend/src/features/client/components/NewRequestModal.jsx`
- `frontend/src/features/design/DesignPortal.jsx`
- `frontend/src/features/design/data/designAdapters.js`
- `backend/src/controllers/requestController.js`

Reason:
The Client Portal previously exposed only `Boosting` and `Digitalising` service channels. The three canonical UI/Design disciplines (`UI/UX Audit`, `Figma Project`, `Redesign Request`) handled by the `LANDING_PAGE` specialist portal were missing from client navigation, the service catalog, and the request modal, leaving the Design specialist workflow disconnected from client intake.

Behavior changed:
- `servicesData.js`: Registered `ui-ux-audit`, `figma-project`, and `redesign-request` in the authoritative catalog under channel `'design'`.
- `ClientLayout.jsx`: Added the `UI / Design` channel navigation item to the client sidebar with the `Palette` icon.
- `DesignChannelPage.jsx`: Added client channel page presenting cards for the three design services with "View Scope" and "Request ->" actions.
- `ClientPortal.jsx`: Mounted `/portal/design` and `/portal/design/:serviceSlug` routes.
- `clientAdapters.js`: Added `LANDING_PAGE` mapping in `SERVICE_TYPE_MAP` with channel slug `'design'` and subservices `UI_UX_AUDIT`, `FIGMA_PROJECT`, `REDESIGN_REQUEST`.
- `NewRequestModal.jsx`: Added configuration, form states (`auditForm`, `figmaForm`, `redesignForm`), required-field validation, Step 1 UI forms, and Step 2 Review summaries for all three services.
- `DesignPortal.jsx` & `designAdapters.js`: Enhanced subService detection by parsing `notes` to properly filter and adapt incoming tickets.
- `requestController.js`: Added authoritative pricing calculation for `UI_UX_AUDIT` ($499), `FIGMA_PROJECT` ($599), and `REDESIGN_REQUEST` ($599).

Tests:
- Verified navigation and catalog exposure on `/portal/design`.
- Verified required-field validation for each of the three design services.
- Executed complete lifecycles:
  - UI/UX Audit (`CG-1011`): Created -> Specialist Queue -> Specialist Workspace -> Messages -> V1 Deliverable -> Client Approval -> Completed.
  - Figma Project (`CG-1012`): Created -> Specialist Queue -> Specialist Workspace -> V1 Deliverable -> Client Approval -> Completed.
  - Redesign Request (`CG-1013`): Created -> Specialist Queue -> Specialist Workspace -> V1 Deliverable -> Client Approval -> Completed.
- Screenshots captured: `phase8a_def003_channel_nav.png`, `phase8a_def003_uiux_validation.png`, `phase8a_def003_uiux_created.png`, `phase8a_def003_uiux_queue.png`, `phase8a_def003_uiux_workspace.png`, `phase8a_def003_uiux_specialist_reply.png`, `phase8a_def003_uiux_v1_submitted.png`, `phase8a_def003_uiux_completed.png`, `phase8a_def003_figma_validation.png`, `phase8a_def003_figma_created.png`, `phase8a_def003_figma_queue.png`, `phase8a_def003_figma_v1_submitted.png`, `phase8a_def003_figma_completed.png`, `phase8a_def003_redesign_validation.png`, `phase8a_def003_redesign_created.png`, `phase8a_def003_redesign_queue.png`, `phase8a_def003_redesign_v1_submitted.png`, `phase8a_def003_redesign_completed.png`.

---

## Unrelated files
MUST BE EMPTY.
(Confirmed: Exactly 0 unrelated files modified in Phase 8A.)
