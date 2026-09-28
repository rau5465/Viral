# FAR (Forget About Recharge) — Partner & Advertiser Proposal Portal

**Date**: September 2026  
**Platform**: FAR (Forget About Recharge)  
**Official Partnership Desk**: `contact@forgetaboutrecharge.com?subject=Partner%20Proposal`  
**Live Partner Route**: `/partners` (Aliases: `/partner`, `/advertise`, `/creators`)

---

## 1. Executive Summary & Business Flywheel

The **Partner & Advertiser Portal** introduces a high-margin monetization engine for FAR by bridging two core stakeholders:
1. **Partners (YouTubers, Website Owners, App Publishers & Ad Agencies)**:
   - Suffer from click fraud, dead bot traffic, and exorbitant Cost-Per-Click rates on traditional ad platforms.
   - Require real, authenticated Indian mobile consumers who take meaningful digital actions.
2. **FAR Mobile Users**:
   - Eager to complete simple, verified micro-tasks (subscribe to a channel, visit a website for 45s, test a mobile app) to earn airtime credits.
   - Redeem credits for 100% free prepaid mobile recharges across **Reliance Jio, Bharti Airtel, Vodafone Idea (Vi), and BSNL**.
3. **Platform Economics**:
   - The platform charges advertisers on a transparent Cost-Per-Action (CPA) / Cost-Per-Engagement (CPE) basis.
   - The platform allocates airtime credits to the user upon verification and captures the spread as net operational revenue.

---

## 2. Dedicated Partner Landing Experience (`/partners`)

Located at `Viral/client/src/pages/Partners.jsx`:

### 2.1 Hero & Value Proposition
- **Headline**: *"Grow Your YouTube Channel, Website & App with 100% Real Indian Users"*
- **Core Message**: Guarantees verified human attention using active Indian SIM numbers, Google OAuth API verification, and active-tab dwell timers.
- **Trust Indicators**:
  - `100% Verified Real Humans` (Zero bot traffic policy)
  - `OAuth 2.0` official Google YouTube API integration
  - `< 2 Hours` campaign setup and onboarding turnaround
  - `22 Telecom Circles` across all Indian telecom providers

---

## 3. Tailored Proposals by Partner Segment

### 3.1 YouTubers & Content Creators
- **The Problem**: Channel stagnation, algorithmic freeze, low watch-time retention from fake subscribers.
- **FAR Solution**: Genuine subscriptions via official Google OAuth 2.0 authorization.
- **Key Metrics**:
  - ~₹3.50 per verified Google OAuth subscriber.
  - Zero drop-off guarantee (anti-unsub enforcement).
  - Fast-tracks channels to the YouTube Partner Program (1,000 subscribers, 4,000 watch hours).
  - 100% compliant with YouTube Community Guidelines.

### 3.2 Website Owners & Bloggers
- **The Problem**: High bounce rates from programmatic ad networks and click farms.
- **FAR Solution**: Verified 30–60 second dwell-time visits with active-tab focus monitoring.
- **Key Metrics**:
  - ~₹1.20 per active 45s visit.
  - Boosts organic search ranking signals and user dwell time.
  - Indian telecom IP addresses (Jio, Airtel, Vi, BSNL).
  - Drives legitimate ad impressions and affiliate conversions.

### 3.3 Mobile App Developers & Direct Ad Agencies
- **The Problem**: Paying ₹50+ Cost-Per-Install only for immediate uninstalls.
- **FAR Solution**: Milestone-based CPA/CPI (Install + Open + Account Registration).
- **Key Metrics**:
  - ~₹6.50 per verified install and trial.
  - High Day-1 and Day-7 retention.
  - Play Store discovery and positive user reviews.
  - 4X Viral Multiplier announcements broadcast to top referrers.

---

## 4. Interactive Campaign Reach & Budget Estimator

Embedded directly on the `/partners` page:
- **Campaign Selectors**:
  1. YouTube Subscribers (OAuth verified)
  2. Website Visits (45s active dwell time)
  3. App Installs & Trial
  4. Surveys & Market Feedback
- **Engagement Volume Slider**: Real-time slider from 250 to 15,000 verified actions with quick preset buttons (500, 1K, 2.5K, 5K, 10K).
- **Dynamic Estimates**: Displays estimated investment (INR), turnaround SLA (e.g. 24–48 hours), effective rate per action, and included perks.
- **One-Click Lock-In**: Pre-populates the proposal form with the selected budget and target volume.

---

## 5. Fast-Track Campaign Proposal Submission Form

- **Fields**:
  - Contact Name (required)
  - Channel / Company / Brand Name
  - Work / Contact Email (required)
  - Phone / WhatsApp Number (required for onboarding)
  - Partner Category Dropdown
  - Target URL (YouTube channel link, Website URL, or Play Store link)
  - Anticipated Budget Range (from ₹2,500 Starter to ₹2,00,000+ Enterprise)
  - Desired Engagement Volume
  - Detailed Campaign Objectives / Task Instructions
  - Attachment Upload (banners, screenshots, pitch decks) with live preview and automatic server-side WebP compression.
- **Backend Routing**:
  - Handled via `POST /api/partners` and `POST /api/contact`.
  - Stored in the database and immediately accessible in the **Admin Control Panel** under the **Inquiries** tab.
  - Admins can inspect the proposal, review the compressed attachment, and update status from `new` to `in_progress` or `resolved`.

---

## 6. Site-Wide Navigation & Cross-Promotion

1. **Header Navigation** (`Navbar.jsx`):
   - Added prominent `🤝 For Partners` button in the site header for visitors.
2. **Footer Navigation** (`Footer.jsx`):
   - Created a dedicated **For Partners & Brands** column featuring:
     - *Partner With Us* (`/partners`)
     - *YouTube Creator Growth*
     - *Website Traffic & Dwell*
     - *App Installs & CPA*
     - *Campaign ROI Calculator*
     - *Submit Campaign Proposal*
3. **Landing Page Banner** (`Landing.jsx`):
   - Added high-converting partner callout strip in the final Call-To-Action card:
     *"Are you a YouTuber, Website Owner, or App Developer? Partner with FAR & Grow with 100% Real Users →"*

---

## 7. Verification & Build Status

- **Client Build**: `npm run build` completed successfully with 0 errors in 1.25s.
- **Backend API**: `POST /api/partners` verified via curl, returning HTTP 201 Created and ticket confirmation.
- **Live Background Task**: Express server running on port 5000 (task-555).
