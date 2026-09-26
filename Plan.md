# 🚀 ViralScope — Project Plan

> **A viral referral-based platform where users earn credits through tasks and redeem them for free mobile Scopes.**

---

## 📋 Project Overview

| Detail | Value |
|---|---|
| **Project Name** | ViralScope |
| **Tech Stack** | React + Vite (Frontend), Node.js + Express (Backend), MySQL (Database) |
| **Goal** | Go viral through an aggressive referral system; users earn credits via tasks and redeem for free recharges |
| **Monetization** | Ad revenue, sponsored tasks, affiliate commissions from visited sites |
| **Core Hook** | 4x signup bonus if you refer 2 users within 2 hours of registration |

---

## 🎯 Core Concept

Users sign up and earn **credits** through various activities:

| # | Earning Method | Credits | Cooldown |
|---|---|---|---|
| 1 | **Signup Bonus** | 25 credits (up to 100 with 4x multiplier) | One-time |
| 2 | **Successful Referral** | 50 credits per referral | No limit |
| 3 | **Visit a Website** (follow instructions) | 5–10 credits | Per task |
| 4 | **Watch an Ad** | 2–5 credits | Every 30 min |
| 5 | **Subscribe YouTube Channel** | 15–20 credits | Per channel |
| 6 | **Watch a Video** (30–120 sec) | 5–15 credits | Per video |
| 7 | **Follow on Social Media** | 10–15 credits | Per account |

### 🔥 4x Viral Bonus Mechanic

```
┌─────────────────────────────────────────────────────────┐
│  User Signs Up → Gets 25 Signup Credits                 │
│  ↓                                                      │
│  2-Hour Countdown Timer Starts ⏰                       │
│  ↓                                                      │
│  If user refers ≥ 2 users within 2 hours:               │
│    → Signup credits become 25 × 4 = 100 credits! 🎉     │
│    → Referred users ALSO get the same 2-hour challenge  │
│  ↓                                                      │
│  This creates an exponential viral loop!                │
│  Each new user is incentivized to immediately share.    │
└─────────────────────────────────────────────────────────┘
```

### 💰 Credit Redemption

| Recharge Amount | Credits Required |
|---|---|
| ₹10 Recharge | 200 credits |
| ₹20 Recharge | 380 credits |
| ₹50 Recharge | 900 credits |
| ₹100 Recharge | 1700 credits |
| Custom Amount | Proportional |

---

## 🗂️ Project Structure

```
D:\My\Viral\
├── client/                    # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, icons, fonts
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Buttons, Cards, Modals, Loaders
│   │   │   ├── layout/        # Navbar, Sidebar, Footer
│   │   │   ├── dashboard/     # Dashboard-specific widgets
│   │   │   ├── tasks/         # Task cards, timers
│   │   │   └── referral/      # Referral tree, share widgets
│   │   ├── pages/             # Route-level page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # Auth, Theme contexts
│   │   ├── services/          # API service layer (axios)
│   │   ├── utils/             # Helpers, formatters
│   │   └── routes/            # Route definitions
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js + Express Backend
│   ├── config/                # DB config, env config
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, rate limiting, validation
│   ├── models/                # Sequelize/MySQL models
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic layer
│   ├── utils/                 # Helpers, token generation
│   ├── jobs/                  # Cron jobs (bonus expiry, etc.)
│   ├── app.js                 # Express app setup
│   ├── server.js              # Entry point
│   └── package.json
│
├── database/                  # SQL migrations & seeds
│   ├── migrations/
│   └── seeds/
│
├── Plan.md                    # This file
├── gemini.md                  # Project context for Gemini
├── logs.md                    # Feature & change log
├── commands_history.md        # User command history
└── .env.example               # Environment variable template
```

---

## 🖥️ Screens & Pages — Detailed Breakdown

### 1. 🏠 Landing Page (`/`)

> **Purpose**: Convert visitors into signups. Showcase the value proposition.

| Section | Description |
|---|---|
| **Hero Section** | Animated headline: "Earn Free Recharges Every Month!" with CTA button "Join Now — It's Free" |
| **How It Works** | 3-step visual: Sign Up → Earn Credits → Get Free Recharge |
| **Earning Methods** | Icon cards showing all 7 ways to earn credits |
| **4x Bonus Banner** | Urgency-driven section: "Refer 2 friends in 2 hours = 4x Credits!" with animated countdown |
| **Live Stats Ticker** | "12,450 users joined today • ₹3,20,000 recharges sent this month" |
| **Testimonials** | User success stories with recharge screenshots |
| **FAQ Section** | Accordion-style common questions |
| **Footer** | Links, social media, contact, legal |

### 2. 📝 Sign Up Page (`/register`)

> **Purpose**: Fast, frictionless registration with referral code capture.

| Element | Description |
|---|---|
| **Form Fields** | Full Name, Mobile Number, Email, Password, Confirm Password |
| **Referral Code Field** | Auto-filled from URL param (`/register?ref=ABC123`), editable |
| **OTP Verification** | Mobile number verification via OTP |
| **Terms Checkbox** | Accept Terms & Conditions |
| **Social Signup** | Google OAuth option for faster signup |
| **Post-Signup** | Redirect to Dashboard with 2-hour countdown overlay |

### 3. 🔐 Login Page (`/login`)

> **Purpose**: Secure login with multiple options.

| Element | Description |
|---|---|
| **Form Fields** | Email/Mobile + Password |
| **Remember Me** | Persistent session checkbox |
| **Forgot Password** | Link to reset flow |
| **Google Login** | OAuth alternative |
| **Register CTA** | "Don't have an account? Join free!" |

### 4. 🔑 Forgot Password (`/forgot-password`)

> **Purpose**: Password reset via OTP/email.

| Element | Description |
|---|---|
| **Step 1** | Enter registered email/mobile |
| **Step 2** | Enter OTP received |
| **Step 3** | Set new password |

### 5. 📊 User Dashboard (`/dashboard`)

> **Purpose**: Central hub showing credits, tasks, and referral status.

| Widget | Description |
|---|---|
| **Credit Balance Card** | Large animated counter showing total credits, with "Redeem" button |
| **4x Bonus Timer** | If within 2 hours of signup: live countdown with progress (0/2 referrals) |
| **Today's Earnings** | Credits earned today with mini chart |
| **Quick Actions** | Grid: "Earn Credits", "Refer Friends", "Redeem Recharge", "History" |
| **Available Tasks** | Top 3-5 available tasks with "Do Now" buttons |
| **Referral Stats Mini** | Total referrals, pending, this month |
| **Recent Activity Feed** | Last 10 transactions (earned/spent credits) |
| **Announcements Banner** | Admin-posted news, new tasks, promotions |
| **Level/Rank Badge** | User tier (Bronze/Silver/Gold/Platinum) based on total earnings |

### 6. 💰 Earn Credits Page (`/earn`)

> **Purpose**: Central task hub where users complete activities to earn credits.

| Section | Description |
|---|---|
| **Category Tabs** | All | Visit Sites | Watch Ads | YouTube | Videos | Social Media |
| **Task Card** | Each shows: Task title, credits reward, estimated time, instructions, "Start" button |
| **Task Detail Modal** | Step-by-step instructions, timer (if applicable), verification mechanism |
| **Daily Limits** | Show remaining tasks per category |
| **Bonus Tasks** | Highlighted high-value or time-limited tasks |

**Task Card States:**
- 🟢 Available — "Start Now"
- 🟡 In Progress — Timer running
- ✅ Completed — "Credits Added!"
- 🔴 Expired — "Try Again Tomorrow"
- ⏳ Cooldown — "Available in 2h 30m"

### 7. 🔗 Referral Center (`/referral`)

> **Purpose**: The viral engine. Make sharing irresistible.

| Section | Description |
|---|---|
| **Referral Link** | Unique URL with one-click copy button |
| **Share Buttons** | WhatsApp, Telegram, Facebook, Twitter, Instagram, SMS, Email |
| **QR Code** | Scannable QR code for referral link |
| **4x Bonus Section** | If active: countdown timer + progress bar (X/2 referrals) |
| **Referral Stats** | Total referred, successful registrations, credits earned from referrals |
| **Referral List** | Table of referred users: Name (masked), Date, Status (Pending/Active), Credits Earned |
| **Referral Tree** | Visual tree/network diagram showing multi-level referrals (up to 2 levels) |
| **Leaderboard** | Top 10 referrers this month with avatars and counts |
| **Pre-written Messages** | Copy-paste templates for WhatsApp/social sharing |

### 8. 📱 Redeem / Recharge Page (`/redeem`)

> **Purpose**: Convert credits to real mobile recharges.

| Section | Description |
|---|---|
| **Balance Display** | Current credit balance |
| **Mobile Number** | Input field (pre-filled with registered number, editable) |
| **Operator Selection** | Jio, Airtel, Vi, BSNL — auto-detect from number |
| **Recharge Plans** | Grid of available plans with credit cost |
| **Custom Amount** | Enter custom recharge amount |
| **Confirmation Modal** | Review details before redeeming |
| **Processing Screen** | Loading animation during recharge processing |
| **Success/Failure** | Result with transaction ID |

### 9. 📜 Transaction History (`/history`)

> **Purpose**: Full audit trail of credit activity.

| Section | Description |
|---|---|
| **Filter Bar** | Date range, type (Earned/Spent/Bonus), category |
| **Transaction Table** | Date, Type, Description, Credits (+/-), Balance After |
| **Export** | Download as CSV/PDF |
| **Summary Cards** | Total earned, Total spent, Total recharges this month |

### 10. 👤 Profile & Settings (`/profile`)

> **Purpose**: Account management.

| Section | Description |
|---|---|
| **Avatar & Info** | Profile photo upload, name, email, mobile |
| **Account Level** | Current tier with progress to next level |
| **Security** | Change password, enable 2FA |
| **Notification Preferences** | Email/SMS/Push notification toggles |
| **Linked Accounts** | Google, social media connections |
| **Danger Zone** | Deactivate/Delete account |

### 11. 🏆 Leaderboard (`/leaderboard`)

> **Purpose**: Gamification and social proof.

| Section | Description |
|---|---|
| **Time Filter** | Today, This Week, This Month, All Time |
| **Top Earners** | Ranked list with credits earned |
| **Top Referrers** | Ranked by successful referrals |
| **Your Rank** | Highlighted position in the list |

---

## 🔧 Admin Panel Screens

### 12. 🛡️ Admin Dashboard (`/admin`)

| Widget | Description |
|---|---|
| **Stats Cards** | Total Users, Active Today, Credits Distributed, Recharges Processed |
| **Growth Chart** | User signups over time (line chart) |
| **Revenue vs Payout** | Ad revenue vs recharge costs |
| **Recent Signups** | Latest user registrations |
| **Pending Recharges** | Queue of recharges awaiting processing |
| **System Health** | API response times, error rates |

### 13. 👥 Admin: Manage Users (`/admin/users`)

| Feature | Description |
|---|---|
| **User Table** | Searchable, sortable, filterable list of all users |
| **User Detail** | Click to view full profile, activity, referral tree |
| **Actions** | Ban, suspend, adjust credits, reset password |
| **Fraud Detection** | Flag suspicious accounts (multiple signups from same IP, etc.) |
| **Export** | CSV export of user data |

### 14. 📋 Admin: Manage Tasks (`/admin/tasks`)

| Feature | Description |
|---|---|
| **Task List** | All tasks with status (Active/Paused/Expired) |
| **Create Task** | Form: Title, Type, URL, Instructions, Credits, Duration, Daily Limit |
| **Edit/Delete** | Modify or remove existing tasks |
| **Task Analytics** | Completion rate, total credits distributed per task |
| **Bulk Actions** | Pause/Resume multiple tasks |

### 15. 💳 Admin: Manage Recharges (`/admin/recharges`)

| Feature | Description |
|---|---|
| **Recharge Queue** | Pending, Processing, Completed, Failed |
| **Manual Processing** | Approve/reject individual recharges |
| **Bulk Processing** | Process multiple recharges at once |
| **Recharge History** | Full log with filters |
| **API Integration Status** | Recharge API health and balance |

### 16. 📈 Admin: Analytics (`/admin/analytics`)

| Feature | Description |
|---|---|
| **User Growth** | Signup trends, retention rates |
| **Referral Analytics** | Viral coefficient, referral chain depth |
| **Task Analytics** | Most/least popular tasks, completion rates |
| **Credit Economy** | Credits minted vs redeemed, inflation tracking |
| **Revenue Dashboard** | Ad impressions, clicks, earnings |

### 17. 📢 Admin: Announcements (`/admin/announcements`)

| Feature | Description |
|---|---|
| **Create Announcement** | Title, message, type (info/warning/promo), target audience |
| **Schedule** | Publish immediately or schedule for later |
| **History** | Past announcements with engagement metrics |

---

## 🗄️ Database Schema (MySQL)

### Core Tables

```sql
-- Users
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255),
  avatar_url VARCHAR(500),
  referral_code VARCHAR(10) UNIQUE,
  referred_by INT REFERENCES users(id),
  email_verified BOOLEAN DEFAULT FALSE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  credit_balance INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  level ENUM('bronze','silver','gold','platinum') DEFAULT 'bronze',
  signup_bonus_multiplied BOOLEAN DEFAULT FALSE,
  bonus_deadline DATETIME,
  is_banned BOOLEAN DEFAULT FALSE,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

-- Referrals
referrals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referrer_id INT REFERENCES users(id),
  referred_user_id INT REFERENCES users(id),
  status ENUM('pending','active','expired') DEFAULT 'pending',
  credits_awarded INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Tasks
tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  description TEXT,
  type ENUM('visit_site','watch_ad','youtube_subscribe','watch_video','social_follow','other'),
  url VARCHAR(500),
  instructions TEXT,
  credits_reward INT,
  duration_seconds INT DEFAULT 0,
  daily_limit INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT REFERENCES users(id),
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

-- Task Completions
task_completions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  task_id INT REFERENCES tasks(id),
  status ENUM('started','completed','failed','expired') DEFAULT 'started',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  credits_awarded INT DEFAULT 0,
  verification_data JSON
)

-- Transactions (Credit Ledger)
transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  type ENUM('credit','debit'),
  category ENUM('signup_bonus','referral','task','recharge','adjustment','bonus_multiplier'),
  amount INT,
  balance_after INT,
  description VARCHAR(500),
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Recharges
recharges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  mobile_number VARCHAR(15),
  operator VARCHAR(50),
  amount DECIMAL(10,2),
  credits_spent INT,
  status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  api_response JSON,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Announcements
announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  message TEXT,
  type ENUM('info','warning','promo') DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
)

-- OTP Verification
otp_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  mobile VARCHAR(15),
  code VARCHAR(6),
  purpose ENUM('registration','login','password_reset'),
  expires_at DATETIME,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- User Sessions
sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  token VARCHAR(500),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Admin Activity Log
admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT REFERENCES users(id),
  action VARCHAR(100),
  target_type VARCHAR(50),
  target_id INT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with referral code |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/logout` | Logout |

### User
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/dashboard` | Dashboard data |
| GET | `/api/user/balance` | Credit balance |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List available tasks |
| GET | `/api/tasks/:id` | Task details |
| POST | `/api/tasks/:id/start` | Start a task |
| POST | `/api/tasks/:id/complete` | Complete & verify task |

### Referrals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/referrals` | Referral stats & list |
| GET | `/api/referrals/link` | Get referral link |
| GET | `/api/referrals/leaderboard` | Top referrers |
| GET | `/api/referrals/bonus-status` | 4x bonus timer status |

### Recharges
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recharges/plans` | Available recharge plans |
| POST | `/api/recharges/redeem` | Redeem credits for recharge |
| GET | `/api/recharges/history` | Recharge history |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | Transaction history |
| GET | `/api/transactions/summary` | Earning summary |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET | `/api/admin/users` | List/search users |
| PUT | `/api/admin/users/:id` | Update user (ban, credits) |
| CRUD | `/api/admin/tasks` | Manage tasks |
| GET | `/api/admin/recharges` | Manage recharges |
| PUT | `/api/admin/recharges/:id` | Process recharge |
| CRUD | `/api/admin/announcements` | Manage announcements |
| GET | `/api/admin/analytics` | Analytics data |

---

## ⏰ Background Jobs (Cron)

| Job | Schedule | Description |
|---|---|---|
| **Bonus Expiry Check** | Every 1 min | Check if 2-hour bonus window expired for new users |
| **Task Expiry** | Every 5 min | Expire old tasks, reset daily limits |
| **Fraud Detection** | Every 15 min | Flag suspicious activity patterns |
| **Analytics Aggregation** | Hourly | Aggregate stats for dashboard |
| **Recharge Processing** | Every 2 min | Process pending recharge queue |

---

## 🛡️ Security & Anti-Fraud

| Measure | Description |
|---|---|
| **Rate Limiting** | Max API calls per minute per user |
| **IP Tracking** | Flag multiple registrations from same IP |
| **Device Fingerprinting** | Detect same device, multiple accounts |
| **Task Verification** | Server-side verification of task completion |
| **OTP Verification** | Mobile verification to prevent fake signups |
| **JWT + Refresh Tokens** | Secure session management |
| **CAPTCHA** | On signup and suspicious activity |
| **Credit Limits** | Daily earning caps to prevent abuse |

---

## ✅ Task List — Implementation Roadmap

### Phase 1: Foundation & Setup
- [x] **1.1** Initialize React + Vite frontend project (`client/`)
- [x] **1.2** Initialize Node.js + Express backend project (`server/`)
- [x] **1.3** Setup MySQL database and create schema/migrations
- [x] **1.4** Configure environment variables (`.env`)
- [x] **1.5** Setup project folder structure (as defined above)
- [x] **1.6** Install core dependencies (both client & server)
- [x] **1.7** Configure Vite proxy for API calls during development
- [x] **1.8** Setup ESLint + Prettier for code consistency

### Phase 2: Backend Core
- [x] **2.1** Create MySQL connection pool and config
- [x] **2.2** Build Sequelize models for all tables
- [x] **2.3** Create database migrations and seed data
- [x] **2.4** Implement JWT authentication middleware
- [x] **2.5** Build Auth API — Register (with referral code logic)
- [x] **2.6** Build Auth API — Login, Logout, Refresh Token
- [x] **2.7** Build Auth API — OTP generation & verification
- [x] **2.8** Build Auth API — Forgot/Reset password
- [x] **2.9** Build Auth API — Google OAuth integration
- [x] **2.10** Implement rate limiting middleware
- [x] **2.11** Build error handling middleware

### Phase 3: Core Business Logic (Backend)
- [x] **3.1** Credit system service — award, deduct, balance check
- [x] **3.2** Referral system — code generation, tracking, credit award
- [x] **3.3** 4x Bonus engine — timer tracking, eligibility check, auto-multiply
- [x] **3.4** Task management service — CRUD, assignment, verification
- [x] **3.5** Task completion flow — start, timer, verify, award credits
- [x] **3.6** Recharge/Redeem service — validation, processing, status
- [x] **3.7** Transaction ledger — all credit movements logged
- [x] **3.8** User level/tier calculation service
- [x] **3.9** Leaderboard service — aggregation queries
- [x] **3.10** Announcement service — CRUD, targeting

### Phase 4: Admin Backend
- [x] **4.1** Admin authentication & role-based access control
- [x] **4.2** Admin dashboard stats aggregation API
- [x] **4.3** User management API (search, ban, adjust credits)
- [x] **4.4** Task management API (CRUD)
- [x] **4.5** Recharge management API (queue, approve, reject)
- [x] **4.6** Analytics API (charts data)
- [x] **4.7** Announcement management API
- [x] **4.8** Admin activity logging

### Phase 5: Background Jobs
- [x] **5.1** Setup cron job runner (node-cron or bull queue)
- [x] **5.2** 4x Bonus expiry checker (every 1 min)
- [x] **5.3** Task expiry & daily limit reset job
- [x] **5.4** Recharge queue processor
- [x] **5.5** Fraud detection scanner
- [x] **5.6** Analytics aggregation job

### Phase 6: Frontend — Design System & Layout
- [x] **6.1** Setup global CSS design system (colors, typography, spacing)
- [x] **6.2** Import Google Fonts (Inter/Outfit)
- [x] **6.3** Build Layout component (Navbar, Sidebar, Footer)
- [x] **6.4** Build reusable components — Button, Card, Modal, Loader, Input
- [x] **6.5** Build Toast/Notification system
- [x] **6.6** Setup React Router with route guards (auth, admin)
- [x] **6.7** Setup Auth Context (login state, user data, token management)
- [x] **6.8** Setup Axios service layer with interceptors

### Phase 7: Frontend — Public Pages
- [x] **7.1** Build Landing Page with all sections (Hero, How It Works, Earning Methods, 4x Bonus, Stats, Testimonials, FAQ)
- [x] **7.2** Build Sign Up page with referral code auto-fill from URL
- [x] **7.3** Build Login page
- [x] **7.4** Build OTP Verification page
- [x] **7.5** Build Forgot/Reset Password pages
- [x] **7.6** Add animations and micro-interactions to public pages

### Phase 8: Frontend — User Dashboard & Features
- [x] **8.1** Build Dashboard page with all widgets (balance, timer, quick actions, activity feed)
- [x] **8.2** Build 4x Bonus countdown timer component (real-time)
- [x] **8.3** Build Earn Credits page with category tabs and task cards
- [x] **8.4** Build Task execution modal with timer and instructions
- [x] **8.5** Build Referral Center page (link, share buttons, QR code, stats, tree)
- [x] **8.6** Build Redeem/Recharge page (operator selection, plan grid, confirmation)
- [x] **8.7** Build Transaction History page with filters and export
- [x] **8.8** Build Profile & Settings page
- [x] **8.9** Build Leaderboard page
- [x] **8.10** Add skeleton loaders and empty states for all pages

### Phase 9: Frontend — Admin Panel
- [x] **9.1** Build Admin Dashboard with stats cards and charts
- [x] **9.2** Build Admin User Management page (table, search, actions)
- [x] **9.3** Build Admin Task Management page (CRUD form, list)
- [x] **9.4** Build Admin Recharge Management page (queue, processing)
- [x] **9.5** Build Admin Analytics page (charts, filters)
- [x] **9.6** Build Admin Announcements page
- [x] **9.7** Build Admin Activity Log viewer

### Phase 10: Integration & Polish
- [x] **10.1** Connect all frontend pages to backend APIs
- [x] **10.2** Implement real-time updates (WebSocket/polling for live credits, timer)
- [x] **10.3** Add push notification support
- [x] **10.4** Responsive design — test all pages on mobile/tablet/desktop
- [x] **10.5** Add loading states, error handling, and retry logic everywhere
- [x] **10.6** Implement CAPTCHA / anti-cheat on signup & tasks
- [x] **10.7** SEO optimization (meta tags, Open Graph for shared links)
- [x] **10.8** Performance optimization (lazy loading, code splitting)

### Phase 11: Testing & Deployment
- [x] **11.1** Write unit tests for credit system, referral logic, bonus engine
- [x] **11.2** Write API integration tests
- [x] **11.3** End-to-end testing of critical flows (signup → refer → earn → redeem)
- [x] **11.4** Security audit (SQL injection, XSS, CSRF)
- [x] **11.5** Setup build scripts & dev environment configs
- [x] **11.6** Server and database verification on port 5000 and MySQL viral DB
- [x] **11.7** Client build verification with Vite production bundling
- [x] **11.8** Full verification complete
- [x] **11.9** Ready for production deployment
- [x] **11.10** Project launched! 🚀

---

## 🎨 Design Guidelines

| Aspect | Specification |
|---|---|
| **Color Palette** | Primary: `#6C5CE7` (Purple), Accent: `#00D2D3` (Teal), Success: `#00B894`, Warning: `#FDCB6E`, Danger: `#FF7675`, Dark BG: `#0D1117`, Card BG: `#161B22` |
| **Typography** | Font: Inter / Outfit (Google Fonts), Headings: 700 weight, Body: 400 |
| **Design Style** | Dark mode default, glassmorphism cards, gradient accents, smooth animations |
| **Animations** | Framer Motion for page transitions, CSS for micro-interactions, Lottie for success states |
| **Icons** | Lucide React or React Icons |
| **Charts** | Recharts or Chart.js for analytics |

---

## 📊 Viral Growth Projections

```
Day 1:  1 user signs up, refers 2 → 3 users
Day 2:  3 users each refer 2 → 9 users (total: 12)
Day 3:  9 users each refer 2 → 27 users (total: 39)
Day 7:  ~2,187 new users (total: ~3,000)
Day 14: ~4.7M potential reach (with 50% conversion: ~100K users)
```

> The 4x bonus with 2-hour urgency is the key viral mechanic. Users must act IMMEDIATELY after signup, creating a burst of referral activity.

---

## 📌 Key Design Decisions

1. **Mobile-First**: 80%+ users will be on mobile — every screen must be thumb-friendly
2. **Instant Gratification**: Show credit balance updating in real-time with animations
3. **Social Proof**: Live counters, leaderboards, and testimonials build trust
4. **Urgency**: The 2-hour countdown creates FOMO and immediate action
5. **Simplicity**: One-tap task completion, one-tap sharing, one-tap recharge
6. **Gamification**: Levels, badges, streaks, and leaderboards keep users engaged

---

*Plan created: September 27, 2026*
*Last updated: September 27, 2026*
