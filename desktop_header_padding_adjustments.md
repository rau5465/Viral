# Desktop Header Clearance & Top Padding Adjustments

## Overview
Because the brand logo hangs ~35px below the standard 64px sticky header on desktop viewports, page headings, "Back to Home" navigation links, and top widgets across inner and outer pages were getting obscured or sitting too close to the hanging logo.

This update introduces systematic desktop header clearance across all inner and outer pages with responsive media query scaling for mobile devices.

---

## Changes Implemented

### 1. Global CSS Offset Classes ([`index.css`](file:///D:/Projects/FAR%20Project/Viral/client/src/index.css))
- **`.page-container`**: Updated desktop padding from `24px 20px` to `64px 20px 80px 20px`.
- **`.page-header-offset`**: Applied `padding-top: 64px !important;` on desktop (`> 768px`) for outer policy and content pages with back buttons or top badges.
- **`.inner-page-offset`**: Applied `padding-top: 52px !important;` on desktop (`> 768px`) for authenticated user dashboards and management screens.
- **Mobile Responsive Query (`@media (max-width: 768px)`)**:
  - Automatically resets `.page-container` to `padding: 24px 16px 60px 16px`.
  - Sets `.page-header-offset` to `padding-top: 24px !important;`.
  - Sets `.inner-page-offset` to `padding-top: 20px !important;`.
  - Prevents excessive whitespace on mobile devices where the logo resides inside the standard 56px navbar.

---

### 2. Outer & Policy Pages Updated
Each of these pages was updated with `.page-header-offset` and `padding: 64px 20px 80px 20px` so "Back to Home" links and headings sit comfortably below the hanging logo on desktop:
- **`About.jsx`**: [`About.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/About.jsx#L21)
- **`ContactUs.jsx`**: [`ContactUs.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/ContactUs.jsx#L123)
- **`PrivacyPolicy.jsx`**: [`PrivacyPolicy.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/PrivacyPolicy.jsx#L7)
- **`TermsOfService.jsx`**: [`TermsOfService.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/TermsOfService.jsx#L7)
- **`RefundPolicy.jsx`**: [`RefundPolicy.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/RefundPolicy.jsx#L7)
- **`RechargePolicy.jsx`**: [`RechargePolicy.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/RechargePolicy.jsx#L19)
- **`Partners.jsx`**: [`Partners.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Partners.jsx#L223)

---

### 3. Inner Application Pages Updated
Each of these screens was updated with `.inner-page-offset` and `padding: 52px 20px 30px 20px` (or `margin: 0 auto` with 52px top padding) so dashboard cards and top titles never touch or hide behind the logo tab:
- **`Dashboard.jsx`**: [`Dashboard.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Dashboard.jsx#L50-L60) (Announcement bar & 4x timer widget cleared)
- **`Tasks.jsx`**: [`Tasks.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Tasks.jsx#L79) (`Earn Credits` heading cleared)
- **`ReferralCenter.jsx`**: [`ReferralCenter.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/ReferralCenter.jsx#L85) (`Referral Center & 4X Bonus` heading cleared)
- **`RechargeRedeem.jsx`**: [`RechargeRedeem.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/RechargeRedeem.jsx#L84) (`Redeem Mobile Recharge` heading cleared)
- **`Leaderboard.jsx`**: [`Leaderboard.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Leaderboard.jsx#L27) (`Top Referrers Hall of Fame` heading cleared)
- **`TransactionHistory.jsx`**: [`TransactionHistory.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/TransactionHistory.jsx#L37) (`Wallet Ledger & History` heading cleared)
- **`Profile.jsx`**: [`Profile.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Profile.jsx#L31) (Profile card cleared)
- **`AdminDashboard.jsx`**: [`AdminDashboard.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/admin/AdminDashboard.jsx#L297) (`Control Panel & Administration` heading cleared)
- **`Register.jsx`**: [`Register.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Register.jsx#L82) (Card margin updated to `56px auto`)

---

## Verification
- Built with `npm run build` — 1982 modules transformed cleanly in 1.64s.
- Tested responsive styling for both desktop (> 768px) and mobile (<= 768px).
