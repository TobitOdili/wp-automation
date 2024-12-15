/**
 * Handles SSH key generation using Web Crypto API
 */
import { generateRSAKeyPair, exportSSHPublicKey, exportPrivateKey } from '../../utils/crypto';

export class SSHKeyGenerator {
  async generate() {
    try {
      const cryptoKeyPair = await generateRSAKeyPair();
      const publicKey = await exportSSHPublicKey(cryptoKeyPair.publicKey);
      const privateKey = await exportPrivateKey(cryptoKeyPair.privateKey);

      return { publicKey, privateKey };
    } catch (error) {
      throw new Error(`Failed to generate SSH key pair: ${error.message}`);
    }
  }
}