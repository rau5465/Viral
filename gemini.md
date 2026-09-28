# ViralRecharge — Project Context

## Overview
ViralRecharge is a viral referral-based platform where users earn credits through tasks (referrals, watching ads, visiting sites, subscribing YouTube channels, watching videos, following on social media) and redeem them for free mobile recharges.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL (Sequelize ORM)
- **Auth**: JWT + Google OAuth
- **Styling**: Vanilla CSS (Dark mode, glassmorphism)

## Key Mechanic
4x signup bonus if user refers 2 people within 2 hours of registration — creating an exponential viral loop.

## Project Structure
- `client/` — React + Vite frontend
- `server/` — Node.js + Express backend
- `database/` — SQL migrations & seeds

## Design Principles
- Mobile-first, dark mode default
- Glassmorphism cards, gradient accents
- Real-time credit updates with animations
- Gamification (levels, leaderboards, badges)

## YouTube Subscription Verification
- Google OAuth 2.0 (`youtube.readonly`, `userinfo.profile`, `userinfo.email`)
- Verification via YouTube Data API v3 (`subscriptions.list` with `mine=true` & `forChannelId={channelId}`)
- Multi-partner channel support (`partner_channels`)
- Server-side AES-256-GCM token encryption (`user_youtube_accounts`)
- Automatic OAuth token refresh, revoked access detection & anti-duplicate claim ledger (`user_youtube_subscriptions`)

## Rewarded Video Ads — Lucky Spin Wheel
- Gamified rewarded video ad loop: Watch 15s sponsor video to unlock 1 Free Spin
- 8-segment HTML5 Canvas wheel with 100% win guarantee (1 to 20 recharge credits; 1 credit appears 3 times, 3 credit removed, top jackpot is 20 credits)
- Realistic physics deceleration, mechanical ticking audio & fanfare chimes (Web Audio API)
- Anti-cheat server-side RNG with weighted probabilities, daily limit tracker (`user_spins`), and `spin_wheel` transaction ledger
- Real-time Admin Panel Configuration in dedicated `Lucky Spin Wheel` tab: Live editing of all 8 slice labels, credit rewards, probability weights, slice colors, max daily spins, and ad dwell timing backed by MySQL `platform_settings` and Redis cache

## Admin Control Center & Platform Settings
- **YouTube Partners (`/admin?tab=youtube`)**: Register and manage partner channels, configure credits bounty, live active/disabled toggling, deletion, and subscriber verification metrics.
- **Lucky Spin Wheel (`/admin?tab=spin_wheel`)**: Dedicated control page for 8-slice editor, ad dwell timer, daily limit, and game status.
- **Multiplier Game (`/admin?tab=multiply_game`)**: Dynamic min/max bets, multiplier payout, dead loss zone house edge (with margin calculator), and emergency pause toggle.
- **WhatsApp Verification (`/admin?tab=whatsapp`)**: wacli daemon configuration, code expiry, webhook secret, and interactive test simulator.
- **Rates & Referrals (`/admin?tab=settings`)**: Focused control of 1Rs = 1CR conversion valuation and 2h Single Refer bonus rules.

## Admin User Impersonation ("Login as User")
- **One-Click Impersonation**: Admins can log in directly as any regular user from the User Moderation directory (`/admin?tab=users`) by clicking the user's name or the "Login As" action button.
- **Session Preservation & Dual Tokens**: Original admin tokens are securely preserved in client storage (`vr_admin_impersonator_*`) so admins are never logged out.
- **Persistent Top Notification Banner**: Sticky banner (`ImpersonationBanner.jsx`) displayed at top of all pages showing impersonated user, balance, and a 1-click "Exit Impersonation" button restoring the admin session immediately.
- **Security & Auditing**: Backend endpoint `POST /api/admin/users/:id/impersonate` guards against self-impersonation and admin-to-admin impersonation; logs `IMPERSONATE_USER` action in `admin_logs`.

## Important Files
- `Plan.md` — Full project plan with task list
- `logs.md` — Feature & change log
- `commands_history.md` — User command history

