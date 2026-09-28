# Referral Fees & Promotional Copy Update

## Overview
1. **Dynamic Referral Settings (Admin Controlled)**:
   - Configured single refer in first 2 hours vs after 2 hours rewards to be fully configurable by Admin in Settings.
   - Reduced the bonus multiplier requirement from 2 referrals to a single (1) referral within the initial 2-hour window.
2. **Promotional Copy Overhaul**:
   - Replaced all mentions of fixed "4X" rewards with **"Get Up to 5x Rewards On Refer if you share app in next two hours"** across the Home page, User Dashboard, Referral Center, and policy pages.

---

## 1. Backend Settings & Referral Engine Updates

### Settings Architecture (`settingService.js`, `settingController.js`, `settingRoutes.js`)
- Added persistent Redis cache + in-memory store for referral reward configuration:
  - `bonus_reward_2h`: Reward for referrals made within the first 2-hour countdown (default: `50 CR`).
  - `standard_reward`: Standard reward for referrals made after 2 hours (default: `10 CR` = ₹10).
  - `target_referrals`: Required referrals within the first 2 hours (default: `1` for Single Refer).
  - `bonus_window_hours`: Window duration from signup (default: `2` hours).
- Exposed public API: `GET /api/settings/referral`
- Exposed Admin-only API: `PUT /api/settings/referral` & `POST /api/settings/referral`

### Referral & Bonus Logic (`referralService.js`, `bonusService.js`)
- **`awardReferralReward`**: Now dynamically queries `getReferralSettings()` rather than hardcoding numbers:
  - If referee joins within referrer's 2-hour deadline: awards `bonus_reward_2h`.
  - If referee joins after deadline: awards `standard_reward`.
- **`checkAndApplyBonusMultiplier` & `getBonusStatus`**:
  - Changed target to `target_referrals` (1 referral).
  - A single referral within the 2-hour window unlocks the bonus.

---

## 2. Admin Control Panel (`AdminDashboard.jsx`)
- In **⚙️ Rates & Referrals** (Tab 7):
  - Added dedicated **"Referral Reward Rates & 2-Hour Rules"** management card.
  - Live preview pills for:
    - *First 2 Hours Reward (Single Refer)*
    - *After 2 Hours Reward (Standard)*
    - *Bonus Target (Single Refer)*
    - *Last updated by admin & timestamp*
  - Form allowing immediate editing and saving of:
    - Single Refer in First 2 Hours (Credits)
    - Referral Reward After 2 Hours (Credits)
    - Target Referrals (1)
    - Bonus Window Hours (2)

---

## 3. Client Promotional Copy Updates
- **`Landing.jsx` (Home Page)**:
  - Changed hero and feature descriptions to *"Get Up to 5x Rewards On Refer if you share app in next two hours"*.
  - Updated 2-Hour Challenge section to highlight Single Refer requirement and Up to 5X Rewards.
- **`Dashboard.jsx` & `BonusTimerWidget.jsx`**:
  - Header: *"Get Up to 5x Rewards On Refer!"*
  - Subtext: *"Get Up to 5x Rewards On Refer if you share app in next two hours! Single refer unlocks massive bonus credits."*
  - Progress bar target updated to `1` (Single Refer).
- **`ReferralCenter.jsx`**:
  - Header: *"Invite & Referral Program"*.
  - Subtitle: *"Get Up to 5x Rewards On Refer if you share app in next two hours! Single refer unlocks massive bonus credits."*
- **Policy & Informational Pages** (`About.jsx`, `Register.jsx`, `TermsOfService.jsx`, `Partners.jsx`, `ContactUs.jsx`, `PrivacyPolicy.jsx`, `RechargePolicy.jsx`, `RefundPolicy.jsx`, `TransactionHistory.jsx`):
  - Removed outdated "4x" references and updated to "Up to 5X".
