# CreativeGini Backend API Service

The CreativeGini backend is a RESTful API built with **Node.js (ES Modules)**, **Express**, and **MongoDB (Mongoose)**. It provides authentication, role-based access control, service request tracking, payment simulation, versioned deliverable submissions, and in-app notifications.

---

## 📁 Backend Directory Structure

```text
backend/
├── .env                         # Active environment variables (PORT, MONGODB_URI, JWT_SECRET)
├── .env.example                 # Template for environment configuration
├── package.json                 # Dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv)
└── src/
    ├── server.js                # Express app initialization, CORS policy, route mounting
    ├── seed.js                  # Database seeder script with demo users and service tickets
    │
    ├── config/
    │   └── db.js                # Mongoose connection configuration with error handling
    │
    ├── controllers/             # Request handling and business logic
    │   ├── authController.js         # User registration, login, and token verification
    │   ├── companyController.js      # Client company profile & pre-researched leads
    │   ├── notificationController.js # In-app notification feed & read status updates
    │   ├── requestController.js      # Ticket creation, payments, automatic assignment, lifecycle
    │   ├── submissionController.js   # Deliverable uploads, versioning, and client approvals
    │   └── userController.js         # User administration, role management, password resets
    │
    ├── middleware/              # Express middlewares
    │   └── authMiddleware.js         # JWT validation & role authorization guards
    │
    ├── models/                  # Mongoose data models
    │   ├── ActivityLog.js       # Audit timeline events (action, user, timestamp, metadata)
    │   ├── Company.js           # Client organization profile, industry, pre-researched leads
    │   ├── Message.js           # Ticket conversation thread messages
    │   ├── Notification.js      # Notification items with read/unread tracking
    │   ├── Payment.js           # Transaction audit log (amount, status, payment method)
    │   ├── Request.js           # Service request tickets (status, team, specialist, pricing)
    │   ├── Submission.js        # Versioned deliverables (files, review feedback, approval)
    │   └── User.js              # User model with bcrypt password hashing and roles
    │
    └── routes/                  # API route endpoints
        ├── adminRoutes.js       # Admin oversight: /api/admin/users, /api/admin/override
        ├── authRoutes.js        # Authentication: /api/auth/login, /api/auth/me
        ├── companyRoutes.js     # Company data: /api/company/my-company
        ├── notificationRoutes.js # Notifications: /api/notifications
        └── requestRoutes.js     # Requests & tickets: /api/requests
```

---

## 🔐 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticates credentials, returns JWT token and user profile.
- `GET /api/auth/me` — Returns the authenticated user's current session profile.

### Service Requests & Tickets (`/api/requests`)
- `GET /api/requests` — Returns tickets accessible to the user (filtered by role).
- `POST /api/requests` — Creates a new service request (status: `REQUEST_CREATED`).
- `POST /api/requests/:id/pay` — Simulates payment; **automatically assigns** the ticket to the designated specialist team and dispatches an assignment notification.
- `PATCH /api/requests/:id/status` — Updates ticket status (e.g. `IN_PROGRESS`).
- `POST /api/requests/:id/submissions` — Specialist submits deliverables (v1, v2, etc.).
- `POST /api/requests/:id/submissions/:subId/review` — Client approves or requests revisions.
- `GET /api/requests/:id/activity` — Returns the audit timeline for an individual ticket.
- `GET /api/requests/:id/messages` — Returns the Jira conversation stream for the ticket.
- `POST /api/requests/:id/messages` — Appends a new message to the ticket conversation.

### Administrative Oversight (`/api/admin`)
- `GET /api/admin/users` — Lists all registered client users.
- `POST /api/admin/users` — Creates a new client user with pre-populated company data.
- `POST /api/admin/users/:id/reset-password` — Generates a new secure password.
- `DELETE /api/admin/users/:id` — Removes a client account.
- `POST /api/admin/override/:id` — Administrative override to force mark a ticket as `COMPLETED` with mandatory audit logging.

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
