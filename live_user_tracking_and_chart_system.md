# Real-Time Live User Tracking & Historical Activity Chart

## Architectural Design: Zero-Overhead Telemetry

To satisfy the requirement of showing **how many users were live when in a chart** and **how many users are currently live** without causing client requests to overwhelm the server, we designed a high-throughput, low-impact telemetry architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client User App                        │
│ • Passive piggybacking on existing authenticated requests   │
│ • Heartbeat pulse throttled to 90s only when tab is visible │
│ • Completely pauses when tab is minimized / backgrounded    │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express Middleware                │
│ • req.user automatically touches ActiveUserService          │
│ • Zero database hits for live heartbeats                    │
│ • Stored in Redis Sorted Set `active_live_users` (or memory)│
│ • Score = timestamp epoch ms, Member = `u:<id>` / `g:<cid>` │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│               Background Cron Snapshot Worker               │
│ • Runs once every 2 minutes (`cronJobs.js`)                 │
│ • Prunes idle users older than 3 minutes                    │
│ • Writes 1 summary row to MySQL `active_user_snapshots`     │
│   (timestamp, live_users_count, authenticated, guests)      │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                        │
│ • Instant real-time live count from Redis (O(1))            │
│ • Historical chart rendered via SVG (1h, 6h, 24h, 7d ranges)│
│ • Dedicated "Live Users Activity" tab & Overview graph      │
└─────────────────────────────────────────────────────────────┘
```

---

## Changes Implemented

### 1. Database Model for Time-Series History
- Created [`ActiveUserSnapshot.js`](file:///D:/Projects/FAR%20Project/Viral/server/models/ActiveUserSnapshot.js):
  - `timestamp`: Point in time of the snapshot.
  - `live_users_count`: Total live users online at that moment.
  - `authenticated_count`: Logged-in accounts.
  - `guest_count`: Active visitors.
- Synced into the MySQL database (`active_user_snapshots` table) with an indexed `timestamp` field.

### 2. High-Performance `ActiveUserService`
- Created [`activeUserService.js`](file:///D:/Projects/FAR%20Project/Viral/server/services/activeUserService.js):
  - **`recordHeartbeat(identifier, isAuthenticated)`**:
    - Executes Redis `ZADD` (or in-memory Map) in `O(1)` time complexity.
  - **`cleanupExpired(windowSeconds)`**:
    - Purges users whose heartbeat is older than 3 minutes (`ZREMRANGEBYSCORE`).
  - **`getCurrentLiveStats()`**:
    - Computes current live count, authenticated vs. guest breakdown in milliseconds.
  - **`recordSnapshot()`**:
    - Persists aggregated summary point to `active_user_snapshots` table.
  - **`getLiveUserHistory(range)`**:
    - Queries database for time-series data matching `1h`, `6h`, `24h`, or `7d` ranges.

### 3. Server Integration & Passive Tracking
- **`middleware/auth.js`**:
  - The `protect` middleware automatically calls `activeUserService.recordHeartbeat(user.id, true)` in the background without adding latency to API calls.
- **`routes/authRoutes.js`**:
  - Added lightweight `POST /api/auth/heartbeat` for guest visitors and long idle sessions.
- **`routes/adminRoutes.js`**:
  - Added `GET /api/admin/live-users` to fetch historical chart data.
- **`controllers/adminController.js`**:
  - Injected `liveUsers`, `liveAuthenticated`, and `liveGuests` directly into `GET /api/admin/dashboard`.
- **`jobs/cronJobs.js`**:
  - Added a 2-minute recurring cron task taking snapshots and archiving time-series points.

### 4. Client Side Minimal Overhead (`Layout.jsx`)
- Inside [`Layout.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/components/layout/Layout.jsx):
  - Employs the `document.visibilityState` API.
  - When the browser tab is hidden or minimized, heartbeats are suspended entirely.
  - Only sends a pulse once every 90 seconds (throttled to min 45 seconds).

### 5. Admin Dashboard Visualization
- Updated [`AdminDashboard.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/pages/admin/AdminDashboard.jsx):
  - **Sidebar Badge**: Added a dedicated `Live Users Activity` menu item featuring a pulsing neon-green status dot and live counter (e.g. `12 LIVE`).
  - **Overview Tab Widget**: Real-time telemetry banner showing live users, authenticated count, and guest visitors alongside an interactive time-series SVG graph.
  - **Dedicated Tab View (`live_users`)**: Comprehensive traffic dashboard with time range toggles (`1H`, `6H`, `24H`, `7D`), area gradient fill, peak-valley tracking, and hover tooltips for exact timestamp metrics.
