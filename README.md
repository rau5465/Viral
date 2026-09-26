# ⚡ ViralRecharge — Full-Stack Viral Referral & Free Mobile Recharge Platform

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_+_Sequelize-4479A1?style=flat&logo=mysql)](https://www.mysql.com/)
[![Responsive](https://img.shields.io/badge/Design-100%25_Responsive_Mobile_+_Desktop-00d2d3?style=flat)]()
[![License](https://img.shields.io/badge/License-ISC-purple.svg)]()

> **ViralRecharge** is a high-conversion viral referral platform where users complete sponsor micro-tasks (website visits, ads, YouTube subscriptions, video watching, social follows) to earn credits and redeem them for **100% free mobile talktime and data recharges** across India (Jio, Airtel, Vi, and BSNL).

---

## 📑 Table of Contents

1. [Key Viral Mechanic (4X Bonus Multiplier)](#-key-viral-mechanic-4x-bonus-multiplier)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Prerequisites Checklist](#-prerequisites-checklist)
4. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
5. [Database Setup (Automatic & Manual)](#-database-setup-automatic--manual)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Running the Application](#-running-the-application)
8. [End-to-End Feature Testing & User Journey](#-end-to-end-feature-testing--user-journey)
9. [Demo Accounts & Testing Credentials](#-demo-accounts--testing-credentials)
10. [Mobile-First Responsive Design System](#-mobile-first-responsive-design-system)
11. [API Endpoints Reference](#-api-endpoints-reference)
12. [Security & Anti-Fraud Engine](#-security--anti-fraud-engine)
13. [Troubleshooting & FAQs](#-troubleshooting--faqs)

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
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React (`lucide-react`)
- **Feedback**: Canvas Confetti (`canvas-confetti`)
- **Styling**: Vanilla CSS (Custom design system, Dark Mode default, Glassmorphism, CSS Custom Properties)
- **State Management**: React Context (`AuthContext`, `ToastContext`)
- **API Client**: Axios with automatic bearer token injection and interceptors

### Backend (`server/`)
- **Runtime**: Node.js v18+ (tested on Node v22)
- **Framework**: Express 4.x
- **ORM / Database Driver**: Sequelize 6.x + MySQL2
- **Authentication**: JWT (JSON Web Tokens) with refresh token support + bcryptjs
- **Background Cron Engine**: `node-cron` (auto-expires bonus windows, cleans stale sessions, checks task limits)
- **Security Middleware**: Helmet, CORS, Morgan logger, Express Rate Limit (DDoS & brute-force protection)

### Database (`database/`)
- **Engine**: MySQL 8.x / MariaDB (XAMPP default port 3306)
- **Tables (10)**: `users`, `referrals`, `tasks`, `task_completions`, `transactions`, `recharges`, `announcements`, `otp_codes`, `sessions`, `admin_logs`

---

## 📂 Project Directory Structure

```
Viral/
├── client/                             # React 19 + Vite Frontend
│   ├── src/
│   │   ├── assets/                     # SVGs and images
│   │   ├── components/
│   │   │   ├── common/                 # BonusTimerWidget, Modal
│   │   │   ├── layout/                 # Navbar, MobileNav, Footer, Layout
│   │   │   ├── tasks/                  # TaskExecutionModal with dwell timer
│   │   │   └── referral/               # Referral widgets
│   │   ├── context/                    # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/                  # AdminDashboard (Moderation, Tasks, Recharges, Logs)
│   │   │   ├── Dashboard.jsx           # Main user dashboard with metrics
│   │   │   ├── ForgotPassword.jsx      # OTP password recovery flow
│   │   │   ├── Landing.jsx             # High-conversion responsive landing page
│   │   │   ├── Leaderboard.jsx         # Hall of Fame ranking podium
│   │   │   ├── Login.jsx               # Sign in with quick-fill demo buttons
│   │   │   ├── Profile.jsx             # User profile settings
│   │   │   ├── RechargeRedeem.jsx      # Mobile recharge redemption with plans
│   │   │   ├── ReferralCenter.jsx      # 4X referral link & instant social sharing
│   │   │   ├── Register.jsx            # Sign up with mobile OTP verification
│   │   │   ├── Tasks.jsx               # Micro-task earn gallery with category filter
│   │   │   └── TransactionHistory.jsx  # Complete credit ledger & filters
│   │   ├── routes/                     # Protected & admin route guards
│   │   ├── services/                   # Axios API service layer
│   │   ├── App.jsx                     # Root application wrapper
│   │   ├── index.css                   # Global responsive design system & media queries
│   │   └── main.jsx                    # Vite entry point
│   ├── vite.config.js                  # Vite configuration with proxy to port 5000
│   └── package.json
│
├── server/                             # Node.js + Express Backend
│   ├── config/                         # Sequelize MySQL connection pool
│   ├── controllers/                    # Auth, User, Task, Referral, Recharge, Admin
│   ├── jobs/                           # Background cron jobs (node-cron)
│   ├── middleware/                     # JWT auth, RBAC, rate-limiting, error handler
│   ├── models/                         # 10 Sequelize DB models
│   ├── routes/                         # Express API route modules
│   ├── scripts/                        # initDb.js (automated database initializer)
│   ├── services/                       # Credit ledger, 4x bonus engine, task verification
│   ├── app.js                          # Express application configuration
│   ├── server.js                       # HTTP server entry point (port 5000)
│   └── package.json
│
├── database/
│   ├── migrations/                     # 001_initial_schema.sql (10 tables)
│   └── seeds/                          # 001_seed_data.sql (Admin user, starter tasks)
│
├── Plan.md                             # Comprehensive project roadmap & screen specs
├── commands_history.md                 # Serialized history of user instructions
├── logs.md                             # Feature and bug fix change logs
├── package.json                        # Root workspace scripts
└── README.md                           # Master documentation
```

---

## 📋 Prerequisites Checklist

Before running the project, make sure you have the following installed:

1. **Node.js**: `v18.0.0` or higher (check with `node -v`)
2. **npm**: `v9.0.0` or higher (check with `npm -v`)
3. **MySQL Server**: MySQL 8.x or MariaDB (via XAMPP, WAMP, Docker, or standalone service)
4. **Git**: Installed for version control

---

## ⚡ Step-by-Step Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/rau5465/Viral.git
cd Viral
```

### Step 2: Install Dependencies
Install dependencies for root, server, and client with one command:
```bash
npm run install:all
```
*(Alternatively, run `npm install` inside both `server/` and `client/` directories).*

---

## 🗄️ Database Setup (Automatic & Manual)

Make sure your MySQL server is running (e.g., start MySQL from the XAMPP Control Panel on port 3306).

### Method A: Automated One-Click Setup (Recommended)
From the project root directory, run:
```bash
npm run db:init
```
This automated script will:
- Connect to your MySQL server (using credentials from `server/.env`).
- Create the `viral` database if it does not already exist.
- Execute `database/migrations/001_initial_schema.sql` (creating all 10 tables).
- Execute `database/seeds/001_seed_data.sql` (inserting demo admin, demo user, and active earning tasks).
- Print a verification summary.

### Method B: Manual Command-Line Import
```bash
# 1. Create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS viral CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Import Schema
mysql -u root viral < database/migrations/001_initial_schema.sql

# 3. Import Seed Data
mysql -u root viral < database/seeds/001_seed_data.sql
```

### Method C: phpMyAdmin (GUI)
1. Open `http://localhost/phpmyadmin`
2. Create a new database named `viral` with collation `utf8mb4_unicode_ci`.
3. Select `viral` and click the **Import** tab.
4. Import `database/migrations/001_initial_schema.sql`.
5. Next, import `database/seeds/001_seed_data.sql`.

---

## ⚙️ Environment Variables Reference

### Backend Configuration (`server/.env`)
Create or edit `server/.env` with the following values:

```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# MySQL Database Connection
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=viral

# Security & JWT Tokens
JWT_SECRET=super_secret_viral_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=super_secret_viral_refresh_key_2026
JWT_REFRESH_EXPIRES_IN=30d

# URLs & CORS
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# 4X Viral Bonus Settings
BONUS_WINDOW_HOURS=2
BONUS_REFERRAL_TARGET=2
BASE_SIGNUP_BONUS=25
MULTIPLIED_SIGNUP_BONUS=100
REFERRAL_BONUS=50
```

### Frontend Configuration (`client/.env`)
Create or edit `client/.env`:

```env
VITE_API_BASE_URL=/api
VITE_APP_NAME=ViralRecharge
```

---

## 🚀 Running the Application

### Option 1: Root Unified Scripts (Two Terminals)

**Terminal 1 — Backend API:**
```bash
npm run dev:server
```
*(Starts Express server with Nodemon on `http://localhost:5000`)*

**Terminal 2 — Frontend Client:**
```bash
npm run dev:client
```
*(Starts Vite dev server on `http://localhost:5173` with proxy to `/api`)*

---

### Option 2: Running from Individual Directories

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

### Verification URLs
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Demo Accounts & Testing Credentials

The seed data provides two pre-configured accounts for instant testing:

| Account Type | Email / Identifier | Password | Access & Role |
|---|---|---|---|
| **Admin** | `admin@viralrecharge.com` | `Admin@123` | **Full Admin Access**: Moderation, Task Management, Recharge Approval Queue, System Logs |
| **Demo User** | `rahul@example.com` | `Password@123` | **User Access**: Pre-funded with 150 Credits, 2 referrals, ready to test recharge redemption |

> 💡 **Quick Login**: The Login page features **"Quick Demo Fill"** shortcut buttons to log in as either Demo Admin or Demo User with a single click!
>
> 💡 **Testing the 2-Hour Timer from Scratch**: Register a new account at `/register` to see the live countdown timer start at `02:00:00` with 25 welcome credits!

---

## 📱 Mobile Recharge Plans Available

| Plan Amount | Credits Cost | Type | Supported Operators | Delivery Time |
|---|---|---|---|---|
| **₹10** | 200 CR | Talktime Top-up | Jio, Airtel, Vi, BSNL | Instant |
| **₹20** | 380 CR | Talktime Top-up | Jio, Airtel, Vi, BSNL | Instant |
| **₹50** | 900 CR | Full Talktime / Data | Jio, Airtel, Vi, BSNL | Instant |
| **₹100** | 1,700 CR | Mega Pack / Unlimited | Jio, Airtel, Vi, BSNL | Instant |

---

## 🧪 End-to-End Feature Testing & User Journey

Follow this walkthrough to experience the full feature set:

### 1. Register a Fresh Account (2-Hour 4X Bonus)
1. Go to `http://localhost:5173/register`.
2. Enter your Name, Mobile, and Password. Click **Send OTP** (in development, demo OTP auto-fills as `123456`).
3. Click **Complete Registration**.
4. You are directed to your **Dashboard**:
   - Notice the **25 CR** welcome bonus in your wallet.
   - Notice the **4x Viral Bonus Challenge** widget counting down from `02:00:00`.
   - The progress bar displays `0 / 2 Referrals`.

### 2. Earn Credits via Tasks
1. Click **Earn** in the navigation bar (or visit `/tasks`).
2. Filter tasks by category: *Visit Websites, YouTube, Videos, Social*.
3. Click **Start Task** on a campaign (e.g. *Visit Partner Promo Site* for 10 CR).
4. The sponsored page opens in a new tab, and a dwell-time countdown timer starts in the modal.
5. Once the countdown completes, click **Verify & Claim**.
6. Real-time confetti fires, credits are added to your wallet, and your balance increments instantly.

### 3. Share Referrals & Multiply Bonus (4X)
1. Navigate to `/referrals` (Referral Center).
2. Copy your exclusive referral link or use the **WhatsApp**, **Telegram**, or **Twitter** quick-share buttons.
3. Open an Incognito window and register 2 new test users with your referral code.
4. Refresh your original account dashboard:
   - The bonus widget celebrates with confetti: **"4x Viral Bonus Unlocked! 🎉"**
   - Your wallet balance increases with the 75 CR multiplier bonus + referral bonuses!

### 4. Redeem a Free Mobile Recharge
1. Navigate to `/recharge`.
2. Enter a 10-digit mobile number and pick an operator (Jio, Airtel, Vi, BSNL).
3. Select an eligible recharge plan (e.g. ₹10 Talktime for 200 Credits).
4. Click **Redeem Now**, review the summary modal, and confirm.
5. The recharge request is created, credits are deducted, and the transaction is recorded in your **Recharge History** and **Wallet Ledger** (`/history`).

### 5. Admin Control Panel Moderation
1. Log in as `admin@viralrecharge.com` (`Admin@123`).
2. Navigate to `/admin`:
   - **Overview**: Live stats (total users, active tasks, credits distributed, total recharges).
   - **Users**: Search users by name/phone/code, ban/unban users, and adjust credit balances.
   - **Tasks**: Create new task campaigns (sponsor URL, credit reward, minimum duration, daily limits) or disable existing ones.
   - **Recharges**: Review pending recharges and click **Approve & Complete**.
   - **Announcements**: Post alerts that appear on all user dashboards.
   - **Audit Logs**: Inspect the permanent audit trail of all administrator actions.

---

## 📱 Mobile-First Responsive Design System

The application is engineered from the ground up to be **100% responsive across mobile phones, tablets, and desktop computers**:

```
Viewport Width     Layout Behavior
─────────────────────────────────────────────────────────────────────────────
Desktop (> 768px)  • Sticky top header with full horizontal navigation links
                   • Multi-column metric cards & 3-column leaderboard podium
                   • Bottom mobile navigation bar is automatically hidden

Mobile (≤ 768px)   • Fixed bottom navigation bar with thumb-friendly tabs
                     (Home, Earn, 4x Refer, Redeem, History)
                   • Desktop header nav collapses into compact profile pill
                   • Automatic bottom padding (85px) prevents content overlap
                   • Touch target sizing (minimum 44px) for all buttons & inputs
                   • Tables convert to touch-friendly horizontal scroll containers
                   • Leaderboard podium stacks into a single-column card list

Small Mobile (≤ 480px)
                   • Fluid typography using clamp() prevents text wrapping
                   • Button groups stack vertically for effortless single-hand tap
                   • Modal dialogs scale dynamically to 95vw with safe scrolling
```

---

## 📡 API Endpoints Reference

### Authentication & User (`/api/auth`, `/api/user`)
- `POST /api/auth/register` — Register account with optional referral code
- `POST /api/auth/login` — Login with email/mobile and password
- `POST /api/auth/send-otp` — Send OTP for registration or password reset
- `POST /api/auth/verify-otp` — Verify 6-digit OTP code
- `POST /api/auth/forgot-password` — Request password reset OTP
- `POST /api/auth/reset-password` — Reset password with OTP
- `POST /api/auth/refresh-token` — Refresh expired JWT access token
- `POST /api/auth/logout` — Invalidate user session
- `GET /api/user/profile` — Get authenticated user details & wallet
- `PUT /api/user/profile` — Update user profile information
- `GET /api/user/dashboard` — Get dashboard metrics, 4x bonus status & announcements

### Tasks & Anti-Cheat (`/api/tasks`)
- `GET /api/tasks` — List active tasks with completion quotas
- `POST /api/tasks/:id/start` — Start task session & initiate dwell timer
- `POST /api/tasks/:id/complete` — Verify dwell time & award credits

### Referrals & 4x Multiplier (`/api/referrals`)
- `GET /api/referrals/stats` — Get total referrals, credits earned & network list
- `GET /api/referrals/bonus-status` — Get 2-hour countdown timer status
- `GET /api/referrals/leaderboard` — Get referral Hall of Fame rankings

### Mobile Recharges & Wallet Ledger (`/api/recharge`, `/api/transactions`)
- `GET /api/recharge/plans` — Get list of supported telecom operators and plans
- `POST /api/recharge/redeem` — Redeem credits for mobile recharge
- `GET /api/recharge/history` — Get personal recharge redemption records
- `GET /api/transactions` — Get paginated credit ledger with category filter
- `GET /api/transactions/summary` — Get breakdown of credits earned/spent

### Admin Control Panel (`/api/admin`)
- `GET /api/admin/stats` — System-wide analytics & financial summary
- `GET /api/admin/users` — Search and list all users with pagination
- `PUT /api/admin/users/:id` — Ban/unban users or adjust credit balances
- `GET /api/admin/tasks` — List all task campaigns
- `POST /api/admin/tasks` — Create a new sponsored task campaign
- `PUT /api/admin/tasks/:id` — Toggle active status or update task parameters
- `DELETE /api/admin/tasks/:id` — Remove a task campaign
- `GET /api/admin/recharges` — Recharge queue with status filter
- `PUT /api/admin/recharges/:id` — Approve, complete, or reject recharge requests
- `POST /api/admin/announcements` — Publish site-wide banner announcement
- `DELETE /api/admin/announcements/:id` — Delete an announcement
- `GET /api/admin/logs` — Review audit trail of administrator activities

### YouTube Subscription Verification (`/api/youtube`)
- `GET /api/youtube/channels` — List all active Partner YouTube channels with user subscription & claim status
- `GET /api/youtube/subscription-status/:channelId` — Check whether the authenticated user is subscribed to a specific channel
- `POST /api/youtube/verify-and-claim/:channelId` — Verify subscription via YouTube Data API v3 and claim credit reward
- `GET /api/youtube/auth-url` — Generate Google OAuth 2.0 authorization consent URL
- `GET /api/youtube/callback` — Google OAuth 2.0 redirect handler (exchanges code for encrypted tokens)
- `GET /api/youtube/status` — Get currently connected YouTube/Google profile details
- `POST /api/youtube/disconnect` — Revoke and disconnect connected YouTube account
- `POST /api/youtube/verify-all` — Batch verify subscriptions across all active partner channels
- `POST /api/youtube/partner/channels` — Add a new Partner YouTube Channel (Admin)
- `PUT /api/youtube/partner/channels/:id` — Update Partner YouTube Channel settings (Admin)
- `DELETE /api/youtube/partner/channels/:id` — Remove Partner YouTube Channel (Admin)

---

## 📺 YouTube Subscription Verification System

ViralRecharge features a high-fidelity YouTube subscription verification system powered by **Google OAuth 2.0** and the **YouTube Data API v3**:

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
      ├─── 4. Subscribed: YES ──► Awards +50 CR, logs transaction, checks 4x multiplier
      │
      └─── 5. Subscribed: NO  ──► Prompt to subscribe on YouTube & retry
```

### Why Authenticated User Verification (`mine=true`)?
- **Privacy Compliance**: YouTube by default keeps subscriptions private for >90% of all users. If an application relies on the channel owner's subscriber list, Google hides private subscribers, making verification impossible.
- **Accurate & Real-Time**: By asking the user for `youtube.readonly` access and querying with `mine=true` and `forChannelId={partnerChannelId}`, the YouTube API returns the subscription resource even if the user's subscriptions are private!
- **Zero Proof Overhead**: Users don't need to upload screenshots or wait for manual admin review.

### Security & Token Lifecycle
1. **Server-Side Encryption**: `access_token` and `refresh_token` are encrypted at rest using AES-256-GCM (`server/utils/crypto.js`). Tokens are never sent in API responses (`toJSON` strips them automatically).
2. **Auto-Refresh**: Expired tokens are refreshed automatically in the background using Google `OAuth2Client` before making YouTube API calls.
3. **Revocation Detection**: If a user disconnects or revokes permissions in their Google Account settings, the backend captures `invalid_grant` and gracefully prompts the user to reconnect.
4. **Anti-Fraud & Ledger**: Subscriptions and rewards are tracked in `user_youtube_subscriptions` with atomic transactions, preventing users from claiming credits multiple times for the same channel.
5. **Multi-Partner Channels**: A single partner or administrator can register multiple YouTube channels under their account, and the system verifies subscriptions across all of them.

### Google Cloud Console Configuration Guide
To connect live Google credentials:
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **YouTube Data API v3**.
3. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add Authorized redirect URI:
   `http://localhost:5000/api/youtube/callback`
5. Copy the Client ID and Client Secret into `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/youtube/callback
   ENCRYPTION_SECRET=your_aes256_encryption_key
   ```
*(Note: If Google credentials are not set, a built-in development simulation mode automatically activates so developers can test the entire UI and credit redemption lifecycle without being blocked).*

### Run the YouTube Test Suite
Verify all 13 components of the YouTube Verification System:
```bash
cd server
node scripts/testYouTubeSystem.js
```

---


## 🛡️ Security & Anti-Fraud Engine

1. **Dwell Time Validation**: The task verification service calculates `(completed_at - started_at)`. If the user returns faster than the required duration, the claim is rejected.
2. **Session & Daily Limits**: Each user is restricted to a maximum number of daily completions per task to prevent bot spam.
3. **Double-Spend Protection**: Credit deductions for recharges execute within atomic database transactions with row-level locks.
4. **Rate Limiting**: Auth endpoints are guarded with `express-rate-limit` to prevent credential stuffing.
5. **Permanent Audit Trail**: Every sensitive administrator action (ban, credit override, recharge status change) is logged in `admin_logs`.
6. **Background Sweeper**: A scheduled cron job continuously expires unclaimed bonus timers and flags suspicious multi-account IP bursts.

---

## ❓ Troubleshooting & FAQs

### 1. "Can't connect to MySQL server on 127.0.0.1:3306"
- Ensure MySQL is running. In XAMPP, open the XAMPP Control Panel and click **Start** next to MySQL.
- Verify your password in `server/.env`. By default on XAMPP, `DB_USER=root` and `DB_PASSWORD=` (empty string).

### 2. "Vite proxy error: ECONNREFUSED"
- This occurs when the frontend tries to call `/api` but the backend server is not running.
- Start the backend server by running `npm run dev:server` in a separate terminal.

### 3. "Port 5000 is already in use"
- Either terminate the existing Node process occupying port 5000 or change `PORT=5001` in `server/.env` and update the proxy target in `client/vite.config.js`.

### 4. Running Verification & Linting
- **Build frontend**: `npm run build`
- **Lint all files**: `npm run lint`

---

## 📄 License
This project is licensed under the ISC License.
