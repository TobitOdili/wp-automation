import { generateRSAKeyPair, exportSSHPublicKey, exportPrivateKey } from '../utils/crypto/index.js';
import { logger } from '../utils/ssh/logging.js';

export class SSHKeyService {
  constructor() {
    this.keyPair = null;
  }

  async generateKeyPair() {
    try {
      logger.info('Generating new SSH key pair...');
      
      // Generate RSA key pair
      const cryptoKeyPair = await generateRSAKeyPair();
      
      // Export keys in the required formats
      const publicKey = await exportSSHPublicKey(cryptoKeyPair.publicKey);
      const privateKey = await exportPrivateKey(cryptoKeyPair.privateKey);

      this.keyPair = { publicKey, privateKey };
      logger.info('SSH key pair generated successfully');
      
      return this.keyPair;
    } catch (error) {
      logger.error('Failed to generate SSH key pair:', error);
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