# CreativeGini Frontend Application

The CreativeGini frontend is built with **React 18** and bundled with **Vite**. It features a modern, dark cosmic aesthetic with rich typography, Three.js canvases, GSAP scroll physics, and role-based portal routing.

---

## 📁 Frontend Architecture & Component Directory

```text
frontend/
├── index.html                   # HTML document root with Inter and Space Grotesk Google fonts
├── vite.config.js               # Vite config with React plugin, host '0.0.0.0', port 5174
├── package.json                 # Dependencies (gsap, lenis, three, lucide-react, react-router-dom)
├── public/                      # Static brand assets
│   ├── logo.png                 # CreativeGini logo
│   ├── logo-icon.png            # CreativeGini mark
│   ├── datai2i-logo.png         # Developer accreditation badge
│   └── logos/                   # Social / ad channel platform SVGs
└── src/
    ├── main.jsx                 # Entry point: wraps App in ErrorBoundary & BrowserRouter
    ├── App.jsx                  # Root component: handles session check, scroll engines, routing
    │
    ├── components/
    │   ├── auth/                # Authentication UI
    │   │   └── SignInPage.jsx   # Role sign-in form with one-click demo credentials
    │   │
    │   ├── common/              # Global utility components
    │   │   ├── CosmicSpaceCanvas.jsx # Three.js canvas for particle vortex & background
    │   │   ├── ErrorBoundary.jsx     # Graceful error catcher with reload & home actions
    │   │   ├── ProtectedRoute.jsx    # Enforces JWT session & role access
    │   │   └── Toast.jsx             # Ephemeral notification toast banner
    │   │
    │   ├── dashboard/           # Role-based dashboard interfaces
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.jsx       # Tabbed admin: users, metrics, tickets, override
    │   │   │
    │   │   ├── internal/                    # Specialist team dashboards
    │   │   │   ├── CompanyBoostDashboard.jsx # Outbound automation ticket queue & health
    │   │   │   ├── CompanyLeadDashboard.jsx  # Lead research ticket queue & breakdown
    │   │   │   └── LandingPageDashboard.jsx  # UI/UX engineering sprint queue & deliverables
    │   │   │
    │   │   ├── user/
    │   │   │   └── UserDashboard.jsx        # Client portal: requests, payments, approvals
    │   │   │
    │   │   └── common/                      # Shared portal widgets
    │   │       ├── ActionMenu.jsx           # Dropdown table row actions
    │   │       ├── ActivityTimeline.jsx     # Jira-style audit history timeline component
    │   │       ├── ClientReviewSection.jsx  # Deliverables viewer, approval & revision modal
    │   │       ├── NotificationPanel.jsx    # Topbar notification drawer with mark-read
    │   │       ├── PortalCosmicBackground.jsx # Fixed ambient glowing background
    │   │       └── WorkSubmissionModal.jsx  # Versioned deliverable submission modal
    │   │
    │   └── landing/             # Public marketing landing page components
    │       ├── Navbar.jsx                   # Sticky navigation bar with quick sign-in
    │       ├── IntroExperience.jsx          # Hero section with interactive headlines
    │       ├── MarketingChannelsSection.jsx # Omnichannel marketing cards
    │       ├── MarketingJourney.jsx         # Conversion pipeline visualizer
    │       ├── CreativeGiniEndExperience.jsx # Interactive 3D call-to-action
    │       ├── Footer.jsx                   # Brand footer with developer accreditation
    │       └── animations/                  # Three.js & GSAP animation modules
    │
    ├── data/                    # Static datasets
    │   ├── marketingCosts.js    # Industry benchmark cost data
    │   └── marketingPlatforms.js # Marketing channel configurations
    │
    ├── services/                # Network & API layer
    │   └── api.js               # Centralized API service with JWT header injection
    │
    └── styles/                  # Stylesheets
        ├── index.css            # Global CSS reset, typography, and landing page layout
        ├── landing-theme.css    # Landing page visual effects & animations
        ├── portal.css           # Portal design system (dark cosmic theme, buttons, pills, tables)
        └── signin.css           # Authentication page styling
```

---

## 🎨 Design System & CSS Tokens (`styles/portal.css`)

The internal dashboards adhere strictly to the **CreativeGini Dark Cosmic Theme**:

- **Primary Background**: `#030712` / `#06111A`
- **Surface Panels**: `rgba(4, 12, 18, 0.85)` with `1px solid rgba(255, 255, 255, 0.08)`
- **Primary Text**: `#F5F5F5` (Headings, titles, high-priority labels)
- **Secondary Text**: `#CBD5E1` (Descriptions, body text, form labels)
- **Muted Text**: `#94A3B8` (Timestamps, counts, metadata)
- **Cyan Accent**: `#00D9FF` (Interactive links, active tabs, highlights)
- **Gold Accent**: `#FFB000` (Pending reviews, warnings, revisions)
- **Mint / Emerald**: `#10B981` / `#34D399` (Success pills, completed metrics)

---

## 🚀 Development Scripts

```bash
# Run local development server (Port 5174)
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```
