<div align="center">
  <img src="public/banner.png" alt="Premium Invitation Banner" width="100%" />

  # 🏛️ THE INVITE MASTER COMMAND CENTER
  **High-Performance SaaS for Premium Digital Invitations**

  [![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com)
  [![Bun](https://img.shields.io/badge/Bun-1.1-f9f1e1?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh)
  [![Typescript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
  [![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
  [![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

  ---

  <p align="center">
    <a href="#-project-philosophy"><strong>Philosophy</strong></a> •
    <a href="#-tech-stack-deep-dive"><strong>Tech Stack</strong></a> •
    <a href="#-core-features"><strong>Features</strong></a> •
    <a href="#-master-architecture"><strong>Architecture</strong></a> •
    <a href="#-getting-started"><strong>Getting Started</strong></a> •
    <a href="#-administrative-playbook"><strong>Admin Ops</strong></a>
  </p>

</div>

---

## 💎 Project Philosophy
**Premium Invitation** is a high-fidelity digital ecosystem designed for sacred life events. We bridge the gap between traditional luxury and modern performance. Our goal is to provide a "Zero-Latency" experience where every interaction feels instantaneous and every design choice screams "Premium".

> **The Identity**: Minimalist, Luxurious, and Uncompromising on Speed.

---

## ⚡ Tech Stack Deep Dive

We chose our stack for maximum performance and developer velocity:

- **Frontend**: [Nuxt 4](https://nuxt.com) - The cutting-edge Vue framework for universal rendering and optimized performance.
- **Runtime**: [Bun](https://bun.sh) - For ultra-fast execution, package management, and built-in SQLite support.
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Optimized utility-first CSS for bespoke, responsive designs.
- **Database**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) with [Drizzle ORM](https://orm.drizzle.team/) - In-process storage for $< 1ms$ query latency.
- **Authentication**: [Better Auth](https://www.better-auth.com/) - Secure, modular authentication with support for Social (Google) and Email/Password.
- **Automation**: [Puppeteer](https://pptr.dev/) - Headless browser automation for real-time transaction scraping.
- **Observability**: [Sentry](https://sentry.io) - Real-time error tracking and performance monitoring.
- **Animations**: [Motion (Framer Motion for Vue)](https://motion.dev/) - Smooth, high-performance UI transitions.

---

## ✨ Core Features

### 🛠️ The Real-Time Editor
- **WYSIWYG Experience**: Change colors, fonts, and layouts with instant preview.
- **Cinematic RSVP**: Beautifully crafted forms for guest confirmation.
- **Music Autoplay**: Immersive audio experience triggered upon opening.
- **Custom Slugs**: Every invitation gets a unique, branded URL.

### 🤖 Unified Background Worker
- **Telegram Bot Integration**: Command-line control via Telegram for stats and approvals.
- **Auto-Transaction Verification**: Scrapes payment dashboards to verify orders without manual intervention.
- **Auto-Expiry Logic**: Automatically handles plan downgrades and expiration.

### 💳 Premium Payments & Referrals
- **Flip Integration**: Seamless payment processing with automated callbacks.
- **Referral Ledger**: Track and reward users who bring in new business.
- **Flexible Plans**: VIP, Regular, and Free tiers with strict role-based access.

---

## 🏗️ Master Architecture

Engineered for **Zero-Downtime** and **Maximum Observability**.

```mermaid
graph TD
    User([👤 User / Guest]) -->|HTTPS| CF[☁️ Cloudflare Tunnel]
    CF -->|Secure Tunnel| VPS[🏢 Dedicated VPS (Ubuntu)]
    
    subgraph "VPS Server Environment"
        Nginx[🌐 Reverse Proxy] -->|Port 3000| App[⚡ Nuxt 4 App (Nitro)]
        
        App -->|Query| DB[(🗄️ SQLite + Drizzle)]
        
        Worker[🤖 Unified Worker] -->|Polls| TG[Telegram API]
        Worker -->|Headless Scrape| GF[GoFood Dashboard]
        Worker -->|Writes| DB
        
        Cron[⏱️ Cron Scheduler] -->|Trigger| Worker
    end
    
    TG -->|Notification| Admin([👑 Admin])
```

---

## 📂 Project Structure

```text
├── app/                  # Frontend Application (Nuxt/Vue)
│   ├── components/       # UI Components
│   ├── pages/            # View Routes
│   ├── assets/           # Global Styles & Assets
│   └── composables/      # Shared Logic
├── server/               # Nitro Backend
│   ├── api/              # API Endpoints
│   ├── db/               # Drizzle Schema & Config
│   ├── middleware/       # Auth & Security
│   └── utils/            # Shared Server Utilities
├── scripts/              # Administrative & Tooling
│   ├── deploy/           # Deployment automation
│   ├── tools/            # Maintenance utilities
│   └── tests/            # Integration & Unit tests
├── public/               # Static Assets
├── worker.ts             # Background Automation Engine
└── drizzle.config.ts     # Database Configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Bun** (v1.1+) `curl -fsSL https://bun.sh/install | bash`
- **Node** (v20+)
- **WSL2** (If on Windows)

### Quick Start
```bash
# 1. Clone & Install
git clone <repo_url>
cd premium-invitation
bun install

# 2. Environment Setup
cp .env.clean .env
# Required: DATABASE_URL, BETTER_AUTH_SECRET, TELEGRAM_BOT_TOKEN, FLIP_SECRET_KEY

# 3. Database Migration
bun run migrate.ts

# 4. Ignite Engine
bun dev
```

---

## 🛠️ Administrative Playbook

Technical Reference for System Administrators.

### 🔐 User & Auth Management
- `bun create-admin-account.ts`: Provision a new admin user.
- `bun reset-admin.ts`: Emergency password reset.
- `bun list-users.ts`: audit existing user base.

### 🗄️ Database Utilities
- `bun check-db.ts`: Verify database integrity and connection.
- `bun migrate-to-camelcase.ts`: Script for schema naming convention updates.
- `bun clear-sessions.ts`: Flush all active authentication sessions.

### 🤖 Worker Operations
- `bun worker.ts`: Start the background automation engine.
- `bun test-whatsapp.ts`: Verify WhatsApp notification delivery.
- `bun test-expiry-logic.ts`: Dry-run for the plan expiration scheduler.

### 🚨 Monitoring & Deployment
- `pm2 logs`: View real-time application logs.
- `pm2 restart all`: Cold restart of the entire ecosystem.
- `./deploy.sh`: Trigger the zero-downtime deployment script.

---

## 📝 Recent Updates

Check out the detailed [CHANGELOG.md](CHANGELOG.md) (or see the bottom of `README.md` for historical Dec 2025 updates).

<p align="center">
  <b>Built for permanence. Engineered with integrity.</b><br>
  <sub>Copyright &copy; 2025 Undangan SaaS • NieVl</sub>
</p>

