# CreativeGini ✦ Autonomous AI Growth Engine

> The Autonomous AI Growth Engine for Strategy, Content & Multi-Channel Scaling.

Developed by **[Datai2i](https://www.datai2i.com/)**.

---

## ✦ Overview

**CreativeGini** is a next-generation marketing intelligence and autonomous content generation platform designed to eliminate agency bloat and streamline omni-channel growth. It provides deep audience intelligence, automated creative production, and real-time multi-platform campaign management inside an immersive, cosmic-themed digital matter experience.

---

## ✦ Key Features

### 1. Cinematic Cosmic Landing Experience
- **Scroll-Controlled 3D Rolling Hero**: A multi-stage opening title sequence powered by GSAP and Lenis smooth inertial scrolling.
- **Interactive 3D Marketing Globe**: Real-time particle physics sphere visualizing 12+ leading marketing platforms (Instagram, Google Ads, TikTok, Reddit, LinkedIn, YouTube, Meta, X, Discord, Pinterest, Substack, Product Hunt) with detailed reach analytics and advertising benchmarks.
- **Omni-Channel Mobile Chip Selector**: One-tap horizontal swipeable platform chips designed specifically for fluid touch exploration on mobile devices.
- **Cinematic Marketing Journey**:
  - **Scene 01 · Market Discovery**: Interactive intelligence vortex mapping high-intent queries and discussions.
  - **Scene 02 · Creative Production**: Creative nexus visualizing cross-format assets (video, 3D motion, articles, ads).
  - **Scene 03 · Strategy Pipeline**: Step-by-step pipeline connecting ICP mapping to customer conversion.
  - **Scene 04 · Financial Burn Rate**: Dynamic floating money notes and cost comparison calculation.
  - **Scene 07 · Solution Reveal**: Autonomous AI Pod Squad reveal.
- **Cosmic Dark Theme**: Tailored glassmorphism, responsive ambient glows, and interactive parallax starfields.

### 2. Autonomous Growth Dashboard
- **Comprehensive Workspace**: Seamless switching between the public landing experience and the authenticated client dashboard.
- **8 Dedicated Growth Views**:
  - **Overview**: Core KPIs, growth velocity, and active channels.
  - **Strategic Planner**: AI-assisted market analysis and funnel strategy.
  - **Creative Planner**: Automated ad creative, copy, and asset builder.
  - **DevRel Planner**: Technical outreach, developer community engagement, and documentation marketing.
  - **Pod Squad**: Autonomous agent pods executing targeted campaign workflows.
  - **Team**: Role-based access control and member permissions.
  - **Billing**: Real-time credit usage, invoice history, and subscription management.
  - **Settings**: Workspace customization and API configurations.
- **Interactive Modals**: New Campaign launcher, Credit Top-Up portal, and Help & Support center.

---

## ✦ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Animation & Physics**:
  - [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform) + [ScrollTrigger](https://greensock.com/scrolltrigger/)
  - [Lenis](https://lenis.darkroom.engineering/) (Smooth Inertial Scrolling)
  - [Three.js](https://threejs.org/) + HTML5 Canvas 2D particle simulation engines
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Pure Modern Vanilla CSS (Cosmic Dark Glassmorphism, HSL tailored tokens, zero bloated utility frameworks)

---

## ✦ Project Structure

```
creativegini/
├── public/
│   ├── logos/                     # Official platform vector logos (12 SVGs)
│   ├── datai2i-logo.png           # Datai2i developer logo
│   ├── logo-icon.png              # Favicon & mini badge
│   └── logo.png                   # Full brand logo
├── src/
│   ├── components/
│   │   ├── common/                # Shared UI (CosmicSpaceCanvas, GoogleAuthModal, Toast)
│   │   ├── dashboard/             # AI Growth Engine Dashboard
│   │   │   ├── modals/            # HelpModal, NewCampaignModal, TopUpModal
│   │   │   ├── views/             # 8 Dashboard Views (Overview, Creative, DevRel, etc.)
│   │   │   ├── Dashboard.jsx      # Main dashboard shell
│   │   │   ├── Sidebar.jsx        # Dashboard navigation drawer
│   │   │   └── TopBar.jsx         # Header & user profile
│   │   └── landing/               # Public Marketing Landing Page
│   │       ├── animations/        # 3D Globe, Vortex, Nexus, Money, Character & Magic
│   │       ├── CreativeGiniEndExperience.jsx
│   │       ├── Footer.jsx
│   │       ├── IntroExperience.jsx
│   │       ├── MarketingChannelsSection.jsx
│   │       ├── MarketingJourney.jsx
│   │       └── Navbar.jsx
│   ├── data/                      # Marketing platform & financial data
│   │   ├── marketingCosts.js
│   │   └── marketingPlatforms.js
│   ├── styles/                    # Centralized styling
│   │   ├── dashboard.css          # Dashboard maximalist dark styles
│   │   ├── index.css              # Core typography, tokens & utilities
│   │   └── landing-theme.css      # Cosmic digital matter landing styles
│   ├── App.jsx                    # Root application state & router
│   └── main.jsx                   # Vite React entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## ✦ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/creativegini.git
   cd creativegini
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server with hot-module reloading:
```bash
npm run dev
```

Open your browser at `http://localhost:5173/` (or the port indicated in your terminal).

### Production Build

To compile a production-ready optimized bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## ✦ Mobile Responsiveness

CreativeGini is engineered for flawless cross-device performance:
- **Desktop (> 1024px)**: Cinematic 300vw pinned horizontal scroll journey with 3D canvas particle transitions.
- **Mobile (< 1024px)**: Automatically switches to an unpinned, native vertical flow with horizontal touch carousels, responsive 2-column discovery cards, and non-blocking touch interaction (`touch-action: pan-y`).

---

## ✦ Developed By

Crafted with excellence by **[Datai2i](https://www.datai2i.com/)** — Intelligent Digital Transformation & AI Solutions.