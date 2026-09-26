# ⚡ ViralRecharge — Full-Stack Viral Referral & Free Mobile Recharge Platform

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_+_Sequelize-4479A1?style=flat&logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Caching-Redis_High--Traffic_Engine-DC382D?style=flat&logo=redis)](https://redis.io/)
[![PWA](https://img.shields.io/badge/Mobile-Chrome_Web_App_(PWA)-6366f1?style=flat&logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![Cluster](https://img.shields.io/badge/Clustering-PM2_Multi--Core-2B037A?style=flat&logo=pm2)](https://pm2.keymetrics.io/)
[![Responsive](https://img.shields.io/badge/Design-100%25_Responsive_Mobile_+_Desktop-00d2d3?style=flat)]()
[![License](https://img.shields.io/badge/License-ISC-purple.svg)]()

> **ViralRecharge** is a high-performance, viral referral-based web application and installable Chrome Mobile Web App (PWA). Users complete sponsor micro-tasks (website visits, ads, YouTube subscriptions, videos, social follows) to earn credits and redeem them for **100% free mobile talktime and data recharges** across India (Jio, Airtel, Vi, and BSNL).
> Built with enterprise-grade **Redis caching**, **distributed concurrency locks**, **90-day persistent JWT sessions**, **client-side task versioning**, and **PWA offline shell precaching**.

---

## 📑 Table of Contents

1. [Key Viral Mechanic (4X Bonus Multiplier)](#-key-viral-mechanic-4x-bonus-multiplier)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [📱 Mobile Chrome Web App (PWA) & Offline Usage Guide](#-mobile-chrome-web-app-pwa--offline-usage-guide)
4. [⚡ High-Traffic Redis Architecture & Distributed Caching](#-high-traffic-redis-architecture--distributed-caching)
5. [📦 Client-Side Task Caching & 304 Version-Aware Delivery](#-client-side-task-caching--304-version-aware-delivery)
6. [📺 YouTube Subscription Verification Hub](#-youtube-subscription-verification-hub)
7. [📋 Prerequisites Checklist](#-prerequisites-checklist)
8. [⚡ Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
9. [🗄️ Database & Redis Setup](#-database--redis-setup)
10. [⚙️ Environment Variables Reference](#-environment-variables-reference)
11. [▶️ Running the Application](#-running-the-application)
12. [🧪 Automated Test Suites (Redis & YouTube)](#-automated-test-suites-redis--youtube)
13. [🖥️ Production VPS Sizing for 1 Lakh (100,000) Realtime Users](#-production-vps-sizing-for-1-lakh-100000-realtime-users)
14. [👥 Demo Accounts & Testing Credentials](#-demo-accounts--testing-credentials)
15. [📡 API Endpoints Reference](#-api-endpoints-reference)
16. [🛡️ Security, Anti-Fraud & Concurrency Engine](#-security-anti-fraud--concurrency-engine)
17. [❓ Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🚀 Key Viral Mechanic (4X Bonus Multiplier)

ViralRecharge implements an exponential growth loop centered around a **2-Hour 4X Countdown Challenge**:

```
User Registers
      │
      ▼
Receive 25 Welcome Credits
      │
      ▼
2-Hour Countdown Timer Starts (Dashboard)
      │
      ├─── Invites 2 friends in < 2 hrs ───► Bonus Multiplies 4X to 100 Credits! 🎉
      │                                       Friends also get 25 CR + 2-Hour Timer
      │                                       (Exponential viral cycle repeats)
      │
      └─── Timer expires (> 2 hrs) ───────► Standard rate continues (50 CR / referral)
```

1. **Welcome Bonus**: Every new user receives **25 Credits** in their wallet upon account creation.
2. **2-Hour Timer**: A prominent countdown timer activates on the user's dashboard and referral center.
3. **4X Multiplier**: If the user refers **2 or more friends** before the timer runs out, their welcome bonus immediately multiplies **4x into 100 Credits** with celebratory confetti.
4. **Perpetual Rewards**: Even after the 2-hour window expires, users still earn **50 Credits** for every additional friend who signs up using their referral code.

---

## 🛠️ Tech Stack & Architecture

### Frontend (`client/`)
- **Framework**: React 19 + Vite 8
- **PWA Capabilities**: Service Worker (`sw.js`), Web App Manifest (`manifest.webmanifest`), Standalone Chrome Mobile App support, Offline Pre-caching
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React (`lucide-react`)
- **Feedback**: Canvas Confetti (`canvas-confetti`)
- **Styling**: Vanilla CSS (Custom design system, Dark Mode default, Glassmorphism, CSS Custom Properties, clamp typography)
- **State Management**: React Context (`AuthContext`, `ToastContext`)
- **API Client**: Axios with automatic bearer token injection, refresh token rotation, and `localStorage` task caching

### Backend (`server/`)
- **Runtime**: Node.js v18+ (tested on Node v22)
- **Framework**: Express 4.x
- **In-Memory Cache & Distributed Store**: Redis (`ioredis`) with automatic fallback to memory cache, atomic Lua lock scripts, and `rate-limit-redis`
- **Network Optimization**: Gzip & Brotli HTTP `compression` for all responses > 1KB
- **Multi-Core Clustering**: PM2 cluster configuration (`ecosystem.config.js`)
- **ORM / Database Driver**: Sequelize 6.x + MySQL2 with high-concurrency connection pooling
- **Authentication**: 90-day JWT sessions (`JWT_EXPIRES_IN=90d`) + 180-day refresh tokens + bcryptjs password hashing
- **OAuth & Google API**: Google OAuth 2.0 + YouTube Data API v3 (`googleapis`)
- **Background Cron Engine**: `node-cron` (auto-expires bonus windows, cleans stale sessions, checks task limits)
- **Security Middleware**: Helmet, CORS, Morgan logger, Redis distributed rate-limiting

### Database (`database/`)
- **Engine**: MySQL 8.x / MariaDB (XAMPP default port 3306)
- **Tables (13)**: `users`, `referrals`, `tasks`, `task_completions`, `transactions`, `recharges`, `announcements`, `otp_codes`, `sessions`, `admin_logs`, `partner_channels`, `user_youtube_accounts`, `user_youtube_subscriptions`

---

## 📱 Mobile Chrome Web App (PWA) & Offline Usage Guide

ViralRecharge is a fully compliant Progressive Web App (PWA). Users do **not** need an App Store or Google Play Store to install it — it installs directly from Chrome or Safari onto their phone.

### How to Install on Mobile Phones:

#### On Android (Google Chrome):
1. Visit the platform URL in Google Chrome on your phone.
2. A sleek glassmorphic banner appears: **"📱 Save App to Phone • Fast 1-tap launch • Works online & offline"**.
3. Tap **Install**.
4. Alternatively, tap the Chrome **3-dots menu (⋮)** in the top-right corner and select **"Install app"** or **"Add to Home screen"**.
5. The ViralRecharge app icon appears on your phone's home screen and app drawer. It opens full-screen without URL bars or browser clutter.

#### On iPhone / iPad (Safari):
1. Visit the platform URL in Safari.
2. Tap the **Share** button (box with upward arrow) at the bottom.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. The app will launch in standalone mode with black translucent status bars.

### Offline & Data-Saver Features:
- **Instant App Launch**: The app shell (HTML, CSS, JS, logos, brand fonts) is saved to the phone's flash memory. When opened, it renders in **< 100ms**.
- **90-Day Persistent Login**: Once registered or logged in, the JWT token remains valid for **90 days**. Users do not need to re-login every time they open the app.
- **Offline Task Browsing**: Active tasks are cached on the device, allowing users to browse tasks even with intermittent or offline connectivity.

---

## ⚡ High-Traffic Redis Architecture & Distributed Caching

To support high concurrent traffic without overloading the MySQL database, Redis acts as a high-speed in-memory caching and distributed synchronization layer:

```
[ Incoming User Request ]
            │
            ▼
[ Distributed Rate Limiter ] ───► Redis Atomic Token Bucket (Shared across all cluster nodes)
            │
            ▼
[ Auth Token Verification ] ───► Redis User Session Cache (cache:user:auth:${id})
            │                    ↳ Cache HIT: 0.1ms (Bypasses MySQL completely!)
            │                    ↳ Cache MISS: Fetches MySQL User & caches in Redis
            │
            ▼
   [ Action Request ]
   ├── Task Catalog        ───► Redis Cache (cache:tasks:active_catalog)
   ├── Referral Leaderboard───► Redis Cache (cache:leaderboard:10)
   ├── YouTube Channels    ───► Redis Cache (cache:youtube:partner_channels:active)
   ├── Task Completion     ───► Redis Distributed Lock (lock:task:complete:${userId}:${taskId})
   └── Recharge Redemption ───► Redis Distributed Lock (lock:recharge:redeem:${userId})
```

### Key Redis Capabilities:
1. **JWT Session Caching**: Authenticated user claims are cached in Redis (`cache:user:auth:${id}`, 300s TTL). This single optimization removes **over 95% of database read queries** across all authenticated requests.
2. **Cache-Aside Pattern (`getOrSet`)**: Leaderboards, active task lists, partner channels, and announcements are served directly from Redis memory in ~1ms.
3. **Distributed Concurrency Locks**: Uses atomic Lua scripts (`SET lock:key token NX EX ttl`). This guarantees that double-clicks, script replays, or concurrent requests cannot claim duplicate task rewards or double-spend recharge credits.
4. **Resilient Failover**: If Redis is temporarily stopped or offline during local development, the client smoothly falls back to an internal in-memory cache without crashing or throwing errors.
5. **Non-blocking Pattern Invalidation (`delPattern`)**: Uses cursor-based `SCAN` rather than blocking `KEYS *`, keeping Redis responsive even with 100k+ keys.

---

## 📦 Client-Side Task Caching & 304 Version-Aware Delivery

Instead of 100,000 users re-downloading the entire task catalog JSON on every page visit or app launch, the application uses **version-aware conditional delivery**:

```
Mobile App (Phone Storage)                            Backend Server (Redis + MySQL)
          │                                                         │
          ├─── 1. Reads local tasks from phone storage (0ms render) │
          │                                                         │
          ├─── 2. Sends tiny version check:                         │
          │       GET /api/tasks?version=v_1740623...              │
          │                                                         ├── Check Redis: cache:tasks:catalog:version
          │                                                         │
          │◄── 3. IF Version Matches:                               │
          │       Returns { notModified: true, completions: {...} } ├── 0 tasks transferred (~60 bytes total!)
          │       Mobile app continues using cached tasks.          │
          │                                                         │
          │◄── 4. IF Version Changed (Admin updated tasks):         │
          │       Returns { notModified: false, version, tasks }    ├── Sends full updated task catalog once.
          │       Mobile app updates phone cache for next time.     │
```

### Admin Cache Purge & Force Refresh:
- When an administrator creates, modifies, or deletes a task, the server automatically bumps the version (`tasks:catalog:version`).
- Administrators can also click **"🧹 Clear Client Cache"** in the Admin Dashboard (`POST /api/admin/tasks/clear-cache`) to immediately force all mobile apps to fetch the latest tasks on their next sync.
- Only high-priority write requests (`/api/tasks/:id/complete`, `/api/recharges/redeem`, `/api/youtube/verify-and-claim`) hit the server in real-time.

---

## 📺 YouTube Subscription Verification Hub

ViralRecharge features a YouTube subscription verification system powered by **Google OAuth 2.0** and the **YouTube Data API v3**:

```
Logged-in User
      │
      ├─── 1. Connect YouTube Account (Google OAuth 2.0)
      │       Scopes: youtube.readonly, userinfo.profile, userinfo.email
      │       Tokens encrypted with AES-256-GCM in MySQL (never exposed to client)
      │
      ├─── 2. User Visits Partner Channel & Subscribes on YouTube
      │
      ├─── 3. User clicks "Verify & Claim"
      │       Backend executes youtube.subscriptions.list:
      │       part='snippet', mine=true, forChannelId=partnerChannelId
      │
      ├─── 4. Subscribed: YES ──► Awards credits, logs transaction, checks 4x multiplier
      │
      └─── 5. Subscribed: NO  ──► Prompt to subscribe on YouTube & retry
```

### Why Authenticated User Verification (`mine=true`)?
- **Privacy Compliance**: YouTube by default keeps subscriptions private for >90% of all users. If an application checks the channel owner's subscriber list, private subscribers are hidden.
- **Accurate & Real-Time**: By asking the user for `youtube.readonly` access and querying with `mine=true` and `forChannelId={partnerChannelId}`, the YouTube API returns the subscription resource even if the user's subscriptions are private!
- **Zero Proof Overhead**: Users don't need to upload screenshots or wait for manual admin review.

---

## 📋 Prerequisites Checklist

Before running the project, make sure you have the following installed:

1. **Node.js**: `v18.0.0` or higher (check with `node -v`)
2. **npm**: `v9.0.0` or higher (check with `npm -v`)
3. **MySQL Server**: MySQL 8.x or MariaDB (via XAMPP, WAMP, Docker, or standalone service)
4. **Redis Server** (Optional for local dev, Recommended for Production): Port 6379 (Redis 6+ or Redis Cloud)
5. **Git**: Installed for version control

---

## ⚡ Step-by-Step Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/rau5465/Viral.git
cd Viral
```

### Step 2: Install Dependencies
Install dependencies across root, server, and client with one command:
```bash
npm run install:all
```
*(Or run `npm install` inside both `server/` and `client/` directories).*

---

## 🗄️ Database & Redis Setup

### Database Setup:
Make sure your MySQL server is running (e.g., start MySQL from the XAMPP Control Panel on port 3306). Run the automated initializer from the project root:
```bash
npm run db:init
```
This script will:
- Create the `viral` database if it does not exist.
- Apply the SQL schema (all 13 tables, relationships, foreign keys, and indexes).
- Seed demo partner channels, starter tasks, and the admin account (`admin@viralrecharge.com` / `Admin@123456`).

### Redis Setup:
- **Local Dev / Fallback**: If Redis is not installed locally on your development machine, the application will automatically activate its built-in in-memory fallback. You will see a clean warning on startup, and all features will continue running normally.
- **Production Redis / Docker**:
  ```bash
  # Run Redis via Docker
  docker run -d --name viral-redis -p 6379:6379 redis:alpine
  ```

---

## ⚙️ Environment Variables Reference

Create a `.env` file inside the `server/` directory based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# MySQL DB Config (XAMPP Default)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=viral

# Database High-Concurrency Pool Tuning
DB_POOL_MAX=50
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_LOGGING=false

# Redis Configuration (High Realtime Traffic Caching & Distributed Locks)
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=vr:
# REDIS_URL=redis://default:password@localhost:6379

# JWT Secrets (90-Day Expiry)
JWT_SECRET=super_secret_viral_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=90d
JWT_REFRESH_SECRET=super_secret_viral_refresh_key_2026
JWT_REFRESH_EXPIRES_IN=180d

# App URL Configuration
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Bonus Configuration
BONUS_WINDOW_HOURS=2
BONUS_REFERRAL_TARGET=2
BASE_SIGNUP_BONUS=25
MULTIPLIED_SIGNUP_BONUS=100
REFERRAL_BONUS=50

# Google OAuth 2.0 & YouTube Data API v3 Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/youtube/callback
ENCRYPTION_SECRET=super_secret_viral_aes256_key_2026
```

---

## ▶️ Running the Application

### 1. Development Mode (Frontend + Backend concurrently):
From the project root directory:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 2. Run Backend Only:
```bash
npm run dev:server
```

### 3. Run Frontend Only:
```bash
npm run dev:client
```

### 4. Production Multi-Core PM2 Cluster Mode:
To launch the backend utilizing all CPU cores with cluster load-balancing:
```bash
npm run cluster
# Or with PM2 directly:
pm2 start server/ecosystem.config.js --env production
```

---

## 🧪 Automated Test Suites (Redis & YouTube)

Both test suites run headless tests verifying backend integrity:

### 1. Redis Optimization & Caching Test Suite (16 Tests):
```bash
cd server
npm run test:redis
```
Verifies:
- Redis connection & fallback telemetry
- Cache key operations (`get`, `set`, `del`)
- Non-blocking pattern deletion (`delPattern`)
- Cache-aside pattern (`getOrSet`)
- Distributed concurrency locks & Lua script verification
- Distributed rate limiter store creation
- Service caching (Leaderboard, Task Catalog, Announcements, Partner Channels)

### 2. YouTube Subscription Verification Test Suite (13 Tests):
```bash
cd server
npm run test:youtube
```
Verifies:
- AES-256-GCM token encryption and decryption
- Partner channel registry
- Google OAuth 2.0 URL generation & code exchange
- Private subscription verification (`mine=true` & `forChannelId`)
- Anti-duplicate fraud prevention
- Batch subscription checks & account disconnection

---

## 🖥️ Production VPS Sizing for 1 Lakh (100,000) Realtime Users

By offloading static assets to the Service Worker and task catalogs to mobile phone storage, peak backend throughput drops from **35,000 RPS down to ~2,000 – 3,500 RPS**, and bandwidth drops from **1.2 Gbps down to < 50 Mbps**.

### Recommended VPS Deployment Options:

#### Option 1: Single All-in-One Cloud VPS (Best Value)
Run Nginx + Node.js (PM2 cluster, 8 workers) + Redis + MySQL on one well-configured machine:
- **vCPU**: 8 vCPU (AMD EPYC or Ryzen cores)
- **RAM**: 16 GB RAM
- **Storage**: 100 GB – 160 GB NVMe PCIe 4.0 SSD
- **Network**: 1 Gbps port (actual usage ~50 Mbps)
- **Estimated Cost**: **$35 – $55 / month** (e.g. Hetzner Cloud CPX41, Contabo Cloud VPS 2)

#### Option 2: 2-Server Production Cluster (Recommended for Enterprise Redundancy)
Separating the database ensures zero resource contention during peak viral referral spikes:
1. **App Server (Node.js API + Redis Cache)**:
   - 8 vCPU / 16 GB RAM / 80 GB NVMe SSD (`~$35 - $45/mo`)
   - Handles PM2 cluster processes, Redis session cache, and concurrency locks.
2. **Database Server (Dedicated MySQL Primary)**:
   - 4 vCPU / 16 GB RAM / 150 GB NVMe SSD (`~$30 - $40/mo`)
   - Dedicated solely to ACID transactions, balance deductions, and recharge ledger.
- **Total Monthly Cost**: **~$65 – $85 / month**

### Production Linux Kernel & Service Tuning:
When deploying to Ubuntu 22.04 / 24.04 LTS:

1. **System File Descriptors (`/etc/security/limits.conf`)**:
   ```ini
   * soft nofile 200000
   * hard nofile 200000
   ```
2. **TCP Socket Backlog (`/etc/sysctl.conf`)**:
   ```ini
   net.core.somaxconn = 65535
   net.ipv4.tcp_max_syn_backlog = 65535
   net.ipv4.ip_local_port_range = 1024 65535
   net.ipv4.tcp_tw_reuse = 1
   ```
3. **Nginx Reverse Proxy (`/etc/nginx/nginx.conf`)**:
   ```nginx
   worker_processes auto;
   events {
       worker_connections 50000;
       multi_accept on;
       use epoll;
   }
   ```
4. **MySQL InnoDB Settings (`/etc/mysql/my.cnf`)**:
   ```ini
   max_connections = 500
   innodb_buffer_pool_size = 10G
   innodb_log_file_size = 2G
   innodb_flush_log_at_trx_commit = 2
   ```

---

## 👥 Demo Accounts & Testing Credentials

The database seeder pre-configures testing accounts:

| Role | Email | Mobile Number | Password | Wallet Balance | Referral Code |
|---|---|---|---|---|---|
| **Administrator** | `admin@viralrecharge.com` | `9876543210` | `Admin@123456` | 1,000 CR | `ADMIN01` |
| **Demo User** | `user@viralrecharge.com` | `9123456780` | `User@123456` | 150 CR | `VIRAL01` |
| **YouTube Test User** | `youtubetest@viralrecharge.com` | `9876543211` | `User@123456` | 60 CR | `YTTEST01` |

*(Note: On the login page, click the **"Admin Demo"** or **"User Demo"** button to auto-fill credentials in 1 click).*

---

## 📡 API Endpoints Reference

### Health & Telemetry
- `GET /api/health` — Real-time telemetry: MySQL connection pool, Redis ping latency, process uptime, memory usage

### Authentication & Profile (`/api/auth`, `/api/user`)
- `POST /api/auth/register` — Register new user with referral code & trigger 2-hour 4x challenge
- `POST /api/auth/login` — Sign in and receive 90-day JWT token
- `POST /api/auth/send-otp` — Request OTP verification
- `POST /api/auth/verify-otp` — Verify OTP
- `POST /api/auth/forgot-password` — Password recovery
- `POST /api/auth/refresh-token` — Refresh session
- `POST /api/auth/logout` — Invalidate session and evict Redis cache
- `GET /api/user/profile` — Get authenticated user details & wallet
- `PUT /api/user/profile` — Update user profile information
- `GET /api/user/dashboard` — Get dashboard metrics, 4x bonus status & announcements

### Tasks & Version-Aware Delivery (`/api/tasks`)
- `GET /api/tasks` — List active tasks with conditional `?version=` 304 delivery
- `GET /api/tasks/version` — Lightweight (~30 bytes) version check for mobile apps
- `GET /api/tasks/completions/today` — User's today completed task IDs
- `POST /api/tasks/:id/start` — Start task session & initiate dwell timer
- `POST /api/tasks/:id/complete` — Verify dwell time & award credits (Redis lock protected)

### Referrals & 4x Multiplier (`/api/referrals`)
- `GET /api/referrals` — Get total referrals, credits earned & network list
- `GET /api/referrals/bonus-status` — Get 2-hour countdown timer status
- `GET /api/referrals/leaderboard` — Get referral Hall of Fame rankings (Cached in Redis, 60s TTL)

### Mobile Recharges & Wallet Ledger (`/api/recharges`, `/api/transactions`)
- `GET /api/recharges/plans` — Supported operators (Jio, Airtel, Vi, BSNL) and talktime plans
- `POST /api/recharges/redeem` — Redeem credits for recharge (Redis anti-double-spend lock)
- `GET /api/recharges/history` — User's recharge redemption records
- `GET /api/transactions` — Paginated credit ledger with category filter
- `GET /api/transactions/summary` — Breakdown of credits earned/spent

### Admin Control Panel (`/api/admin`)
- `GET /api/admin/dashboard` — System-wide analytics & financial summary (Cached in Redis, 30s TTL)
- `GET /api/admin/users` — Search and paginate users
- `PUT /api/admin/users/:id` — Ban/unban users or adjust credit balances
- `GET /api/admin/tasks` — List all task campaigns
- `POST /api/admin/tasks` — Create new task campaign (auto-bumps client version)
- `PUT /api/admin/tasks/:id` — Update task parameters (auto-bumps client version)
- `DELETE /api/admin/tasks/:id` — Remove task campaign (auto-bumps client version)
- `POST /api/admin/tasks/clear-cache` — Force bump task version and clear mobile device caches
- `GET /api/admin/recharges` — Recharge queue with status filter
- `PUT /api/admin/recharges/:id` — Approve, complete, or reject recharge requests
- `POST /api/admin/announcements` — Publish banner announcement
- `DELETE /api/admin/announcements/:id` — Remove announcement
- `GET /api/admin/logs` — Review audit trail of administrator activities

### YouTube Subscription Verification (`/api/youtube`)
- `GET /api/youtube/channels` — List active Partner YouTube channels with claim status
- `GET /api/youtube/subscription-status/:channelId` — Check whether user is subscribed
- `POST /api/youtube/verify-and-claim/:channelId` — Verify subscription via YouTube Data API v3 and claim credits
- `GET /api/youtube/auth-url` — Generate Google OAuth 2.0 authorization URL
- `GET /api/youtube/callback` — Google OAuth 2.0 redirect handler
- `GET /api/youtube/status` — Get currently connected YouTube profile details
- `POST /api/youtube/disconnect` — Revoke and disconnect connected YouTube account
- `POST /api/youtube/verify-all` — Batch verify subscriptions across all active partner channels

---

## 🛡️ Security, Anti-Fraud & Concurrency Engine

1. **Distributed Concurrency Locks**: Uses Redis atomic Lua script locking on recharge redemption, task completion, and YouTube claims to prevent race conditions and replay attacks.
2. **Dwell Time Validation**: Tasks calculate `(completed_at - started_at)`. If the user returns faster than the required duration, the reward claim is rejected.
3. **Session & Daily Quotas**: Each user is restricted to a maximum daily completion count per task.
4. **Token Encryption**: Google OAuth tokens are encrypted at rest with AES-256-GCM.
5. **Centralized Rate Limiting**: Distributed rate limiters backed by Redis guard against brute-force attacks.
6. **Audit Trail**: Every administrative action is permanently recorded in `admin_logs`.

---

## ❓ Troubleshooting & FAQs

### 1. "Can't connect to MySQL server on 127.0.0.1:3306"
- Ensure MySQL is running. In XAMPP, open the XAMPP Control Panel and click **Start** next to MySQL.
- Verify credentials in `server/.env`. By default on XAMPP, `DB_USER=root` and `DB_PASSWORD=` (empty string).

### 2. "Redis connection warning on startup"
- If Redis is not running locally, the application automatically uses its built-in in-memory fallback. You do not need to install Redis for basic development testing.

### 3. "How to install the PWA on my phone?"
- Open the application in Google Chrome on Android or Safari on iOS.
- Tap the **"Install"** button on the bottom banner, or choose **"Add to Home screen"** from the browser menu.

### 4. "How do I force users to see updated tasks?"
- In the Admin Dashboard under the Tasks tab, click **"Clear Client Cache"**. This increments the version hash and instructs all connected phones to download the new tasks.

---

## 📄 License
This project is licensed under the ISC License.
