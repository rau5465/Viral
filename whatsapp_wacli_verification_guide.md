# WhatsApp Mobile Verification with `wacli` Integration Guide

This document outlines the architecture, configuration, and operation of the WhatsApp Mobile Verification system integrated into **Viral Recharge** using `wacli`.

---

## 1. System Overview & User Flow

```
   Website Registration Page
              │
              ▼
   User enters 10-digit mobile number
              │
              ▼
   POST /api/auth/verify/initiate
   • Server generates unique 6-char code (e.g., 7K4P92)
   • Sets expiration (default: 10–15 mins)
   • Stores pending status in MySQL `phone_verifications` table
   • Generates WhatsApp link: https://wa.me/<BOT_NUMBER>?text=VERIFY%207K4P92
              │
              ▼
   User clicks "Verify with WhatsApp 📲"
              │
              ▼
   WhatsApp opens with pre-filled message: "VERIFY 7K4P92"
              │
              ▼
   User sends the message to the Bot number
              │
              ▼
   `wacli` CLI detects inbound message and POSTs to Webhook:
   POST /api/auth/wacli/webhook
   {
     "SenderJID": "919876543210@s.whatsapp.net",
     "Text": "VERIFY 7K4P92"
   }
              │
              ▼
   Backend matches code + sender mobile number:
   • Updates verification record status to `verified`
   • (Optional) Sends automated reply via `wacli send text`
              │
              ▼
   Frontend Polling (every 2.5s) detects `verified: true`
   • Locks mobile input with green badge "✅ WhatsApp Verified"
   • Enables Registration "Create Account & Claim ₹25 Bonus" button
              │
              ▼
   POST /api/auth/register
   • Backend confirms phone is verified before creating user
   • Marks verification status as `used`
   • Automatically logs user in and redirects to Dashboard
```

---

## 2. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/verify/initiate` | Initiates verification, generates code & `wa.me` URL | Public |
| `GET` | `/api/auth/verify/status` | Checks status (`pending`, `verified`, `used`, `expired`) | Public |
| `POST` | `/api/auth/wacli/webhook` | Receives inbound message webhook from `wacli` | Secret / Signature (if configured) |
| `POST` | `/api/auth/verify/simulate` | Admin & Dev test endpoint to simulate incoming message | Public (Dev) / Admin |
| `GET` | `/api/settings/whatsapp-verification` | Fetches active WhatsApp verification settings | Public / Admin |
| `PUT` | `/api/settings/whatsapp-verification` | Updates bot number, enabled toggle, expiry & webhook secret | Admin only |

---

## 3. How to Run `wacli` on the Host Server

### Prerequisites
1. Install `wacli` (or `whatsmeow` CLI).
2. Authenticate `wacli` by scanning the QR code with your designated WhatsApp Bot phone number:
   ```bash
   wacli auth
   ```

### Running the Webhook Sync Daemon
To forward inbound messages from your WhatsApp Bot to the backend server in real-time, execute:

```bash
wacli sync --follow --webhook http://localhost:5000/api/auth/wacli/webhook --webhook-allow-private
```

#### If using a Webhook Secret:
```bash
wacli sync --follow --webhook http://localhost:5000/api/auth/wacli/webhook --webhook-secret YOUR_SECRET_KEY --webhook-allow-private
```

---

## 4. Development & Testing Without a Live WhatsApp CLI

An **Inbound Message Simulator** is built directly into the system:

1. Go to **Registration Page** (`http://localhost:5173/register`).
2. Enter mobile number and click **Verify with WhatsApp**.
3. Note the generated 6-character code (e.g. `9G4TQB`).
4. Go to **Admin Dashboard -> Settings Tab -> WhatsApp Mobile Verification**.
5. In the **Simulate WhatsApp Inbound Message** form, enter the mobile and code, then click **Simulate Message Received**.
6. The registration screen will instantly turn green (`✅ WhatsApp Verified`), unlocking account registration.

Or via terminal:
```bash
node -e "fetch('http://localhost:5000/api/auth/verify/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: '9876543210', code: '9G4TQB' }) }).then(r => r.json()).then(console.log)"
```

---

## 5. Security & Anti-Fraud Protections

1. **One-Time Code**:
   Each code can only be used once. Once the user submits registration, the status becomes `used`.
2. **Sender JID Matching**:
   The phone number sending the `VERIFY <CODE>` message must match the mobile number entered on the registration form.
3. **Short Expiry Window**:
   Codes automatically expire after 10–15 minutes (configurable in Admin Settings).
4. **One Device, One Account Policy**:
   Works synchronously with hardware/browser fingerprinting to guarantee no duplicate signups on the same device.
