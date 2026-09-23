# CreativeGini Backend API Service

The CreativeGini backend is a RESTful API built with **Node.js (ES Modules)**, **Express**, and **MongoDB (Mongoose)**. It provides authentication, role-based access control, service request tracking, payment simulation, versioned deliverable submissions, ticket conversations, and in-app notifications.

---

## 📁 Backend Directory Structure

```text
backend/
├── .env                         # Active environment variables (PORT, MONGODB_URI, JWT_SECRET)
├── .env.example                 # Template for environment configuration
├── package.json                 # Dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv)
├── package-lock.json
├── README.md                    # Backend architecture and API documentation
└── src/
    ├── server.js                # Express app initialization, CORS policy, route mounting
    ├── seed.js                  # Database seeder script with demo users and service tickets
    │
    ├── config/
    │   └── db.js                # Mongoose connection manager with auto-reconnect logic
    │
    ├── controllers/             # Request handling and business logic
    │   ├── authController.js         # User registration, login, readyState check, token verification
    │   ├── companyController.js      # Client company profile & pre-researched leads
    │   ├── notificationController.js # In-app notification feed & read status updates
    │   ├── requestController.js      # Ticket creation, payments, automatic assignment, lifecycle, chat
    │   ├── submissionController.js   # Versioned deliverables, work submissions, approvals, change requests
    │   └── userController.js         # User & team member management, permissions, audit logs
    │
    ├── middleware/              # Express middlewares
    │   └── auth.js                   # JWT validation (`protect`) & role authorization (`authorize`)
    │
    ├── models/                  # Mongoose data models
    │   ├── ActivityLog.js       # Audit timeline events (action, user, timestamp, metadata)
    │   ├── Company.js           # Client organization profile, industry, pre-researched leads
    │   ├── Message.js           # Ticket conversation thread messages
    │   ├── Notification.js      # Notification items with read/unread tracking
    │   ├── Payment.js           # Transaction audit log (amount, status, payment method)
    │   ├── Request.js           # Service request tickets (status, team, specialist, pricing)
    │   ├── Submission.js        # Versioned deliverables (files, review feedback, approval)
    │   └── User.js              # User model with bcrypt password hashing, roles, and dashboardAccess
    │
    └── routes/                  # API route endpoints
        ├── adminRoutes.js       # Admin oversight: /api/admin/users, /api/admin/team-members, /api/admin/activity-logs
        ├── authRoutes.js        # Authentication: /api/auth/login, /api/auth/me
        ├── companyRoutes.js     # Company data: /api/company/my-company
        ├── notificationRoutes.js # Notifications: /api/notifications
        └── requestRoutes.js     # Requests & tickets: /api/requests
```

---

## 🔐 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticates credentials, returns JWT token and user profile.
- `GET /api/auth/me` — Returns the authenticated user's current session profile with effective dashboard permissions.

### Service Requests & Tickets (`/api/requests`)
- `GET /api/requests` — Returns tickets accessible to the user (filtered by role and permissions).
- `POST /api/requests` — Creates a new service request (status: `REQUEST_CREATED`).
- `GET /api/requests/:id` — Returns full ticket details (accepts MongoDB `_id` or `ticketId` e.g. `CG-1001`).
- `POST /api/requests/:id/pay` — Simulates payment; **automatically assigns** the ticket to the active specialist team and dispatches an assignment notification.
- `PATCH /api/requests/:id/status` — Updates ticket status (e.g. `IN_PROGRESS`). Regular specialists cannot mark `COMPLETED` directly.
- `POST /api/requests/:id/start-work` — Marks ticket `IN_PROGRESS` and logs `WORK_STARTED`.
- `POST /api/requests/:id/assign` — Admin or Lead manual ticket assignment.
- `POST /api/requests/:id/admin-override` — Admin emergency override to mark ticket `COMPLETED` with mandatory audit reason.
- `GET /api/requests/:id/activity` — Returns the audit timeline for an individual ticket.
- `GET /api/requests/:id/messages` — Returns the request conversation stream for the ticket.
- `POST /api/requests/:id/messages` — Appends a new message to the ticket conversation and alerts the counterparty.

### Work Submissions & Client Review (`/api/requests/:id/submissions`)
- `GET /api/requests/:id/submissions` — Returns all deliverables for a ticket, sorted newest first (`version: -1`).
- `POST /api/requests/:id/submissions` — Specialist submits deliverables (auto-increments version `V1`, `V2`, etc.; transitions status to `CLIENT_REVIEW`).
- `GET /api/requests/:id/submissions/version/:version` — Retrieves a specific submission version.
- `POST /api/requests/:id/submissions/:submissionId/approve` — Client approves work; sets ticket `COMPLETED`, records `approvedAt`, `approvedBy`, `completedAt`.
- `POST /api/requests/:id/submissions/:submissionId/request-changes` — Client requests changes with mandatory feedback; sets ticket `CHANGES_REQUESTED`.

### Administrative Oversight (`/api/admin`)
- `GET /api/admin/users` — Lists all registered client users.
- `POST /api/admin/users` — Creates a new client user with pre-populated company profile and leads.
- `GET /api/admin/users/:id` — Returns user details.
- `PATCH /api/admin/users/:id` — Updates user information.
- `PATCH /api/admin/users/:id/status` — Toggles active/disabled user status.
- `POST /api/admin/users/:id/reset-password` — Generates a new secure password.
- `DELETE /api/admin/users/:id` — Removes a client account (Super Admin protected).
- `GET /api/admin/team-members` — Lists internal specialists with effective dashboard access.
- `POST /api/admin/team-members` — Invites a new internal team user with granular permissions.
- `PATCH /api/admin/users/:id/permissions` — Updates dashboard permissions (`companyBoost`, `companyLead`, `companyUI`).
- `DELETE /api/admin/team-members/:id` — Removes an internal team user (Super Admin protected).
- `GET /api/admin/activity-logs` — Returns global audit logs.

### In-App Notifications (`/api/notifications`)
- `GET /api/notifications` — Returns notification feed and unread count.
- `PATCH /api/notifications/:id/read` — Marks a specific notification as read.
- `PATCH /api/notifications/read-all` — Marks all notifications as read.

---

## 🚀 Running the Backend

```bash
# Start development server with auto-reload (Port 5000)
npm run dev

# Seed database with default accounts and tickets
npm run seed

# Start production server
npm start
```
