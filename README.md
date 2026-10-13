# CreativeGini — Autonomous AI Growth Engine & Delivery Portal

CreativeGini is an enterprise full-stack platform combining a futuristic public marketing experience with a role-based B2B service delivery portal. The platform automates service fulfillment, structured ticket tracking, revision workflows, client approvals, team permission administration, and real-time notifications.

---

## 📁 Repository Directory Structure

```text
creativegini-main/
├── backend/                      # Node.js + Express + PostgreSQL REST API
│   ├── .env                      # Environment configuration (active)
│   ├── .env.example              # Environment template
│   ├── package.json              # Backend dependencies and scripts
│   ├── package-lock.json
│   ├── README.md                 # Backend architecture and API documentation
│   ├── tests/                    # Automated test suites (unit, integration, security, e2e)
│   │   ├── unit/                 # Unit tests (email formatting, deep links, deduplication)
│   │   ├── integration/          # Integration tests (SMTP handshake, password reset, user creation)
│   │   ├── security/             # Security tests (tenant isolation, IDOR prevention)
│   │   └── e2e/                  # End-to-end tests (onboarding workflows, asset pipelines, request lifecycle)
│   └── src/
│       ├── server.js             # Express application entry point & CORS configuration
│       ├── seed-pg.js            # PostgreSQL database seeder (dev environments only)
│       ├── config/
│       │   └── postgres.js       # PostgreSQL pg pool connection manager & query helper
│       ├── controllers/          # Business logic handlers
│       │   ├── adminController.js        # Admin oversight, specialist assignment, activity logs
│       │   ├── assetController.js        # Media library & onboarding asset queries
│       │   ├── authController.js         # User authentication, JWT issuance, profile lookup
│       │   ├── companyController.js      # Client company profile & pre-researched leads
│       │   ├── notificationController.js # In-app notification creation & read management
│       │   ├── requestController.js      # Service request creation, payment, tickets, messaging
│       │   ├── submissionController.js   # Versioned deliverables, work submissions, client reviews
│       │   └── userController.js         # Client & internal team member CRUD, permissions, audit
│       ├── middleware/
│       │   └── auth.js                   # JWT verification & role-based route guards
│       ├── repositories/         # PostgreSQL Data Access Layer
│       │   ├── activityLogRepository.js  # Audit trail for ticket lifecycle events
│       │   ├── assetRepository.js        # Asset queries & unified media joins
│       │   ├── companyRepository.js      # Client company profiles, research & leads
│       │   ├── messageRepository.js      # Ticket-specific request conversation messages
│       │   ├── notificationRepository.js # In-app notifications with read/unread tracking
│       │   ├── paymentRepository.js      # Payment records & invoice transaction ledger
│       │   ├── requestRepository.js      # Service requests & tickets (status, pricing, assignments)
│       │   ├── submissionRepository.js   # Versioned deliverables (files, links, reviews)
│       │   └── userRepository.js         # Accounts, hashed passwords (bcrypt), roles, permissions
│       ├── routes/               # Express API route declarations
│       │   ├── adminRoutes.js    # /api/admin (users, team-members, permissions, audit logs)
│       │   ├── assetRoutes.js    # /api/assets (media library)
│       │   ├── authRoutes.js     # /api/auth (login, session verification)
│       │   ├── companyRoutes.js  # /api/company (company profiles, research, leads)
│       │   ├── notificationRoutes.js # /api/notifications (feed & mark-as-read)
│       │   └── requestRoutes.js  # /api/requests (tickets, submissions, reviews, chat, payments)
│
├── frontend/                     # React 18 + Vite Web Application
│   ├── index.html                # HTML document template
│   ├── vite.config.js            # Vite build & dev server configuration (Port 5174)
│   ├── package.json              # Frontend dependencies and scripts
│   ├── package-lock.json
│   ├── README.md                 # Frontend component architecture guide
│   ├── public/                   # Static assets & brand media
│   │   ├── logo.png              # Primary CreativeGini logo
│   │   ├── logo-icon.png         # CreativeGini icon mark
│   │   ├── datai2i-logo.png      # Parent developer brand badge
│   │   └── logos/                # Social & advertising platform SVGs
│   └── src/
│       ├── App.jsx               # Root router, session persistence & scroll engines
│       ├── main.jsx              # React DOM entry point wrapped in ErrorBoundary
│       ├── components/
│       │   ├── auth/             # Authentication components
│       │   │   └── SignInPage.jsx        # Glassmorphic login with quick demo credentials
│       │   ├── common/           # Application-wide utility components
│       │   │   ├── CosmicSpaceCanvas.jsx # Three.js dynamic background
│       │   │   ├── ErrorBoundary.jsx     # Graceful crash handler with recovery actions
│       │   │   ├── ProtectedRoute.jsx    # Client-side role-based routing guard
│       │   │   └── Toast.jsx             # Notification toast popup
│       │   ├── dashboard/        # Role-based dashboard interfaces
│       │   │   ├── admin/
│       │   │   │   └── AdminDashboard.jsx       # Client management, users, team permissions, tickets
│       │   │   ├── common/                      # Shared portal widgets & modals
│       │   │   │   ├── ActionMenu.jsx           # Dropdown actions for client user rows
│       │   │   │   ├── ActivityTimeline.jsx     # Embedded audit history timeline
│       │   │   │   ├── ClientReviewSection.jsx  # Deliverable inspection, approval & change requests
│       │   │   │   ├── NotificationPanel.jsx    # Dedicated notification bell drawer
│       │   │   │   ├── PortalCosmicBackground.jsx # Unified dark cosmic theme backdrop
│       │   │   │   └── WorkSubmissionModal.jsx  # Versioned deliverable submission modal
│       │   │   ├── internal/                    # Specialist team dashboards
│       │   │   │   ├── CompanyBoostDashboard.jsx # Outbound automation & growth pipeline
│       │   │   │   ├── CompanyLeadDashboard.jsx  # Prospect intelligence & verified leads
│       │   │   │   └── LandingPageDashboard.jsx  # UI/UX engineering sprint queue
│       │   │   └── user/
│       │   │       └── UserDashboard.jsx        # Client portal (requests, payments, approvals)
│       │   └── landing/          # Public marketing landing page
│       │       ├── Navbar.jsx                   # Sticky navigation bar with quick sign-in
│       │       ├── IntroExperience.jsx          # Hero section with interactive headlines
│       │       ├── MarketingChannelsSection.jsx # Omnichannel marketing showcase
│       │       ├── MarketingJourney.jsx         # Step-by-step conversion funnel visualizer
│       │       ├── CreativeGiniEndExperience.jsx # Interactive 3D call-to-action
│       │       ├── Footer.jsx                   # Brand footer with developer accreditation
│       │       └── animations/                  # Three.js & GSAP animation modules
│       ├── data/                 # Static datasets for pricing & marketing channel metrics
│       │   ├── marketingCosts.js
│       │   └── marketingPlatforms.js
│       ├── services/
│       │   └── api.js            # Centralized fetch client with JWT token management
│       └── styles/               # CSS stylesheets
│           ├── index.css         # Global reset, typography, and landing page styling
│           ├── landing-theme.css # Landing page animations & visual effects
│           ├── portal.css        # Unified dashboard design system (dark cosmic theme)
│           └── signin.css        # Authentication page styling
│
├── README.md                     # Root project documentation (this file)
└── .gitignore                    # Git exclusions
```

---

## 👥 Roles & Access Permissions

| Role | Default Email | Default Password | Default Route | Description |
|---|---|---|---|---|
| **ADMIN** | `team@creativegini.com` | `[Configured in .env]` | `/admin` | Full executive access: manage clients, invite/manage team members, assign granular permissions, oversee all service tickets, force-complete overrides, and revenue tracking. Protected against account deletion. |
| **USER** (Client) | `akhil.k@datai2i.com` / `client@acmecorp.com` | `client123` | `/dashboard` | Client portal: view pre-researched leads, create service requests, pay invoices, inspect deliverables, request revisions, and approve completed work. |
| **COMPANY_LEAD** | `lead@creativegini.com` | `specialist123` | `/company-lead` | Specialist queue: B2B decision-maker research, verified lead lists, data enrichment, and deliverable submission. |
| **COMPANY_BOOST** | `boost@creativegini.com` | `specialist123` | `/company-boost` | Specialist queue: autonomous outbound sales funnels, email automation workflows, campaign execution, and deliverable submission. |
| **LANDING_PAGE** | `ui@creativegini.com` | `specialist123` | `/landing-page-enhancement` | Specialist queue: UI/UX redesigns, conversion architecture sprints, Figma handoffs, and asset delivery. |

---

## 🚀 Key Feature Workflows

### 1. "Submit Completed Work" & Non-Destructive Versioning
- **Initiation**: The `[ Submit Completed Work ]` button is strictly located **inside the specific ticket** for authorized specialists. It is never displayed globally on dashboards and never auto-opens.
- **Submission Modal**:
  - Automatically associates with the active ticket code (e.g. `CG-1001`).
  - Automatically calculates version numbers (`V1`, `V2`, `V3`).
  - Captures Submission Title, Description, File uploads (multi-file with file size and type detection), External Link (e.g. Loom, Figma), and Deliverable Notes.
- **Version History**: All historical versions remain preserved and accessible (ordered newest first). Submissions are never overwritten.
- **Ticket Isolation**: Submissions for `CG-1001` are strictly isolated from `CG-1002`.

### 2. Client Review & Approval Workflow
- **Client Review View**: When work is submitted, the ticket moves to `CLIENT_REVIEW`. The client receives a targeted notification.
- **Action Buttons**:
  - `[ Approve Work ]`: Prompts for confirmation. Sets ticket status to `COMPLETED`, records `approvedAt`, `approvedBy`, `completedAt`, and notifies the assigned specialist.
  - `[ Request Changes ]`: Requires non-empty feedback explaining what modifications are needed. Moves ticket to `CHANGES_REQUESTED` and alerts the assigned specialist with the feedback text.
- **Resubmission**: The specialist views the client's feedback inside the ticket and clicks `[ Submit Completed Work ]`. The system automatically generates `V2`.

### 3. Team Management & Granular Permissions
- **Super Admin Management**: Admin can invite and manage internal specialists via `/api/admin/team-members`.
- **Granular Dashboard Permissions**: Team members can be granted granular access to:
  - `Company Boost` (`companyBoost`)
  - `Company Lead` (`companyLead`)
  - `Company UI` (`companyUI`)
- **Security Guarantees**:
  - Super Admin (`team@creativegini.com`) is permanently protected from deletion.
  - Newly created team members can never be granted `ADMIN` privileges.
  - Backend endpoints strictly verify service-level authorization (`hasServiceTypeAccess`) on all mutating actions.

### 4. Ticket-Specific Request Conversation & Activity Timeline
- **Ticket-Specific Request Conversation**: All communications are tied strictly to the ticket (e.g. `CG-1001`). There are no permanent service-level cross-ticket chats.
- **Activity Timeline**: An audit timeline is embedded inside each ticket detailing every lifecycle action (`REQUEST_CREATED`, `PAYMENT_SUCCESS`, `WORK_STARTED`, `WORK_SUBMITTED`, `CHANGES_REQUESTED`, `WORK_RESUBMITTED`, `WORK_APPROVED`).
- **No Standalone Activity Page**: Standalone activity views have been deprecated in favor of ticket-embedded audit logs.

### 5. Dedicated In-App Notifications
- **Clean Notification Bell**: The notification dropdown strictly houses notifications (separated from messaging UI).
- **Direct Ticket Routing**:
  - Clicking a deliverable notification routes directly to the ticket's review tab.
  - Clicking a message notification routes directly to the ticket's request conversation (`chat`) tab.

---

## 🔄 Service Request & Ticket Lifecycle State Diagram

```text
[Client Creates Request] ──> Status: REQUEST_CREATED (Payment Pending)
           │
           ▼
   [Client Pays via Portal]
           │
           ▼ (Automatic Assignment)
[Ticket Auto-Assigned to Specialist] ──> Status: ASSIGNED
           │                             (Specialist receives in-app notification)
           ▼
[Specialist Clicks "Start Work"] ──> Status: IN_PROGRESS
           │
           ▼
[Specialist Submits Work (V1)] ──> Status: WORK_SUBMITTED / CLIENT_REVIEW
           │                       (Client receives review notification)
           ├─── Client Requests Changes ──> Status: CHANGES_REQUESTED
           │                                 │
           │                                 ▼
           │                     [Specialist Submits Revision (V2)] ──> Status: WORK_RESUBMITTED / CLIENT_REVIEW
           │                                                                     │
           └─── Client Approves Deliverable ◄────────────────────────────────────┘
                       │
                       ▼
               Status: COMPLETED
               (approvedAt, approvedBy, completedAt saved; Specialist notified)
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Active PostgreSQL instance (v14+ configured in `backend/.env`)

### 1. Backend Setup
```bash
cd backend
npm install

# (Optional) Seed the database with default accounts and demo tickets:
npm run seed

# Start the backend server (runs on port 5000):
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite development server (runs on port 5174):
npm run dev
```

### 3. Accessing the Application
- Public Landing Page: [http://localhost:5174/](http://localhost:5174/)
- Sign In Portal: [http://localhost:5174/signin](http://localhost:5174/signin)
- User Dashboard: [http://localhost:5174/dashboard](http://localhost:5174/dashboard)
- Admin Dashboard: [http://localhost:5174/admin](http://localhost:5174/admin)
- Specialist Dashboards:
  - Company Boost: [http://localhost:5174/company-boost](http://localhost:5174/company-boost)
  - Company Lead: [http://localhost:5174/company-lead](http://localhost:5174/company-lead)
  - Company UI: [http://localhost:5174/landing-page-enhancement](http://localhost:5174/landing-page-enhancement)

---

## 🛠️ Verification & Build Commands

- **Frontend Production Build**:
  ```bash
  npm.cmd --prefix frontend run build
  ```
- **Backend Syntax Verification**:
  ```bash
  node --check backend/src/server.js
  ```
