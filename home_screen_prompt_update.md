# Home Screen Prompt & Mobile Restriction Update

## Overview
Replaced the intimidating **"Install FAR Web App"** banner with a user-friendly **"Save to Phone's Home Screen"** shortcut prompt, and strictly restricted its appearance to mobile browsers on Android and iOS devices.

---

## Changes Implemented

### 1. User-Friendly Copy & Non-Threatening Language
- **Heading**: Changed from `"Install FAR Web App"` to `Save to Phone's Home Screen`.
- **Subtext**: Changed to `Use directly with 1 tap • No download needed` (assuring users no storage space or APK installation is required).
- **Button Text**: Changed from `"Install"` to `Add to Screen` with a `<Plus />` icon.
- **Removed Scary Terms**: Eliminated all occurrences of "install", "downloading", and "APK" from the prompt copy.

### 2. Strict Mobile Device & OS Restriction
- Added `checkIsMobileOrHandheld()` in [`InstallAppBanner.jsx`](file:///D:/Projects/FAR%20Project/Viral/client/src/components/common/InstallAppBanner.jsx):
  - Explicitly targets **Android** (`/android/i`) and **iOS** (`iPhone`, `iPad`, `iPod`, `iPadOS`).
  - Explicitly filters out desktop environments (`Windows NT`, `Macintosh` non-touch, `Linux x86_64`).
  - Ensures desktop browser users never see this mobile-specific home-screen prompt.
  - Detects standalone mode (`display-mode: standalone` / `window.navigator.standalone`) to hide the banner once added.

### 3. Native & Non-Native Platform Handling (iOS & Android)
- **Chromium / Android Chrome**: Captures the native `beforeinstallprompt` event and invokes `prompt()` when the user taps "Add to Screen".
- **iOS Safari & Mobile Browsers**: Because Safari does not support `beforeinstallprompt`, the banner displays after a gentle 1.5s delay. Tapping "Add to Screen" displays an in-banner visual step-by-step guide:
  - **iOS Safari**: Tap the **Share** button (⎋) &rarr; Tap **"Add to Home Screen"** (➕) &rarr; Tap **"Add"**.
  - **Android**: Tap the **menu (⋮)** &rarr; Tap **"Add to Home screen"** &rarr; Tap **"Add"**.
- Replaced the browser `alert()` modal with a sleek in-card tutorial that can be dismissed with a "Got it!" button.

### 4. Layout Positioning
- Integrated with `useAuth` to dynamically place the banner at `bottom: 76px` when logged in (hovering above the bottom navigation bar) and `bottom: 18px` when logged out.
- Added smooth `@keyframes slideUp` transition in [`index.css`](file:///D:/Projects/FAR%20Project/Viral/client/src/index.css).
