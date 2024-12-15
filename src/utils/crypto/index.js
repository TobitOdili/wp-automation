/**
 * Crypto utilities with environment-specific implementations
 */
import { isBrowser } from '../environment.js';
import * as browserCrypto from './browser.js';
import * as nodeCrypto from './node.js';

// Select implementation based on environment
const implementation = isBrowser() ? browserCrypto : nodeCrypto;

export const {
  generateRSAKeyPair,
  exportSSHPublicKey,
  exportPrivateKey
} = implementation;