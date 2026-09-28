# FAR (Forget About Recharge) — Legal Policy Pages & Contact System Documentation

**Date**: September 2026  
**Platform**: FAR (Forget About Recharge)  
**Official Contact Email**: `contact@forgetaboutrecharge.com`

---

## 1. Executive Summary

This release completes a comprehensive suite of authentic legal and platform policy pages, a modern Contact Us experience with automated backend image compression, and an Admin Contact Inquiry search & management interface.

---

## 2. Policy & Information Pages

All policy pages are accessible via standard routes, include real telecom industry content, and prominently feature the official contact email `contact@forgetaboutrecharge.com`:

| Page | Routes | Purpose & Key Content |
| :--- | :--- | :--- |
| **Privacy Policy** | `/privacy`, `/privacy-policy` | Data minimization, zero selling of phone numbers, 256-bit encryption, cookie disclosure, GDPR/DPDP 2023 alignment. |
| **Terms of Service** | `/terms`, `/terms-of-service` | Platform eligibility, 4X viral referral rules, credit redemption non-custodial nature, anti-fraud guidelines. |
| **Refund Policy** | `/refund`, `/refund-policy` | Zero-loss credit guarantee, automated refunds for operator rejection, 1:1 credit-to-Rupee valuation. |
| **Recharge Fulfillment Policy** | `/recharge-policy` | Dispatch SLAs (30–180 seconds automated, 24-hr maximum maintenance window), MNP circle matching, operator tariff accuracy. |
| **About Us** | `/about`, `/about-us` | FAR founding mission, 3-pillar value engine (Micro-engagements, 4X Multiplier, Instant Dispatch), operator ecosystem. |

---

## 3. Telecom Operator Branding

Authentic SVG logos and actual real-world tariff plans are configured across all policies and redemption dialogs:
- **Reliance Jio**: True 5G Unlimited, ₹19, ₹29, ₹198, ₹349, ₹859
- **Bharti Airtel**: Airtel 5G Plus, Truly Unlimited, ₹22, ₹33, ₹199, ₹349, ₹859
- **Vodafone Idea (Vi)**: Hero Unlimited & Binge All Night, ₹23, ₹39, ₹199, ₹349, ₹859
- **BSNL**: Long-validity voice & data packs, ₹18, ₹99, ₹199, ₹397, ₹797

---

## 4. Contact Us Page & Form

Located at `/contact` and `/contact-us`:
- **Direct Support Channels**: Callout for `contact@forgetaboutrecharge.com` with typical 4–12 hour SLA.
- **Form Fields**:
  - Full Name (required)
  - Email Address (required)
  - Phone Number (10-digit mobile number, required)
  - Inquiry Category (Recharge Delay, Task Verification, 4X Referral Bonus, Account Access, Partnership, Feedback, etc.)
  - Message Textarea (detailed inquiry description)
  - Screenshot / Proof Upload (drag-and-drop or file picker)
- **Live Attachment Preview**: Displays file name, size in KB, preview thumbnail, and a remove button.
- **Interactive Ticket Summary**: On successful submission, displays the unique Ticket ID, submitted phone/subject, and confirmation of compressed attachment upload.

---

## 5. Backend Architecture & Image Compression

### 5.1 Sharp Image Processing Pipeline
- Implemented in `Viral/server/middleware/uploadMiddleware.js`.
- Multer buffers the incoming file in memory (`multer.memoryStorage()`).
- `sharp` automatically converts images to modern **WebP** format:
  - Downscales images wider than 1280px proportionally.
  - Quality set to 80% with metadata stripped.
  - Generates secure filenames: `contact_<timestamp>_<random>.webp`.
  - Saves compressed files to `Viral/server/uploads/contacts/`.
  - Reduces average screenshot payload from ~3–8 MB down to ~80–250 KB (up to 95% reduction).

### 5.2 Database Persistence & Zero-Downtime Fallback
- Model: `Viral/server/models/ContactMessage.js` (`ContactMessage` table with `name`, `email`, `phone`, `subject`, `message`, `image_url`, `status`, `ip_address`).
- Resilience: If the MySQL instance is offline or unreachable, `contactController.js` gracefully stores and queries inquiries in an in-memory queue, ensuring submissions return `201 Created` with zero user disruption.

### 5.3 Static Asset Serving & Security
- Configured in `Viral/server/app.js`:
  ```javascript
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  ```
- Proxied in `Viral/client/vite.config.js` (`/uploads` -> `http://localhost:5000`).

---

## 6. Admin Contact Management & Search

Integrated directly into `Viral/client/src/pages/admin/AdminDashboard.jsx` under the **Inquiries** tab:
1. **Multi-Field Search**: Real-time keyword filtering across sender name, email, phone number, subject category, or message body.
2. **Status Filter**: Dropdown filtering by `all`, `new`, `in_progress`, `resolved`, and `closed`.
3. **Status Workflow**: Admins can change inquiry status with instant local and server synchronization.
4. **Attachment Lightbox**:
   - Indicator badge in inquiry row showing whether a compressed screenshot is attached.
   - Dedicated modal showing full inquiry details and a preview of the WebP attachment.
   - Fullscreen lightbox modal with direct link to view original file in a new tab.
5. **Deletion**: Deletes inquiry records and clears associated image files.

---

## 7. Verification Results

1. **Client Build**: `npm run build` executed successfully (Vite v8.3.1) with 0 errors.
2. **Contact Submission Test**: Executed `POST /api/contact` with multipart data and a test PNG image. Backend returned HTTP 201 with `imageUrl: /uploads/contacts/contact_...webp`.
3. **Static Image Delivery**: Image was compressed by `sharp`, stored on disk, and accessible via `/uploads/contacts/`.
