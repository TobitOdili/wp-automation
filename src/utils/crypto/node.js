/**
 * Node.js-specific crypto implementations using node:crypto
 */
import { generateKeyPairSync } from 'node:crypto';

export function generateRSAKeyPair() {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

export function exportSSHPublicKey(publicKey) {
  return `ssh-rsa ${publicKey}`;
}

export function exportPrivateKey(privateKey) {
  return privateKey;
}