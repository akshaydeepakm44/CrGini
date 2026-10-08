# CREATIVEGINI QA PAGE INVENTORY

**Scope:** Complete platform URL surface inspection across all roles.  
**Rule:** Only physically visited and browser-rendered pages are inventoried.

---

| Route | Role | Page Name | Loads? | Functional? | UI Quality | Console Errors | Network Errors | Screenshot | Defects |
|---|---|---|---|---|---|---|---|---|---|
| `/signin` | Unauthenticated | Sign In Portal | YES | YES | High (Glassmorphic) | None | None | `phase_a_01_client.png` | None |
| `/portal` | `USER` | Client Portal Home | YES | YES | High (Modern Tailwind/CSS) | None | None | `phase_a_01_client.png` | None |
| `/portal/dashboard` | `USER` | Client Dashboard | YES | YES | High | None | None | `phase_b_01_dashboard.png` | None |
| `/portal/boosting` | `USER` | Boosting Services Catalog | YES | YES | High | None | None | `phase_b_02_boosting.png` | None |
| `/portal/boosting/strategic-planner` | `USER` | Strategic Planner Detail | YES | YES | High | None | None | `s1_02_boosting_channel.png` | None |
| `/portal/digitalising` | `USER` | Digitalising Services Catalog | YES | YES | High | None | None | `phase_b_03_digitalising.png` | None |
| `/portal/digitalising/custom` | `USER` | Custom Intelligence Scope | YES | YES | High | None | None | `phase_b_03_digitalising.png` | None |
| `/portal/requests` | `USER` | My Requests Queue | YES | YES | High | None | None | `phase_b_04_requests.png` | None |
| `/portal/requests/:ticketId` | `USER` | Request Detail & Reviews | YES | YES | Medium-High | None | None | `s1_09_ticket_detail.png` | `DEF-005` (Scroll) |
| `/portal/deliverables` | `USER` | Deliverables Center | YES | YES | High | None | None | `phase_b_05_deliverables.png` | None |
| `/portal/messages` | `USER` | Communications Hub | YES | YES | High | None | None | `phase_b_06_messages.png` | None |
| `/portal/billing` | `USER` | Billing & Ledger | YES | YES (Mock/Internal) | High | None | None | `phase_b_07_billing.png` | `DEF-004` (No Gateway) |
| `/portal/profile` | `USER` | Company Profile | YES | YES | High | None | None | `phase_b_08_profile.png` | None |
| `/lead` | `COMPANY_LEAD` | Lead Dashboard Home | YES | YES | High | None | None | `phase_a_02_lead.png` | `DEF-001` (Unprotected) |
| `/lead/dashboard` | `COMPANY_LEAD` | Lead Specialist Metrics | YES | YES | High | None | None | `s8_11_lead_dashboard.png` | None |
| `/lead/requests` | `COMPANY_LEAD` | Lead Requests Queue | YES | YES | High | None | None | `s8_12_lead_requests_queue.png` | None |
| `/lead/requests/:ticketId` | `COMPANY_LEAD` | Lead Ticket Workspace | YES | YES | High | None | None | `s8_13_specialist_ticket_workspace.png` | None |
| `/lead/leads` | `COMPANY_LEAD` | Prospect Database View | YES | YES | High | None | None | `phase_a_02_lead.png` | None |
| `/lead/studies` | `COMPANY_LEAD` | Company Study Vault | YES | YES | High | None | None | `phase_a_02_lead.png` | None |
| `/lead/key-people` | `COMPANY_LEAD` | Executive Contacts Hub | YES | YES | High | None | None | `phase_a_02_lead.png` | None |
| `/lead/deliverables` | `COMPANY_LEAD` | Deliverables Queue | YES | YES | High | None | None | `s8_16_v1_deliverable_submitted.png` | None |
| `/lead/messages` | `COMPANY_LEAD` | Lead Messaging Pod | YES | YES | High | None | None | `s8_13b_specialist_messages_tab.png` | None |
| `/boost` | `COMPANY_BOOST` | Boost Dashboard Home | YES | YES | High | None | None | `phase_a_03_boost.png` | `DEF-001` (Unprotected) |
| `/boost/dashboard` | `COMPANY_BOOST` | Boost Strategist Command | YES | YES | High | None | None | `s1_11_boost_dashboard.png` | None |
| `/boost/requests` | `COMPANY_BOOST` | Boost Requests Queue | YES | PARTIAL | High | None | None | `s1_12_boost_requests_queue.png` | `DEF-002` (DevRel Filter) |
| `/boost/requests/:ticketId` | `COMPANY_BOOST` | Boost Workspace | YES | YES | High | None | None | `s1_13_specialist_ticket_workspace.png` | None |
| `/boost/deliverables` | `COMPANY_BOOST` | Deliverable Submissions | YES | YES | High | None | None | `s1_16_v1_deliverable_submitted.png` | None |
| `/boost/messages` | `COMPANY_BOOST` | Boost Messaging | YES | YES | High | None | None | `s1_13b_specialist_messages_tab.png` | None |
| `/design` | `LANDING_PAGE` | Design Portal Home | YES | YES | High | None | None | `phase_a_04_ui.png` | `DEF-001` (Unprotected) |
| `/design/dashboard` | `LANDING_PAGE` | UI/UX Architect Console | YES | YES | High | None | None | `phase_a_04_ui.png` | None |
| `/design/requests` | `LANDING_PAGE` | Design Requests Queue | YES | YES (Internal Only) | High | None | None | `phase_a_04_ui.png` | `DEF-003` (No Client Tickets) |
| `/admin/dashboard` | `SUPER_ADMIN` | Control Center Home | YES | YES | High | None | None | `admin_01_dashboard.png` | None |
| `/admin/operations` | `SUPER_ADMIN` | Operations Queue | YES | YES | High | None | None | `admin_02_operations.png` | None |
| `/admin/clients` | `SUPER_ADMIN` | Client Management | YES | YES | High | None | None | `admin_03_clients.png` | None |
| `/admin/team` | `SUPER_ADMIN` | Team & Specialists | YES | YES | High | None | None | `admin_04_team.png` | None |
| `/admin/roles` | `SUPER_ADMIN` | Roles Matrix | YES | YES | High | None | None | `admin_05_roles.png` | None |
| `/admin/permissions` | `SUPER_ADMIN` | Permissions Engine | YES | YES | High | None | None | `admin_06_permissions.png` | None |
| `/admin/services` | `SUPER_ADMIN` | Services Observability | YES | YES | High | None | None | `admin_07_services.png` | None |
| `/admin/deliverables` | `SUPER_ADMIN` | Deliverables Review | YES | YES | High | None | None | `admin_08_deliverables.png` | None |
| `/admin/billing` | `SUPER_ADMIN` | Billing Ledger | YES | YES | High | None | None | `admin_09_billing.png` | None |
| `/admin/messages` | `SUPER_ADMIN` | Communications Center | YES | YES | High | None | None | `admin_10_messages.png` | None |
| `/admin/reports` | `SUPER_ADMIN` | Analytics & Reports | YES | YES | High | None | None | `admin_11_reports.png` | None |
| `/admin/audit` | `SUPER_ADMIN` | Audit Trail Logs | YES | YES | High | None | None | `admin_12_audit.png` | None |
| `/admin/security` | `SUPER_ADMIN` | Security Telemetry | YES | YES | High | None | None | `admin_13_security.png` | None |
| `/admin/settings` | `SUPER_ADMIN` | Platform Settings | YES | YES | High | None | None | `admin_14_settings.png` | None |
