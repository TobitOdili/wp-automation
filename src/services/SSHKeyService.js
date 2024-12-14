import { generateRSAKeyPair, exportSSHPublicKey, exportPrivateKey } from '../utils/crypto';

export class SSHKeyService {
  constructor() {
    this.keyPair = null;
  }

  async generateKeyPair() {
    try {
      // Generate RSA key pair using Web Crypto API
      const cryptoKeyPair = await generateRSAKeyPair();
      
      // Export keys in the required formats
      const publicKey = await exportSSHPublicKey(cryptoKeyPair.publicKey);
      const privateKey = await exportPrivateKey(cryptoKeyPair.privateKey);

      this.keyPair = { publicKey, privateKey };
      return this.keyPair;
    } catch (error) {
      throw new Error(`Failed to generate SSH key pair: ${error.message}`);
    }
  }

  getPublicKey() {
    if (!this.keyPair) {
      throw new Error('No SSH key pair has been generated');
    }
    return this.keyPair.publicKey;
  }

  getPrivateKey() {
    if (!this.keyPair) {
      throw new Error('No SSH key pair has been generated');
    }
    return this.keyPair.privateKey;
  }
}