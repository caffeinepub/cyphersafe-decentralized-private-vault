/**
 * Client-side encryption/decryption utilities for secure note sharing
 * Uses Web Crypto API with AES-GCM for authenticated encryption
 */

/**
 * Encrypts note content using AES-GCM
 * @param plaintext - The note content to encrypt
 * @returns Object containing encrypted data, nonce (IV), and base64-encoded key
 */
export async function encryptNote(plaintext: string): Promise<{
  encryptedData: Uint8Array;
  nonce: Uint8Array;
  key: string;
}> {
  // Generate a random encryption key
  const cryptoKey = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // Generate a random nonce (IV)
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  // Encode plaintext to bytes
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    cryptoKey,
    plaintextBytes
  );

  // Export the key to raw format and encode as base64
  const rawKey = await crypto.subtle.exportKey('raw', cryptoKey);
  const keyBase64 = arrayBufferToBase64(rawKey);

  return {
    encryptedData: new Uint8Array(encryptedBuffer),
    nonce,
    key: keyBase64,
  };
}

/**
 * Decrypts note content using AES-GCM
 * @param encryptedData - The encrypted note data
 * @param nonce - The nonce (IV) used during encryption
 * @param keyBase64 - The base64-encoded encryption key
 * @returns The decrypted plaintext
 */
export async function decryptNote(
  encryptedData: Uint8Array,
  nonce: Uint8Array,
  keyBase64: string
): Promise<string> {
  // Decode the base64 key
  const rawKey = base64ToArrayBuffer(keyBase64);

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // not extractable
    ['decrypt']
  );

  // Create new Uint8Array instances to ensure proper ArrayBuffer type
  // This is necessary because data from backend may have ArrayBufferLike
  const nonceBuffer = new Uint8Array(nonce);
  const encryptedBuffer = new Uint8Array(encryptedData);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonceBuffer,
    },
    cryptoKey,
    encryptedBuffer
  );

  // Decode bytes to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a base64 string to an ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
