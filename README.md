# 🚀 ViralRecharge

> **Viral referral-based platform where users earn credits through micro-tasks and redeem them for free mobile recharges across India.**

---

## ⚡ The Core Viral Hook (4X Bonus Multiplier)

When a user registers:
1. They receive **25 Credits** immediately as a welcome gift.
2. A **2-Hour Countdown Timer** begins on their dashboard.
3. If they refer **2 or more friends** before the timer expires:
   - Their initial bonus multiplies by **4x into 100 Credits**! 🎉
   - The invited friends also receive their own 2-hour 4x challenge.
   - This creates an exponential viral sharing loop!

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite, Lucide Icons, Canvas Confetti, Vanilla CSS (Dark mode & glassmorphism)
- **Backend**: Node.js + Express, Sequelize ORM, MySQL2, JWT, Helmet, CORS, Morgan, Express Rate Limit, Node-Cron
- **Database**: MySQL (Database: `viral`)
- **Anti-Cheat**: Minimum dwell-time validation, rate limiters, session tracking

---

## 📂 Project Architecture

```
Viral/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # BonusTimerWidget, Modal, Card
│   │   │   ├── layout/         # Navbar, Footer, MobileNav, Layout
│   │   │   └── tasks/          # TaskExecutionModal with timer
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Landing, Register, Login, Dashboard, Tasks,
│   │   │                       # ReferralCenter, RechargeRedeem, History,
│   │   │                       # Leaderboard, Profile, AdminDashboard
│   │   ├── routes/             # AppRoutes with route guards
│   │   └── services/           # Axios API service layer
│   └── vite.config.js          # Configured with proxy to port 5000
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # Sequelize MySQL connection pool
│   ├── controllers/            # Auth, User, Task, Referral, Recharge, Admin
│   ├── middleware/             # JWT protect, RBAC, rateLimiters, errorHandler
│   ├── models/                 # User, Referral, Task, TaskCompletion,
│   │                           # Transaction, Recharge, Announcement, OtpCode,
│   │                           # Session, AdminLog
│   ├── routes/                 # Express API routes
│   ├── services/               # Credit ledger, 4x bonus engine, recharge, referral
│   ├── jobs/                   # Cron jobs (bonus expiry, task expiry, queue worker)
│   ├── app.js                  # Express setup
│   └── server.js               # Entry point (port 5000)
│
├── database/
│   ├── migrations/             # 001_initial_schema.sql (10 tables)
│   └── seeds/                  # 001_seed_data.sql (Admin user & starter tasks)
│
├── Plan.md                     # Comprehensive project roadmap
├── commands_history.md         # Serialized command tracking
├── logs.md                     # Change and feature logs
└── package.json                # Unified workspace scripts
```

---

## 🗄️ Database Setup (MySQL)

1. Make sure MySQL (e.g. XAMPP on port 3306) is running.
2. The database name is `viral`.
3. Run the schema migration and initial seed data:

```bash
# Execute schema migration
mysql -u root viral < database/migrations/001_initial_schema.sql

# Execute starter seed data
mysql -u root viral < database/seeds/001_seed_data.sql
```

The database creates 10 structured tables:
`users`, `referrals`, `tasks`, `task_completions`, `transactions`, `recharges`, `announcements`, `otp_codes`, `sessions`, `admin_logs`.

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=viral
JWT_SECRET=super_secret_viral_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=super_secret_viral_refresh_key_2026
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
BONUS_WINDOW_HOURS=2
BONUS_REFERRAL_TARGET=2
BASE_SIGNUP_BONUS=25
MULTIPLIED_SIGNUP_BONUS=100
REFERRAL_BONUS=50
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=/api
VITE_APP_NAME=ViralRecharge
```

---

## 🚀 Running the Project

### Option A: From root directory
```bash
# Run backend server
npm run dev:server

# Run frontend client (in another terminal)
npm run dev:client

# Run lint suite
npm run lint

# Build production bundle
npm run build
```

### Option B: From individual folders
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5000`  
Health Check: `http://localhost:5000/api/health`

---

## 🔑 Demo Credentials

| Role | Identifier / Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@viralrecharge.com` | `Admin@123` | Full control panel, stats, user moderation, task creation, recharge approvals |
| **Demo User** | `rahul@example.com` | `Password@123` | Complete user dashboard, tasks, referrals, wallet |

*(You can also register any new account on `/register` to test the 2-hour 4x countdown from scratch!)*

---

## 📱 Mobile Recharge Plans

| Recharge Amount | Credits Required | Operators Supported |
|---|---|---|
| **₹10** Talktime | 200 Credits | Jio, Airtel, Vi, BSNL |
| **₹20** Top-up | 380 Credits | Jio, Airtel, Vi, BSNL |
| **₹50** Standard | 900 Credits | Jio, Airtel, Vi, BSNL |
| **₹100** Mega | 1700 Credits | Jio, Airtel, Vi, BSNL |

---

## 🛡️ Anti-Fraud & Security

- **Task Verification**: Validates actual dwell duration on sponsored pages before awarding credits.
- **Rate Limiting**: Protects against brute-force attacks and automated bots.
- **Audit Logging**: All admin actions are permanently recorded in `admin_logs`.
- **Background Cron Workers**: Automatically cleans up expired bonuses and scans for fraudulent registration bursts.

---

## 📄 License
ISC
