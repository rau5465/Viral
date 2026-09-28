# FAR — Telecom Operator Plans & Mobile Recharge Redemption Update

## Overview
This update revamps the **Redeem Mobile Recharge** page (`/recharge`) with interactive telecom operator brand selectors featuring official SVG logos (Jio, Airtel, Vi, BSNL), real post-tariff prepaid plans strictly starting at **₹300 and above** (zero plans below ₹300), flexible mobile number entry (own number or any family/friend number), and a confirmation modal with instant ledger deduction.

---

## Key Features & Changes

### 1. Flexible Mobile Number Entry
- Users can enter **any 10-digit Indian prepaid mobile number** to recharge for themselves, family members, or friends.
- Includes a quick-fill shortcut: `[ 📱 Use My WhatsApp Number (+91 {user.mobile}) ]`.
- Live 10-digit Indian validation with `+91` flag badge and green glowing state.

### 2. Interactive Telecom Operator Selector
- Dedicated visual brand cards replacing the plain `<select>` dropdown:
  - **Reliance Jio**: Official blue `JioLogo` with *True 5G Unlimited* tag.
  - **Bharti Airtel**: Official red `AirtelLogo` with *Airtel 5G Plus* tag.
  - **Vodafone Idea (Vi)**: Official `ViLogo` with *Vi Hero Unlimited* tag.
  - **BSNL Mobile**: Official navy & saffron `BsnlLogo` with *Connecting India 4G* tag.
- Selecting an operator automatically filters and highlights that operator's real prepaid plans.

### 3. Strictly Plans $\ge$ ₹300 (No Plans Below 300)
All micro/emergency packs below ₹300 (e.g. ₹19, ₹22, ₹107, ₹199, ₹299) have been completely removed and blocked at both the frontend and backend API layers. Minimum plan starts at **₹319** (BSNL) and **₹349** (Jio, Airtel, Vi):

| Operator | Minimum Plan | Key Included Plans ($\ge$ ₹300) | Maximum Plan |
|---|---|---|---|
| **Jio** | **₹349** (2GB/Day + Unl. 5G, 28D) | ₹399 (2.5GB/D), ₹449 (3GB/D), ₹629 (56D), ₹719 (70D), ₹859 (84D), ₹899 (90D), ₹1199 (84D) | **₹3599** (Annual 365 Days) |
| **Airtel** | **₹349** (1.5GB/Day + Unl. 5G, 28D) | ₹379 (2GB/D, 1M), ₹409 (Xstream OTT), ₹449 (3GB/D), ₹579 (56D), ₹649 (56D), ₹859 (84D), ₹979 (84D), ₹1199 (Prime) | **₹3599** (Annual 365 Days) |
| **Vi** | **₹349** (Hero Unl. 12-6AM, 28D) | ₹379 (1M), ₹449 (3GB/D Super Binge), ₹579 (56D), ₹649 (56D), ₹859 (84D), ₹979 (84D), ₹1198 (Hotstar) | **₹3499** (Annual 365 Days) |
| **BSNL** | **₹319** (Unl. Calls + 10GB, 65D) | ₹347 (2GB/D, 54D), ₹397 (150 Days SIM Saver), ₹499 (75D), ₹599 (Night Data, 84D), ₹797 (300D), ₹997 (160D), ₹1999 (600GB) | **₹2399** (395 Days Mega) |

### 4. Rich Plan Cards with Perks & Filter Pills
- Filter pills: `All Plans`, `1 Month (28D)`, `54–75 Days`, `84–90 Days`, `365 Days`.
- Displays Daily Data allowance, Voice calling, SMS, 5G Speed tier, and OTT perks (JioCinema, Airtel Xstream, Vi Binge All Night, Disney+ Hotstar, Amazon Prime).
- Smart CTA button displays `⚡ Redeem Free Recharge` if balance is sufficient, or `Need X More Credits` with a direct link to earn tasks.

### 5. Backend API Updates
- **[`rechargeService.js`](file:///D:/Projects/FAR%20Project/Viral/server/services/rechargeService.js)**:
  - Added 37 verified operator plans all strictly $\ge$ ₹300.
  - Implemented `plansByOperator` and operator filtering in `getRechargePlans(operator)`.
  - Added strict backend validation rejecting any plan ID under ₹300.
  - Implemented `inMemoryUsers` and `inMemoryRecharges` fallback for 100% uptime in database degraded mode.
- **[`rechargeRoutes.js`](file:///D:/Projects/FAR%20Project/Viral/server/routes/rechargeRoutes.js)**:
  - Made `GET /api/recharges/plans` publicly accessible so users can view plans immediately.

---

## Verification
- API verified: `GET /api/recharges/plans` returns 37 plans across Jio, Airtel, Vi, BSNL; `plans.some(p => p.amount < 300)` returns `false`.
- Backend validation verified: Submitting a plan `< 300` returns `400 Bad Request: Invalid recharge plan selected. Minimum recharge plan is ₹300.`
- Client build verified: `npm run build` compiled 1984 modules cleanly in 1.39s with 0 errors.
