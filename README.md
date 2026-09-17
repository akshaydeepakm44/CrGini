# CreativeGini — Autonomous AI Growth Engine & Delivery Portal

CreativeGini is a full-stack platform combining a futuristic public marketing experience with a role-based B2B service delivery portal. The platform automates service fulfillment, Jira-style ticket tracking, revision workflows, client approvals, and real-time notifications.

---

## 📁 Repository Directory Structure

```text
creativegini-main/
├── backend/                      # Node.js + Express + MongoDB REST API
│   ├── .env                      # Environment configuration (active)
│   ├── .env.example              # Environment template
│   ├── package.json              # Backend dependencies and scripts
│   ├── package-lock.json
│   ├── README.md                 # Backend architecture and API documentation
│   └── src/
│       ├── server.js             # Express application entry point & CORS configuration
│       ├── seed.js               # Database seeder (creates default admin, specialists, clients)
│       ├── config/
│       │   └── db.js             # MongoDB Mongoose connection manager
│       ├── controllers/          # Business logic handlers
│       │   ├── authController.js         # User authentication, JWT issuance, profile lookup
│       │   ├── companyController.js      # Client company profile & pre-researched leads
│       │   ├── notificationController.js # In-app notification creation & read management
│       │   ├── requestController.js      # Service request creation & payment processing
│       │   ├── submissionController.js   # Specialist deliverables, versions & client reviews
│       │   └── userController.js         # Admin client user CRUD & password resets
│       ├── middleware/
│       │   └── authMiddleware.js         # JWT verification & role-based route guard
│       ├── models/               # Mongoose schema definitions
│       │   ├── ActivityLog.js    # Audit trail for ticket lifecycle events
│       │   ├── Company.js        # Client company profiles & intelligence records
│       │   ├── Message.js        # Internal Jira ticket conversation messages
│       │   ├── Notification.js   # In-app notifications with read/unread status
│       │   ├── Payment.js        # Payment records & financial audit transactions
│       │   ├── Request.js        # Service requests & tickets (lifecycle, pricing, assignments)
│       │   ├── Submission.js     # Versioned deliverables (files, links, reviews)
│       │   └── User.js           # Accounts, hashed passwords (bcrypt), and roles
│       └── routes/               # Express API route declarations
│           ├── adminRoutes.js    # Administrative metrics, users & force-complete overrides
│           ├── authRoutes.js     # /api/auth (login, session verification)
│           ├── companyRoutes.js  # /api/company (company profiles & lead intelligence)
│           ├── notificationRoutes.js # /api/notifications (feed & mark-as-read)
│           └── requestRoutes.js  # /api/requests (tickets, status updates, reviews, submissions)
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
│       │   │   │   └── AdminDashboard.jsx       # Executive administration, user management, tickets
│       │   │   ├── common/                      # Shared portal widgets & modals
│       │   │   │   ├── ActionMenu.jsx           # Dropdown actions for table rows
│       │   │   │   ├── ActivityTimeline.jsx     # Jira-style audit history timeline
│       │   │   │   ├── ClientReviewSection.jsx  # Deliverable inspection, approval & change requests
│       │   │   │   ├── NotificationPanel.jsx    # Topbar notification drawer
│       │   │   │   ├── PortalCosmicBackground.jsx # Unified dark cosmic theme backdrop
│       │   │   │   └── WorkSubmissionModal.jsx  # Deliverable submission modal for specialists
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
| **ADMIN** | `admin@creativegini.com` | `admin123` | `/admin` | Full system access: manage clients, reset passwords, oversee all service tickets, force-complete overrides, and revenue tracking. |
| **USER** (Client) | `client@acmecorp.com` | `client123` | `/dashboard` | Client portal: view pre-researched leads, create service requests, pay invoices, review deliverables, request revisions, and approve completed work. |
| **COMPANY_LEAD** | `lead@creativegini.com` | `specialist123` | `/company-lead` | Specialist queue: B2B decision-maker research, verified lead lists, data enrichment, and deliverable submission. |
| **COMPANY_BOOST** | `boost@creativegini.com` | `specialist123` | `/company-boost` | Specialist queue: autonomous outbound sales funnels, email automation workflows, and campaign execution. |
| **LANDING_PAGE** | `ui@creativegini.com` | `specialist123` | `/landing-page-enhancement` | Specialist queue: UI/UX redesigns, conversion architecture sprints, Figma handoffs, and asset delivery. |

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Active connection (MongoDB Atlas URI configured in `backend/.env`)

### 1. Backend Setup
```bash
cd backend
npm install

# (Optional) Seed the database with default test accounts and demo tickets:
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

### 3. Open the Application
- Public Landing Page: [http://localhost:5174/](http://localhost:5174/)
- Sign In Portal: [http://localhost:5174/signin](http://localhost:5174/signin)

---

## 🔄 Service Request & Ticket Lifecycle

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
[Specialist Submits Work (v1)] ──> Status: WORK_SUBMITTED / CLIENT_REVIEW
           │                       (Client receives notification to review)
           ├─── Client Requests Changes ──> Status: CHANGES_REQUESTED
           │                                 │
           │                                 ▼
           │                     [Specialist Submits Revision (v2)] ──> Status: WORK_RESUBMITTED
           │                                                                     │
           └─── Client Approves Deliverable ◄────────────────────────────────────┘
                       │
                       ▼
               Status: COMPLETED
               (Both Client and Specialist receive completion notifications)
```

---

## 🛠️ Verification & Build Commands

- **Production Build**:
  ```bash
  npm.cmd --prefix frontend run build
  ```
- **Backend Server**:
  ```bash
  npm.cmd --prefix backend run dev
  ```
