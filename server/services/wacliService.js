const crypto = require('crypto');
const { exec } = require('child_process');
const { PhoneVerification } = require('../models');
const settingService = require('./settingService');

// In-memory fallback cache for verifications
const inMemoryVerifications = new Map();

class WacliService {
  constructor() {
    const bundledWacli = require('path').resolve(__dirname, '../../bin/wacli.exe');
    const defaultBin = require('fs').existsSync(bundledWacli) ? bundledWacli : 'wacli';

    this.defaultSettings = {
      enabled: true,
      whatsapp_number: process.env.WACLI_PHONE || process.env.WHATSAPP_SERVER_NUMBER || '919999999999',
      code_expiry_minutes: 10,
      webhook_secret: process.env.WACLI_WEBHOOK_SECRET || '',
      auto_reply: false,
      auto_reply_message: '✅ Your WhatsApp number has been verified for FAR! You can now finish creating your account.',
      wacli_binary_path: process.env.WACLI_BIN || defaultBin,
    };
  }

  /**
   * Get current WhatsApp verification settings
   */
  async getSettings() {
    try {
      const saved = await settingService.getFromDB('whatsapp_verification');
      if (saved && typeof saved === 'object') {
        return { ...this.defaultSettings, ...saved };
      }
    } catch (err) {
      console.warn('[wacliService] Failed to load settings from DB:', err.message);
    }
    return { ...this.defaultSettings };
  }

  /**
   * Update WhatsApp verification settings
   */
  async updateSettings(newSettings, updatedBy = 'System Admin') {
    const current = await this.getSettings();
    const merged = { ...current, ...newSettings, updated_at: new Date().toISOString() };
    await settingService.saveToDB('whatsapp_verification', merged, updatedBy);
    return merged;
  }

  /**
   * Generate friendly 6-char alphanumeric code (excluding ambiguous chars 0, O, 1, I)
   */
  generateCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  /**
   * Normalize 10-digit mobile number
   */
  normalizeMobile(phone) {
    if (!phone) return '';
    const digitsOnly = String(phone).replace(/[^0-9]/g, '');
    return digitsOnly.slice(-10);
  }

  /**
   * Extract standard phone digits from JID or raw number (e.g. 919876543210@s.whatsapp.net -> 9876543210)
   */
  extractPhoneFromJid(jidOrPhone) {
    if (!jidOrPhone) return '';
    const clean = String(jidOrPhone).split('@')[0].replace(/[^0-9]/g, '');
    return clean.slice(-10);
  }

  /**
   * Initiate phone verification for registration
   */
  async initiateVerification(mobile) {
    const cleanMobile = this.normalizeMobile(mobile);
    if (cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit WhatsApp mobile number.');
    }

    const settings = await this.getSettings();
    const expiryMinutes = Number(settings.code_expiry_minutes) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const code = this.generateCode();

    // Clean server WhatsApp number (e.g. 919876543210)
    let serverNumber = String(settings.whatsapp_number).replace(/[^0-9]/g, '');
    if (serverNumber.length === 10) {
      serverNumber = '91' + serverNumber; // Default to India prefix if 10 digits
    }

    const prefilledText = `VERIFY ${code}`;
    const whatsappUrl = `https://wa.me/${serverNumber}?text=${encodeURIComponent(prefilledText)}`;

    // Expire any existing pending verifications for this mobile
    try {
      await PhoneVerification.update(
        { status: 'expired' },
        { where: { mobile: cleanMobile, status: 'pending' } }
      );

      // Create new pending record
      await PhoneVerification.create({
        mobile: cleanMobile,
        code,
        status: 'pending',
        expires_at: expiresAt,
      });
    } catch (err) {
      console.warn('[wacliService] Database record creation failed, using memory cache:', err.message);
      inMemoryVerifications.set(cleanMobile, {
        mobile: cleanMobile,
        code,
        status: 'pending',
        expires_at: expiresAt,
        created_at: new Date(),
      });
    }

    return {
      mobile: cleanMobile,
      code,
      whatsapp_number: serverNumber,
      whatsapp_url: whatsappUrl,
      prefilled_text: prefilledText,
      expires_at: expiresAt.toISOString(),
      expires_in_seconds: expiryMinutes * 60,
    };
  }

  /**
   * Check status of pending verification
   */
  async checkVerificationStatus(mobile, code) {
    const cleanMobile = this.normalizeMobile(mobile);
    const cleanCode = (code || '').trim().toUpperCase();

    try {
      const record = await PhoneVerification.findOne({
        where: {
          mobile: cleanMobile,
          code: cleanCode,
        },
        order: [['created_at', 'DESC']],
      });

      if (record) {
        const isExpired = new Date(record.expires_at) < new Date();
        const isVerified = record.status === 'verified';
        return {
          mobile: cleanMobile,
          code: cleanCode,
          verified: isVerified,
          status: isExpired && !isVerified ? 'expired' : record.status,
          verified_at: record.verified_at,
          expires_at: record.expires_at,
        };
      }
    } catch (err) {
      console.warn('[wacliService] DB check failed, checking memory:', err.message);
    }

    // Memory fallback check
    const mem = inMemoryVerifications.get(cleanMobile);
    if (mem && mem.code === cleanCode) {
      const isExpired = new Date(mem.expires_at) < new Date();
      const isVerified = mem.status === 'verified';
      return {
        mobile: cleanMobile,
        code: cleanCode,
        verified: isVerified,
        status: isExpired && !isVerified ? 'expired' : mem.status,
        verified_at: mem.verified_at,
        expires_at: mem.expires_at,
      };
    }

    return {
      mobile: cleanMobile,
      code: cleanCode,
      verified: false,
      status: 'not_found',
    };
  }

  /**
   * Process inbound WhatsApp message from wacli
   * Supports:
   * - wacli sync --webhook payloads (JSON)
   * - standard webhook formats
   */
  async processInboundMessage(payload) {
    if (!payload || typeof payload !== 'object') {
      return { success: false, reason: 'Invalid payload format' };
    }

    // wacli ParsedMessage has SenderJID or Chat or from
    const rawSender =
      payload.SenderJID ||
      payload.senderJID ||
      payload.Chat ||
      payload.chat ||
      payload.From ||
      payload.from ||
      '';

    const rawText =
      payload.Text ||
      payload.text ||
      payload.Body ||
      payload.body ||
      payload.message?.conversation ||
      payload.message?.extendedTextMessage?.text ||
      '';

    const senderPhone = this.extractPhoneFromJid(rawSender);
    const text = String(rawText).trim();

    if (!text) {
      return { success: false, reason: 'Empty message text' };
    }

    // Parse code: Look for "VERIFY <CODE>" or standalone 6-char code
    const match = text.match(/\bVERIFY\s+([A-Z0-9]{5,8})\b/i) || text.match(/\b([A-Z0-9]{6})\b/i);
    if (!match) {
      return { success: false, reason: 'No verification code pattern found in message text' };
    }

    const code = match[1].toUpperCase();

    // Query pending verification for this code
    let pendingRecord = null;
    try {
      pendingRecord = await PhoneVerification.findOne({
        where: {
          code,
          status: 'pending',
        },
        order: [['created_at', 'DESC']],
      });
    } catch (err) {
      console.warn('[wacliService] DB query failed in processInboundMessage:', err.message);
    }

    // If not found in DB, check memory
    if (!pendingRecord) {
      for (const [mob, item] of inMemoryVerifications.entries()) {
        if (item.code === code && item.status === 'pending') {
          pendingRecord = item;
          break;
        }
      }
    }

    if (!pendingRecord) {
      return {
        success: false,
        reason: `No pending verification found for code ${code}`,
        sender_phone: senderPhone,
        code,
      };
    }

    // Check expiration
    if (new Date(pendingRecord.expires_at) < new Date()) {
      return {
        success: false,
        reason: 'Verification code has expired',
        sender_phone: senderPhone,
        code,
      };
    }

    // Match sender phone with pending mobile (allowing country code prefixes like +91 / 91)
    const expectedMobile = this.normalizeMobile(pendingRecord.mobile);
    if (senderPhone && senderPhone !== expectedMobile) {
      console.warn(`[wacliService] Sender phone mismatch: received=${senderPhone}, expected=${expectedMobile}`);
      // If code is correct, we still verify if senderPhone matches, or log warning
    }

    // Mark as verified
    const now = new Date();
    try {
      await PhoneVerification.update(
        {
          status: 'verified',
          sender_jid: rawSender,
          sender_phone: senderPhone || expectedMobile,
          verified_at: now,
        },
        {
          where: { id: pendingRecord.id || 0, code },
        }
      );
    } catch (err) {
      console.warn('[wacliService] Failed to update DB status:', err.message);
    }

    // Update in-memory cache as well
    if (inMemoryVerifications.has(expectedMobile)) {
      const item = inMemoryVerifications.get(expectedMobile);
      item.status = 'verified';
      item.verified_at = now;
      item.sender_jid = rawSender;
      item.sender_phone = senderPhone;
    }

    console.log(`[wacliService] ✅ Verified mobile ${expectedMobile} with code ${code} from ${rawSender}`);

    // Optional: send automated confirmation back via wacli if enabled
    this.sendAutoReplyIfEnabled(rawSender, expectedMobile).catch((err) => {
      console.warn('[wacliService] Auto-reply error:', err.message);
    });

    return {
      success: true,
      verified: true,
      mobile: expectedMobile,
      code,
      sender_phone: senderPhone,
      verified_at: now.toISOString(),
    };
  }

  /**
   * Attempt auto-reply via wacli CLI if enabled
   */
  async sendAutoReplyIfEnabled(senderJid, mobile) {
    const settings = await this.getSettings();
    if (!settings.auto_reply) return;

    const bin = settings.wacli_binary_path || 'wacli';
    const message = settings.auto_reply_message || '✅ Your mobile number is verified for FAR!';
    const recipient = senderJid || mobile;

    const command = `"${bin}" send text --to "${recipient}" --message "${message.replace(/"/g, '\\"')}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        // CLI not installed or failed - log info only, non-blocking
        console.info('[wacliService] Note: wacli send skipped or CLI not active:', stderr || err.message);
      } else {
        console.log('[wacliService] wacli confirmation sent:', stdout);
      }
    });
  }

  /**
   * Verify whether a mobile number has a recently verified status (valid for 30 mins)
   */
  async isMobileVerified(mobile) {
    const cleanMobile = this.normalizeMobile(mobile);
    if (!cleanMobile) return false;

    const cutoff = new Date(Date.now() - 30 * 60 * 1000);

    try {
      const record = await PhoneVerification.findOne({
        where: {
          mobile: cleanMobile,
          status: 'verified',
        },
        order: [['verified_at', 'DESC']],
      });

      if (record && record.verified_at && new Date(record.verified_at) >= cutoff) {
        return true;
      }
    } catch (err) {
      console.warn('[wacliService] DB check failed for isMobileVerified:', err.message);
    }

    const mem = inMemoryVerifications.get(cleanMobile);
    if (mem && mem.status === 'verified' && mem.verified_at && new Date(mem.verified_at) >= cutoff) {
      return true;
    }

    return false;
  }

  /**
   * Mark verification as used upon successful registration
   */
  async markVerificationUsed(mobile) {
    const cleanMobile = this.normalizeMobile(mobile);
    try {
      await PhoneVerification.update(
        { status: 'used' },
        { where: { mobile: cleanMobile, status: 'verified' } }
      );
    } catch (err) {
      console.warn('[wacliService] Failed to mark verification as used:', err.message);
    }

    if (inMemoryVerifications.has(cleanMobile)) {
      inMemoryVerifications.delete(cleanMobile);
    }
  }

  /**
   * Manual admin simulation/verification (for testing & development)
   */
  async simulateVerification(mobile, code) {
    const cleanMobile = this.normalizeMobile(mobile);
    const cleanCode = (code || '').trim().toUpperCase();

    return this.processInboundMessage({
      SenderJID: `91${cleanMobile}@s.whatsapp.net`,
      Text: `VERIFY ${cleanCode}`,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new WacliService();
