/**
 * Encryption service using Web Crypto API.
 * AES-256-GCM for encryption, PBKDF2 for key derivation and password hashing.
 * Zero npm dependencies — all browser-native.
 */

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;

/**
 * Generate a random salt (16 bytes) as base64 string.
 */
export function generateSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return uint8ToBase64(salt);
}

/**
 * Derive an AES-256-GCM CryptoKey from password + salt using PBKDF2.
 */
export async function deriveKey(password, saltBase64) {
  const enc = new TextEncoder();
  const salt = base64ToUint8(saltBase64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Hash a password using PBKDF2. Returns { hash: base64, salt: base64 }.
 * Used for password verification (stored unencrypted in profile.json).
 */
export async function hashPassword(password) {
  const salt = generateSalt();
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: base64ToUint8(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_BITS,
  );

  return { hash: uint8ToBase64(new Uint8Array(bits)), salt };
}

/**
 * Verify a password against a stored hash + salt.
 */
export async function verifyPassword(password, storedHash, storedSalt) {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: base64ToUint8(storedSalt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_BITS,
  );

  const computedHash = uint8ToBase64(new Uint8Array(bits));
  return computedHash === storedHash;
}

/**
 * Encrypt plaintext string with password + salt.
 * Returns base64 string of (IV + ciphertext + authTag).
 */
export async function encrypt(plaintext, password, salt) {
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const enc = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext),
  );

  // Combine IV + ciphertext (which includes the auth tag in Web Crypto)
  const combined = new Uint8Array(IV_BYTES + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), IV_BYTES);

  return uint8ToBase64(combined);
}

/**
 * Decrypt a base64 ciphertext string with password + salt.
 * Returns the original plaintext string.
 */
export async function decrypt(ciphertextBase64, password, salt) {
  const key = await deriveKey(password, salt);
  const combined = base64ToUint8(ciphertextBase64);

  const iv = combined.slice(0, IV_BYTES);
  const ciphertext = combined.slice(IV_BYTES);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plainBuffer);
}

// --- Base64 helpers ---

function uint8ToBase64(uint8) {
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8[i] = binary.charCodeAt(i);
  }
  return uint8;
}
