/**
 * Simple Encryption Utility
 * 
 * Encrypts/decrypts user API keys before storing them.
 * Uses a simple XOR cipher with a secret key (in production, use proper encryption).
 * 
 * For production, consider using:
 * - crypto.createCipheriv with AES-256-GCM
 * - Or a service like AWS KMS, HashiCorp Vault
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-encryption-key-change-in-production";

// Simple XOR encryption (for development)
// In production, use proper encryption like AES-256
function encrypt(text) {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return Buffer.from(result).toString('base64');
}

function decrypt(encrypted) {
  if (!encrypted) return "";
  try {
    const text = Buffer.from(encrypted, 'base64').toString();
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
  } catch (error) {
    return "";
  }
}

export { encrypt, decrypt };

