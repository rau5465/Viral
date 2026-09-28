# Admin Panel Scope & Settings Persistence Implementation Report

## Summary of Completed Changes

### 1. Dedicated Administrative Experience for Admin Users
- **Separation from Regular User Earning Features**:
  - Removed user wallet balance (`CR`), redeem recharge options, multiplier games, micro-task earning links, and user countdown timers from the Admin interface.
  - Replaced user credits balance pill in the top header with a distinct, glowing **`🛡️ Admin Console`** badge.
  - Replaced regular user header navigation with direct Administrative Modules:
    - **Platform Analytics** (`/admin?tab=overview`)
    - **User Moderation** (`/admin?tab=users`)
    - **Tasks & Ads Management** (`/admin?tab=tasks`)
    - **Recharge Dispatch Orders** (`/admin?tab=recharges`)
    - **Sponsors & Inquiries** (`/admin?tab=contacts`)
    - **Platform Settings & Rates** (`/admin?tab=settings`)
    - **Announcements & Ticker** (`/admin?tab=announcements`)
    - **Maintenance Mode** (`/admin?tab=maintenance`)
    - **Activity Audit Logs** (`/admin?tab=logs`)
- **Admin Mobile Bottom Nav (`MobileNav.jsx`)**:
  - When logged in as Admin, the bottom nav now displays Administrative controls: `Analytics`, `Users`, `Orders`, `Sponsors`, `Settings`.
- **Slide-out Side Drawer Navigation (`Navbar.jsx`)**:
  - For Admin, the drawer shows an **Administrator Account** badge with admin controls, completely hiding wallet balances, redeem options, and user earning links.
- **Route Protection & Redirection (`AppRoutes.jsx`)**:
  - Added `UserRoute` guard to prevent Admins from accessing user earning pages (`/dashboard`, `/tasks`, `/referrals`, `/recharge`, `/multiply`, etc.), automatically routing Admin to `/admin`.
  - When Admin logs in via `/login`, they are immediately navigated to `/admin`.
- **Suppressed User Prompts (`Layout.jsx`)**:
  - `MultiplyPromoModal`, `InstallAppBanner`, and `PostSignupInstallModal` are hidden for Admin users.

---

### 2. Notice Bar Z-Index Overlap Fix
- **Root Cause**: `.announcement-ticker` was set to `position: sticky; top: 0; z-index: 999;`, while `.site-header` was `z-index: 50;` and dropdowns were `z-index: 100;`. As a result, the scrolling notice bar overlapped on top of the fixed header, dropdown menus, and mobile side drawer.
- **Resolution**:
  - Changed `.announcement-ticker` in `AnnouncementTicker.css` to `position: relative; z-index: 30;`.
  - Elevated `.site-header` in `index.css` to `z-index: 1000;`.
  - Elevated navigation dropdowns in `Navbar.jsx` to `z-index: 1100;`.
  - Elevated the slide-out side drawer in `Navbar.jsx` to `z-index: 2000;`.
  - Notice bar now renders underneath the header and dropdown menus with no collision or overlap.

---

### 3. Removal of "Target Referrals to Unlock Multiplier"
- **Policy**: Referral bonus policy is fixed to a Single Refer within the first two hours (`target_referrals: 1`).
- **Resolution**:
  - Removed the `Target Referrals to Unlock Multiplier` form input field from the Admin Control Panel (`AdminDashboard.jsx`).
  - Set default value `target_referrals: 1` in `settingService.js` and in the update payload.

---

### 4. Settings Update Persistence Fix
- **Root Cause**:
  1. `settingService.js` only updated an in-memory object and was not saving to MySQL; any server restart wiped the changes.
  2. In `AdminDashboard.jsx`, the response was parsed as `res.data?.referral_settings` and `refSettingsRes?.data?.referral_settings`. Since `api.js` unwraps the axios response (`return response.data`), `res.data` was `undefined`, causing state update skips on save and on page reload.
- **Resolution**:
  - Created persistent `platform_settings` table in MySQL (`viral` database) with `setting_key`, `setting_value` (JSON), `updated_by`, and `updated_at`.
  - Updated `settingService.js` to persist to and retrieve from MySQL `platform_settings`.
  - Updated `settingController.js` to return both `{ referral_settings, data: { referral_settings } }` for backwards and forwards compatibility.
  - Updated `AdminDashboard.jsx` to extract `res?.referral_settings || res?.data?.referral_settings` across `loadData()`, `handleSaveCreditRate()`, and `handleSaveReferralSettings()`.
  - Added URL search parameter synchronization (`?tab=...`) in `AdminDashboard.jsx` so tab state persists across reloads and direct links.

---

## Verification & Testing
- Client build (`npm run build`): Completed with **0 errors**.
- Server tests:
  - `POST /api/auth/login` (Admin): Authenticated successfully.
  - `PUT /api/settings/referral`: Updated bonus to 55 and standard to 12.
  - `GET /api/settings/referral`: Verified data persistence across requests and server reloads from MySQL table `platform_settings`.
