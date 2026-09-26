const crypto = require('crypto');
const { Buffer } = require('buffer');
require('dotenv').config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'viral_recharge_oauth_salt_2026';

// Derive 32-byte key from secret
const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'fallback_viral_encryption_key_32b';
const KEY = crypto.scryptSync(secret, SALT, 32);

/**
 * Encrypt a plaintext token (access_token or refresh_token)
 * @param {string} text Plaintext string
 * @returns {string|null} Encrypted string in format iv:authTag:ciphertext
 */
const encryptToken = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt an encrypted token
 * @param {string} encryptedText Encrypted string in format iv:authTag:ciphertext
 * @returns {string|null} Decrypted plaintext string
 */
const decryptToken = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // In case unencrypted token was stored, fallback to return it
      return encryptedText;
    }
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt OAuth token:', err.message);
    return null;
  }
};

module.exports = {
  encryptToken,
  decryptToken,
};
