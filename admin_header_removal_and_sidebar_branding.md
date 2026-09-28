# Admin Layout Refactor: Top Header Removal & Integrated Sidebar Branding

## Summary of Changes

### 1. Header & Notice Removal for Admin
- **File**: `Viral/client/src/components/layout/Layout.jsx`
- Suppressed `<Navbar />` and `<AnnouncementTicker />` (the Notice bar) for logged-in Administrators (`!isAdmin && <Navbar />`, `!isAdmin && <AnnouncementTicker />`).
- Notice announcements are intended strictly for public users and are no longer displayed to admins.
- Suppressed public popups/banners (`MobileNav`, `InstallAppBanner`, `PostSignupInstallModal`, `MultiplyPromoModal`) from rendering in the admin console.

### 2. Integrated FAR Sidebar Branding
- **File**: `Viral/client/src/pages/admin/AdminDashboard.jsx`
- Replaced previous generic admin text header with the official **FAR** branding:
  - **Expanded state**: Displays `/far-logo-md.png` alongside styled "FAR Admin Console" typography.
  - **Collapsed state**: Displays `/far-logo-sm.png` icon centered with quick expand/collapse controls.
  - Links directly to `/admin`.

### 3. Complete Navigation & Footer in Left Sidebar
- **File**: `Viral/client/src/pages/admin/AdminDashboard.jsx`
- Left sidebar includes full access to all system tabs:
  - **Platform Analytics** (Overview)
  - **Live Users Activity** (with real-time glowing pulse badge: `X LIVE`)
  - **User Moderation** (Credits, banning, referral tracking)
  - **Tasks & Ads** (Reward campaigns)
  - **Recharge Orders** (Simulated dispatch queue)
  - **Sponsors & Inquiries** (Contact submissions)
  - **Rates & Referrals** (Rupee-to-Credit valuation & reward rates)
  - **Announcements** (User ticker management)
  - **Maintenance Mode** (Global maintenance gate)
  - **Activity Logs** (Audit trail)
- Added **Sidebar Footer**:
  - Displays logged-in Administrator profile details with avatar initial and "Super Administrator" badge.
  - "User App" button to open the public site in a new tab.
  - "Exit / Sign Out" button hooked into `useAuth().logout()`.

### 4. Full-Height 100vh Styling & Responsive Mobile Drawer
- **File**: `Viral/client/src/index.css`
- Updated `.admin-fullwidth-wrapper` to `min-height: 100vh;`.
- Updated `.admin-sidebar` to `top: 0; height: 100vh;` (no longer offset by the 64px header).
- Added smooth backdrop overlay and mobile drawer toggle button (`.admin-mobile-toggle-btn`) for responsive viewports.

### 5. Verification
- Vite production build executed cleanly with 0 errors (`npm run build`).
