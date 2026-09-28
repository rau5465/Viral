# FAR — Multiply Credits HI-LO Game (FreeBitco.in Style)

## Overview
A high-energy, classic FreeBitco.in-inspired **Multiply Credits HI-LO 10,000 Roll Game** has been implemented. Users can wager their earned FAR credits to double their balance (2.0X payout) with a dedicated **4500 to 5500 dead/loss zone** that enforces the house edge. Complete database ledger tracking records all rolls, and users are aggressively prompted with an interactive modal and prominent dashboard banners after 2 days (48 hours) of account age.

---

## 1. Game Mechanics & Mathematical Model

| Parameter | Specification | Details |
|---|---|---|
| **Random Range** | `1` to `10000` (inclusive) | Uniform pseudo-random distribution generated server-side |
| **BET LO Condition** | Roll `< 4500` | Rolls `1` to `4499` win 2.0X (44.99% probability) |
| **BET HI Condition** | Roll `> 5500` | Rolls `5501` to `10000` win 2.0X (45.00% probability) |
| **Dead / Loss Zone** | `4500 <= roll <= 5500` | **Always a loss** for both HI and LO (10.01% house edge) |
| **Payout Multiplier** | `2.0X` | Net profit is `+bet_amount` on win, `-bet_amount` on loss |
| **Min Bet / Max Bet** | 1 Credit / User Balance | Quick controls: `MIN`, `/2`, `2X`, `+5`, `+25`, `MAX` |

---

## 2. Backend Architecture

### Database Model: [`GameRoll.js`](file:///D:/Projects/FAR%20Project/Viral/server/models/GameRoll.js)
Stores comprehensive audit details for each roll:
- `user_id`: Foreign key to users
- `bet_amount`: Number of credits wagered
- `bet_type`: `'HI'` or `'LO'`
- `target_condition`: `'> 5500'` or `'< 4500'`
- `roll_result`: Integer `1` to `10000`
- `multiplier`: `2.00`
- `payout`: `bet * 2` (or `0` on loss)
- `profit`: `+bet` on win, `-bet` on loss
- `status`: `'won'` or `'lost'`
- `in_loss_zone`: Boolean (set to `true` if `roll >= 4500 && roll <= 5500`)
- `balance_after`: Resulting user credit balance
- Fully integrated with [`Transaction.js`](file:///D:/Projects/FAR%20Project/Viral/server/models/Transaction.js) under category `'multiply_game'`.

### Controller: [`multiplyController.js`](file:///D:/Projects/FAR%20Project/Viral/server/controllers/multiplyController.js)
- **`rollDice`**: Validates balance and bet type, executes RNG roll, computes outcome, updates database in a transaction, invalidates Redis user cache, and returns result. Includes an in-memory fallback array (`inMemoryGameRolls`) ensuring 100% uptime in degraded database mode.
- **`getMyRolls`**: Returns current user's last 30 rolls.
- **`getLiveRolls`**: Returns recent rolls across community players (with privacy-masked phone numbers) to create an authentic live multiplayer atmosphere.
- **`getGameStats`**: Returns total rolls, win rate, net profit, and promo eligibility (`is_eligible_for_2day_promo: account_age_days >= 2`).

### Endpoints: [`multiplyRoutes.js`](file:///D:/Projects/FAR%20Project/Viral/server/routes/multiplyRoutes.js)
- `POST /api/multiply/roll` (Protected)
- `GET /api/multiply/my-rolls` (Protected)
- `GET /api/multiply/live-rolls` (Public / Community)
- `GET /api/multiply/stats` (Protected)
- Mounted at `/api/multiply`, `/api/game`, and `/api/games` in `app.js`.

---

## 3. Frontend Implementation

### Game Page: [`MultiplyGame.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/MultiplyGame.jsx)
- **Mechanical Digital Ticker**: 5-digit high-speed roll animation with Web Audio API ticks and synthesized chimes (C-major win arpeggio, low-frequency buzz on loss/dead zone).
- **Loss Zone Visual Spectrum**: Color-coded probability bar highlighting the green LO/HI win zones and the striped red 4500–5500 dead zone.
- **Header Clearance**: Uses `.inner-page-offset` (`padding-top: 52px` on desktop) ensuring controls sit below the overhanging desktop logo.
- **Dual Buttons**: Large `[ BET LO < 4500 ]` and `[ BET HI > 5500 ]` with instant feedback and canvas-confetti on wins.
- **Community & Personal Tabs**: Toggle between "My Rolls History", "Live Community Stream", and "Game Rules & Odds".

### 48-Hour Aggressive Promotion Engine
1. **[`MultiplyPromoModal.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/components/common/MultiplyPromoModal.jsx)**:
   - Evaluates user account age (`now - user.created_at >= 48 hours`).
   - If eligible, triggers a high-conversion modal with glowing dice, veteran bonus badge, and direct `[ Roll Dice & Multiply Credits ]` CTA.
   - If dismissed, re-prompts after 4 hours to keep engagement high without trapping users.
2. **Dashboard Promo Card ([`Dashboard.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/Dashboard.jsx))**:
   - High-contrast glowing banner directly above the metrics grid highlighting the 2X Hi-Lo game with a direct action link.
3. **Navigation Bars ([`Navbar.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/components/layout/Navbar.jsx), [`Footer.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/components/layout/Footer.jsx))**:
   - Added `🎲 Multiply 2X` navigation link in the top desktop navigation and footer links.
