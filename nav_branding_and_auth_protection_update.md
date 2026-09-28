# Navigation Clarification, Access Protection & Brand Logo Suite Update

## Summary of Changes

### 1. Brand Logo Suite Update
The brand logo was completely resampled from the user's updated source asset (`C:\Users\rau54\Downloads\far (2) (1).png`, 1080×540, 32-bit ARGB with transparent background) and deployed to all project asset targets:
- `Viral/client/public/`
- `Viral/client/src/assets/`
- `Viral/client/dist/`

Generated assets with bicubic resampling and high-DPI scaling:
- `far-logo.png` (1080×540 master asset)
- `far-logo-lg.png` (800×400 large display asset)
- `far-logo-md.png` (500×250 desktop & mobile header brand mark)
- `far-logo-sm.png` (260×130 footer & auth screen branding)
- `far-logo-xs.png` (160×80 compact mobile notifications)
- `pwa-512.png` & `pwa-maskable-512.png` (512×512 PWA icons on `#080D1A` midnight navy base)
- `pwa-192.png` (192×192 home screen icon)
- `favicon.png` (64×64 browser tab icon)

---

### 2. Top Navigation "For Partners" Clarification
Replaced the ambiguous **"For Partners"** text with clear, industry-standard **"Advertisers"** and **"Advertisers & Sponsors"** labeling across the UI:
- **Desktop Guest Navigation**: Updated prominent pill button to **`📢 Advertisers`** linking to `/advertisers`.
- **Desktop Authenticated "More" Dropdown**: Updated sub-link to **`📢 Advertisers & Sponsors`** (`Megaphone` icon).
- **Mobile Navigation Drawer**: Updated guest link to **`📢 Advertisers & Sponsors`**.
- **Footer Links**: Renamed column to **"For Advertisers & Sponsors"** with primary CTA **`📢 Advertise with Us`**.
- **App Routes**: Added `/advertisers`, `/advertiser`, `/sponsors`, and `/sponsor` routing aliases in `AppRoutes.jsx` to direct immediately to the creator & advertiser proposal portal.
- **Landing Page**: Updated bottom growth banner callout to: *"📢 Advertise & Sponsor on FAR — Reach 100% Real Users →"*.

---

### 3. Strict Multiplier Game Authentication & Access Protection
Addressed the access issue where logged-out/guest users could view or access the Multiplier Game:
- **`MultiplyGame.jsx` In-Component Guard**: Added direct redirect:
  ```javascript
  if (!loading && (!isAuthenticated || !user)) {
    return <Navigate to="/login" replace />;
  }
  ```
- **Guest Footer Cleanup**: Removed `🎲 Multiplier Game` link from `Footer.jsx` so unauthenticated visitors (who only see the footer) cannot click or access the game.
- **Session State Cleansing (`AuthContext.jsx`)**: Updated `refreshUser()` to immediately purge stale `vr_user`, `vr_token`, and `vr_refresh_token` from `localStorage` whenever token validation fails or an unauthorized status is returned, preventing ghost authenticated states.
- **API 401 Interceptor (`api.js`)**: Updated response interceptor to reliably wipe localStorage and redirect to `/login` when 401 occurs and no valid refresh token exists.

---

### 4. Direct Login on Signup & Dashboard Session Persistence Fix
Resolved the issue where users were bounced back to the login page immediately after registration or login:
- **Root Cause**: MySQL database (port 3306) in XAMPP had stopped due to an InnoDB log sequence mismatch, causing `/api/user/profile` and `/api/user/dashboard` to throw `500 ECONNREFUSED`. In response, `AuthContext`'s error catch block had been clearing the user session and token on any error, causing `ProtectedRoute` on `/dashboard` to immediately bounce the user back to `/login`.
- **Database Service Recovery**: Restored and started MySQL on port 3306 with InnoDB recovery, verified all tables in database `viral`, and confirmed healthy database connectivity.
- **Resilient Controller Fallbacks (`userController.js`)**: Updated `getProfile`, `getDashboard`, and `getBalance` with safe fallbacks to `req.user` and isolated query error handling, ensuring these endpoints never throw 500 when database degraded mode or cached users are active.
- **Protected Session Retention (`AuthContext.jsx`)**: Updated `refreshUser()` to **only** clear session credentials on explicit `401 Unauthorized` responses. Transient 500 errors or network hiccups no longer log out active users or bounce them off `/dashboard`.
- **Public Announcements Endpoint (`settingRoutes.js`, `settingController.js`, `AnnouncementTicker.jsx`)**: Added `GET /api/settings/announcements` so the header announcement ticker no longer queries the admin-restricted `/admin/announcements` route (which previously returned 403 Forbidden for regular users).
- **Direct Post-Signup Login**: Verified that upon submitting signup on `/register`, the client immediately sets auth state, displays the 25 bonus credit welcome notification, directly enters `/dashboard`, and stays logged in without bounce-back.

---

### 5. Hero Section Mobile Responsiveness & Overflow Fix
Fixed layout breaking where the Home Page hero section elements were wider than the mobile screen and extended past the right edge:
- **Grid Column Min-Width Constrained**: Added `min-width: 0; max-width: 100%; box-sizing: border-box;` to `.hero-grid > div` and `.hero-grid`, preventing default grid items from expanding past 100vw.
- **Eyebrow Badge Responsive Scaling (`.hero-eyebrow-badge`, `.hero-eyebrow-text`)**: Converted the inline-styled badge into a responsive CSS class with `max-width: 100%`, `box-sizing: border-box`, `flex-wrap: wrap`, and compact font/padding on devices `<= 600px`.
- **CTA Button Overflow Prevention (`.hero-cta-group`, `.hero-cta-btn`)**: Fixed the `.btn` `white-space: nowrap` constraint that forced "Claim 25 Free Welcome Credits" to be 360px+ wide. On screens `<= 600px`, `.hero-cta-group` stacks vertically with `width: 100%`, `white-space: normal`, and responsive padding to fit any screen width down to 320px.
- **Root Page Overflow Guard**: Added `overflow-x: hidden; width: 100%; max-width: 100%;` to the main landing page root container.
- **Live Activity Ticker**: Adjusted `minWidth: '280px'` to `minWidth: 0, flex: '1 1 260px'` to prevent horizontal overflow on compact viewports.

---

### 6. Registration Mobile Verification Notice & "One Device, One Account" Anti-Abuse Policy
Enforced strict account fraud prevention and updated the registration UX:
- **Mobile Number Verification Notice**:
  - Added a prominent styled notice box on `Register.jsx`:
    > **Important Verification Notice**: *Your registered mobile number will be verified before using credits for recharge.*
- **Removed "No OTP" Mentions**:
  - Eliminated all occurrences of `No OTP needed` and `No OTP required` from both `Register.jsx` and `Login.jsx` to prevent user misunderstanding about upcoming SIM/mobile verification prior to recharge redemption.
- **"One Device, One Account" Anti-Duplicate Protection**:
  - **Browser & Device Fingerprinting (`deviceFingerprint.js`)**: Generates an SHA-256 entropy hash on the client using HTML5 Canvas rendering anomalies, WebGL GPU renderer & vendor strings, hardware concurrency, screen resolution, color depth, timezone, and platform attributes. Stored in local cache with fallback generation.
  - **Database Migration (`users` table)**: Added indexed column `device_fingerprint VARCHAR(64) NULL` and `signup_ip VARCHAR(45) NULL` in MySQL `viral` database with Sequelize model mapping (`User.js`).
  - **Backend Registration Guard (`authController.js`)**: During signup, the server checks if `device_fingerprint` has already registered an account (with fallback hash derived from client IP and User-Agent if fingerprint is missing).
  - If a match exists, registration is halted with `400 Bad Request`:
    > *"One Device, One Account Policy: Do not try to create more than one account to avoid account ban. Only one account must be used in a single device. Please sign in to your existing account."*
- **Explicit Account Ban & Single Device Warning on Registration Screen (`Register.jsx`)**:
  - Embedded high-visibility warning card inside the registration notice block:
    > ⚠️ **Account Policy:** **Do not try to create more than one account to avoid account ban. Only one account must be used in a single device.**

---

### 7. Post-Signup "Save App to Phone" Prompt Modal
To maximize user retention and daily active usage, users are prompted immediately upon registration to install and save FAR directly to their phone's home screen:
- **Registration Flag Trigger (`Register.jsx`)**: On successful account creation and JWT issuance, sets `sessionStorage.setItem('far_post_signup_save_app', 'true')` before navigation to `/dashboard`.
- **Global PWA Prompt Capture (`main.jsx`)**: Added global listener on window for `beforeinstallprompt` to preserve native install prompt event across route transitions.
- **Dedicated Post-Signup Prompt Modal (`PostSignupInstallModal.jsx`)**:
  - Displays high-conversion welcome modal celebrating the 25 free credits bonus and prompting the user to save the app to their phone.
  - Highlights core benefits: **1-Tap Instant Launch** (no typing URLs), **Fast Recharges & Alerts** (real-time WhatsApp & task credit notifications), and **0 MB Storage** (instant lightweight PWA).
  - **Native 1-Tap Save on Android**: Directly invokes `.prompt()` if Chromium PWA event is ready.
  - **Illustrated iOS Safari & Browser Guide**: If on iOS Safari or when native prompt is unavailable, automatically expands intuitive step-by-step visual instructions (Share ➔ "Add to Home Screen" ➔ "Add").
  - Seamlessly mounted in [`Layout.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/components/layout/Layout.jsx) to reliably trigger right after registration across all devices.

---

### 8. Two Security Questions Password Reset & Mandatory Logout Protection
Implemented a robust, non-SMS recovery architecture using 2 custom security questions with next-day lockout penalty on wrong answers:
- **Database Schema Migration (`users` table)**:
  - Added `security_q1`, `security_a1` (bcrypt-hashed), `security_q2`, `security_a2` (bcrypt-hashed), `security_questions_set` (boolean), `reset_locked_until` (timestamp), and `reset_attempts_failed` (integer).
  - Sanitized `User.prototype.toJSON()` to permanently strip `security_a1` and `security_a2` from all API payloads.
- **Forgot Password Redesign (`ForgotPassword.jsx`)**:
  - **Step 1**: User inputs WhatsApp mobile number. API verifies account existence and fetches the 2 public questions (`q1`, `q2`) without exposing answers.
  - **Step 2**: User answers both questions and inputs new password.
  - **Strict Warning**: Prominently warns that entering wrong answers will lock password reset until the next day (24 hours).
  - **Match & Reset**: If answers match (case-insensitive bcrypt comparison), password is reset, active sessions cleared, and user redirected to `/login`.
  - **Mismatch Penalty (Next Day Lockout)**: If any answer is incorrect, server immediately sets `reset_locked_until` 24 hours into the future. Further attempts return `403 Forbidden` with a countdown message.
- **Post-Signup Setup Prompt (`SecurityQuestionsModal.jsx`)**:
  - Automatically prompts user on registration (`sessionStorage.getItem('far_prompt_security_questions') === 'true'`) to configure their 2 recovery questions from diverse question sets.
- **Mandatory Setup on Logout Interception (`AuthContext.jsx`, `Navbar.jsx`)**:
  - When user clicks "Log Out" (desktop dropdown or mobile hamburger drawer), the system inspects `user.security_questions_set`.
  - If not configured, **logout is intercepted and blocked**: the security questions modal pops up with high-priority crimson styling warning that questions must be configured before logging out to protect their account and balance.
  - Upon submitting questions, questions are saved to the backend, `user.security_questions_set` marked true, and logout completes safely.

---

### 9. Removal of All Sub-₹300 Plans & Demo Credential Synchronization
- **Landing Page Plan Filtering (`Landing.jsx`)**:
  - Removed all low-value booster packs (₹16, ₹19, ₹22) and sub-300 plans (₹107, ₹199, ₹249, ₹299).
  - Configured all operator preview tabs (Jio, Airtel, Vi, BSNL) to showcase genuine popular plans starting strictly from **₹349** up to **₹3599** (Annual Packs).
  - Updated Savings Calculator: replaced sub-300 daily booster with the Annual 365-Day Hero Pack option, ensuring all calculations reflect plans >= ₹349.
  - Updated Live Ticker and Testimonials to reference standard ₹349+ packs.
- **Demo Login Credential Resolution (`authController.js`, `Login.jsx`)**:
  - Root cause: User `9876543210` in MySQL had an outdated password hash that did not match `Password@123`.
  - Re-hashed and synchronized database credentials:
    - **Demo Admin**: Mobile `9999999999` (or alias `admin`), Password `Admin@123`
    - **Demo User**: Mobile `9876543210` (or alias `demo`), Password `Password@123`
  - Added smart input alias recognition in `authController.js`: typing `admin` or clicking the 1-tap quick fill logs directly into the Admin Control Panel.
  - Enhanced `Login.jsx` quick fill section with explicit credential badges and instant feedback.





