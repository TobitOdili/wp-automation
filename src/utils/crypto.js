/**
 * Utility functions for cryptographic operations using Web Crypto API
 */

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Generates an RSA key pair using Web Crypto API
 * @returns {Promise<CryptoKeyPair>}
 */
export async function generateRSAKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['sign', 'verify']
  );

  return keyPair;
}

/**
 * Exports public key in SSH format
 * @param {CryptoKey} publicKey
 * @returns {Promise<string>}
 */
export async function exportSSHPublicKey(publicKey) {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  const b64 = arrayBufferToBase64(exported);
  return `ssh-rsa ${b64} cloudways@wordpress-automation`;
}

/**
 * Exports private key in PEM format
 * @param {CryptoKey} privateKey
 * @returns {Promise<string>}
 */
export async function exportPrivateKey(privateKey) {
  const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
  const b64 = arrayBufferToBase64(exported);
  return `-----BEGIN PRIVATE KEY-----\n${b64}\n-----END PRIVATE KEY-----`;
}