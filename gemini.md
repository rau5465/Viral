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

## Important Files
- `Plan.md` — Full project plan with task list
- `logs.md` — Feature & change log
- `commands_history.md` — User command history

