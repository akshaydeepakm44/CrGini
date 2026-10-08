# CREATIVEGINI QA SCREENSHOT EVIDENCE INDEX

**Evidence Directory:** [`qa-screenshots`](file:///C:/Users/aksha/.gemini/antigravity-ide/brain/70b91183-7caa-410d-8e31-3cf068b80e49/qa-screenshots) (151 raw images captured)  
**Standard:** Every screenshot corresponds to an authentic, unedited live browser state.

---

| Screenshot File | Role | Page / URL | Ticket | Action Performed | Expected State | Observed State | Evidence Type | Defect ID |
|---|---|---|---|---|---|---|---|---|
| `phase_a_01_client.png` | `USER` | `/portal` | — | Login with client credentials | Renders Client Portal | Client Portal renders with metrics | Pass Evidence | — |
| `phase_a_02_lead.png` | `COMPANY_LEAD` | `/lead` | — | Login with lead specialist credentials | Renders Lead Portal | Lead Specialist console renders | Pass Evidence | — |
| `phase_a_03_boost.png` | `COMPANY_BOOST` | `/boost` | — | Login with boost specialist credentials | Renders Boost Portal | Boost Growth console renders | Pass Evidence | — |
| `phase_a_04_ui.png` | `LANDING_PAGE` | `/design/dashboard` | — | Login with UI architect credentials | Renders Design Portal | UI/UX Architect console renders | Pass Evidence | — |
| `phase_a_05_admin.png` | `ADMIN` | `/admin/dashboard` | — | Login with admin credentials | Renders Admin Console | Control center renders | Pass Evidence | — |
| `phase_a_06_superadmin.png` | `SUPER_ADMIN` | `/admin/dashboard` | — | Login with super admin credentials | Renders Super Admin Center | Super Admin command center renders | Pass Evidence | — |
| `phase_b_01_dashboard.png` | `USER` | `/portal/dashboard` | — | Navigate client dashboard | Dashboard metrics and actions | Clean layout, active tickets, $0 spend | Pass Evidence | — |
| `phase_b_02_boosting.png` | `USER` | `/portal/boosting` | — | Navigate boosting channel | Service cards with turnaround times | 3 services + custom scope render | Pass Evidence | — |
| `phase_b_03_digitalising.png` | `USER` | `/portal/digitalising` | — | Navigate digitalising channel | Service cards with turnaround times | 4 services + custom scope render | Pass Evidence | — |
| `phase_b_04_requests.png` | `USER` | `/portal/requests` | — | Open requests queue | Ticket filters and New Request button | Filters render; empty state active | Pass Evidence | — |
| `phase_b_05_deliverables.png` | `USER` | `/portal/deliverables` | — | Open deliverables vault | Submissions and packages | Submissions view renders | Pass Evidence | — |
| `phase_b_06_messages.png` | `USER` | `/portal/messages` | — | Open communications hub | Conversation pods list | Chat workspace renders | Pass Evidence | — |
| `phase_b_07_billing.png` | `USER` | `/portal/billing` | — | Open billing page | Invoices ledger | Zero balance ledger renders | Defect Evidence | `DEF-004` |
| `phase_b_08_profile.png` | `USER` | `/portal/profile` | — | Open profile page | Company intelligence & magic link | Data I2I profile renders | Pass Evidence | — |
| `s1_02_boosting_channel.png` | `USER` | `/portal/boosting` | — | Select Strategic Planner | Service details visible | "Request Strategic Plan →" active | Pass Evidence | — |
| `s1_03_request_modal_opened.png` | `USER` | Modal Step 1 | — | Open wizard modal | Step 1 Scope inputs open | Form opens with required asterisks | Pass Evidence | — |
| `s1_04_validation_errors.png` | `USER` | Modal Step 1 | — | Click Review without required fields | Validation errors trigger | "Main Goal is required", etc. displayed | Pass Evidence | `DEF-007` |
| `s1_05_form_filled.png` | `USER` | Modal Step 1 | — | Fill all required fields | Validated inputs | Inputs accept Data I2I values | Pass Evidence | — |
| `s1_06_step2_review.png` | `USER` | Modal Step 2 | — | Review requirements step | Form summary displayed | Brief review renders accurately | Pass Evidence | — |
| `s1_07_step3_pricing.png` | `USER` | Modal Step 3 | — | Continue to Pricing step | Dynamically calculated fee | Displays $799 USD with breakdown | Pass Evidence | `DEF-004` |
| `s1_08_my_requests_table.png` | `USER` | `/portal/requests` | `CG-1002` | Submit Strategic Plan request | Ticket created in database | `CG-1002` appears in table | Pass Evidence | — |
| `s1_09_ticket_detail.png` | `USER` | `/portal/requests/CG-1002` | `CG-1002` | Open ticket detail | Ticket overview & chat visible | Status `Submitted`, chat ready | Defect Evidence | `DEF-006` |
| `s1_10_client_message_sent.png` | `USER` | `/portal/requests/CG-1002` | `CG-1002` | Client sends initial chat message | Message appears with timestamp | Client message renders in pod | Pass Evidence | — |
| `s1_12_boost_requests_queue.png` | `COMPANY_BOOST` | `/boost/requests` | `CG-1002` | Boost specialist checks queue | `CG-1002` appears in queue | Ticket visible with status `Submitted` | Pass Evidence | — |
| `s1_13b_specialist_messages_tab.png` | `COMPANY_BOOST` | `/boost/requests/CG-1002` | `CG-1002` | Specialist opens Client Messages | Client message visible | Message readable by specialist | Pass Evidence | — |
| `s1_14_specialist_reply_sent.png` | `COMPANY_BOOST` | `/boost/requests/CG-1002` | `CG-1002` | Specialist types and sends reply | Reply persists in thread | Specialist reply visible | Pass Evidence | — |
| `s1_15_deliverable_modal.png` | `COMPANY_BOOST` | Upload Modal | `CG-1002` | Click Submit Deliverables | Modal opens for notes and link | Modal accepts deliverable URL/file | Pass Evidence | — |
| `s1_16_v1_deliverable_submitted.png` | `COMPANY_BOOST` | `/boost/requests/CG-1002` | `CG-1002` | Submit V1 deliverable | Status becomes `Client Review` | Deliverable package published | Pass Evidence | — |
| `s1_17_client_review_deliverable.png` | `USER` | `/portal/requests/CG-1002` | `CG-1002` | Client opens review screen | Deliverable package rendered | Version 1 package and note visible | Pass Evidence | — |
| `s1_18_ticket_approved_completed.png` | `USER` | `/portal/requests/CG-1002` | `CG-1002` | Client clicks Approve Work | Ticket status becomes `Completed` | Completed badge active (Green) | Pass Evidence | — |
| `s1_19_admin_operations_observed.png` | `SUPER_ADMIN` | `/admin/operations` | `CG-1002` | Super Admin checks operations | `CG-1002` visible as `COMPLETED` | Live table reflects completed state | Pass Evidence | — |
| `s8_08_my_requests_table.png` | `USER` | `/portal/requests` | `CG-1006` | Submit Lead Research request | Ticket created | `CG-1006` created in database | Pass Evidence | — |
| `s8_12_lead_requests_queue.png` | `COMPANY_LEAD` | `/lead/requests` | `CG-1006` | Lead specialist checks queue | `CG-1006` in queue | Routed to `COMPANY_LEAD` | Pass Evidence | — |
| `s8_16_v1_deliverable_submitted.png` | `COMPANY_LEAD` | `/lead/requests/CG-1006` | `CG-1006` | Specialist uploads V1 leads CSV | V1 submitted to client | Status becomes `Client Review` | Pass Evidence | — |
| `s8_18_changes_requested.png` | `USER` | `/portal/requests/CG-1006` | `CG-1006` | Client requests revisions | Status becomes `Changes Requested` | Change feedback submitted | Pass Evidence | — |
| `s8_19_specialist_sees_changes_requested.png` | `COMPANY_LEAD` | `/lead/requests/CG-1006` | `CG-1006` | Specialist views change request | Banner displays client feedback | Revision feedback readable | Pass Evidence | — |
| `s8_20_v2_submitted.png` | `COMPANY_LEAD` | `/lead/requests/CG-1006` | `CG-1006` | Specialist submits V2 revisions | Status becomes `Client Review (V2)` | Version 2 package published | Pass Evidence | — |
| `s8_22_ticket_approved_completed.png` | `USER` | `/portal/requests/CG-1006` | `CG-1006` | Client approves V2 package | Ticket moves to `Completed` | Final completed state achieved | Pass Evidence | — |
| `s8_23_admin_operations_observed.png` | `SUPER_ADMIN` | `/admin/operations` | `CG-1006` | Admin observes Lead ticket | `CG-1006` visible as `COMPLETED` | Operations table verified | Pass Evidence | — |
| `e2e_svc_7_04_queue.png` | `COMPANY_BOOST` | `/boost/requests` | `CG-1006` | Boost specialist checks DevRel | Ticket visible in queue | Ticket omitted from queue table | Defect Evidence | `DEF-002` |
| `e2e_svc_12_unsupported.png` | `USER` | `/portal` | — | Search for UI/UX Audit | Channel accessible | UI/Design channel missing | Defect Evidence | `DEF-003` |
| `admin_02_operations.png` | `SUPER_ADMIN` | `/admin/operations` | All | Admin checks operations table | All live tickets render | Real tickets displayed | Pass Evidence | — |
| `admin_06_permissions.png` | `SUPER_ADMIN` | `/admin/permissions` | — | Open permissions matrix | Access control table renders | Interactive toggle matrix active | Pass Evidence | — |
| `admin_09_billing.png` | `SUPER_ADMIN` | `/admin/billing` | — | Open admin billing ledger | Verified revenue table | Displays mock settled transactions | Defect Evidence | `DEF-004` |
| `rbac_client_access__boost.png` | `USER` | `/boost` | — | Client navigates to `/boost` | Blocked / Redirected | Unprotected: renders internal portal | Defect Evidence | `DEF-001` |
| `rbac_client_access__lead.png` | `USER` | `/lead` | — | Client navigates to `/lead` | Blocked / Redirected | Unprotected: renders internal portal | Defect Evidence | `DEF-001` |
| `rbac_client_access__design_dashboard.png` | `USER` | `/design/dashboard` | — | Client navigates to `/design` | Blocked / Redirected | Unprotected: renders internal portal | Defect Evidence | `DEF-001` |
| `rbac_boost_access__lead.png` | `COMPANY_BOOST` | `/lead` | — | Boost specialist opens `/lead` | Blocked / Redirected | Unprotected: renders lead portal | Defect Evidence | `DEF-001` |
| `rbac_lead_access__boost.png` | `COMPANY_LEAD` | `/boost` | — | Lead specialist opens `/boost` | Blocked / Redirected | Unprotected: renders boost portal | Defect Evidence | `DEF-001` |
