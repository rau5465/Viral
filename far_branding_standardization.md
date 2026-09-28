# Brand Name Standardization to FAR (Forget About Recharge)

## Summary of Changes

All occurrences of the former name `ViralRecharge` / `viral-recharge` across the frontend and backend have been updated to **FAR (Forget About Recharge)**.

### 1. Frontend Updates
- **`Viral/client/src/components/common/BonusTimerWidget.jsx`**:
  - Updated WhatsApp sharing message:
    `🔥 Get FREE Mobile Recharges with FAR (Forget About Recharge)! Sign up using my referral link to get instant bonus credits: ...`
- **`Viral/client/src/pages/ReferralCenter.jsx`**:
  - Updated WhatsApp, Telegram, and X (Twitter) invite messages to state `FAR (Forget About Recharge)` instead of `ViralRecharge`.
- **`Viral/client/package.json`**:
  - Renamed package to `"far-recharge-client"`.

### 2. Backend Updates
- **`Viral/server/app.js`**:
  - Health check endpoint `/api/health` now reports `app: 'FAR (Forget About Recharge) API'`.
- **`Viral/server/server.js`**:
  - Server startup banner updated to:
    `🚀 FAR (Forget About Recharge) Server running on port 5000`.
- **`Viral/server/controllers/authController.js`**:
  - Fallback offline admin user email updated to `admin@far.com` and referral code to `FARADMIN`.
- **`Viral/server/scripts/initDb.js`**:
  - Database initialization banner updated to `FAR (Forget About Recharge) MySQL Database`.
- **`Viral/server/scripts/testRedisOptimization.js`**:
  - Test suite log updated to `FAR (Forget About Recharge) Redis & High-Traffic Optimization Test Suite`.
- **`Viral/server/scripts/testYouTubeSystem.js`**:
  - Default test account email updated to `youtubetest@far.com`.
- **`Viral/server/package.json`**:
  - Updated package name to `"far-recharge-server"`, description to `"Backend API for FAR (Forget About Recharge) platform"`, and author to `"FAR Team"`.
- **`Viral/package.json` (Root)**:
  - Updated root name to `"far-recharge"`, description to `"FAR (Forget About Recharge) — Referral-based platform where users earn credits through tasks and redeem for free mobile recharges"`, and author to `"FAR Team"`.

### 3. Verification
- Scanned repository for any remaining instances of `viralrecharge` (case-insensitive) &mdash; 0 found.
- Built client bundle with Vite (`npm --prefix client run build`) &mdash; built cleanly with zero errors.
