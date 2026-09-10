const crypto = require('crypto');
require('dotenv').config();

// Standard 256-bit encryption key (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM
const MASTER_KEY_RAW = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'udaan_sih_2026_super_secure_vault_master_key_default';
// Derive consistent 32-byte key from MASTER_KEY_RAW
const KEY = crypto.createHash('sha256').update(MASTER_KEY_RAW).digest();

/**
 * Encrypts sensitive plain text or data URL using AES-256-GCM.
 * Output format: "enc_gcm:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>"
 */
function encryptData(plainText) {
  if (!plainText || typeof plainText !== 'string') return plainText;
  if (plainText.startsWith('enc_gcm:')) return plainText; // already encrypted

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `enc_gcm:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted data.
 */
function decryptData(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') return cipherText;
  if (!cipherText.startsWith('enc_gcm:')) return cipherText; // plain text / not encrypted

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;

    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encryptedData = parts[3];

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Encryption] Failed to decrypt data:', err.message);
    return cipherText;
  }
}

module.exports = {
  encryptData,
  decryptData,
};
