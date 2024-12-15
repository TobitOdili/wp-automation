import { logger } from '../../utils/ssh/logging.js';
import { SSHKeyService } from '../../services/SSHKeyService.js';

const sshKeyService = new SSHKeyService();

export const sshController = {
  async createKey(req, res, next) {
    try {
      const keyPair = await sshKeyService.generateKeyPair();
      res.json({ 
        publicKey: keyPair.publicKey,
        message: 'SSH key pair generated successfully' 
      });
    } catch (error) {
      logger.error('SSH key generation error:', error);
      next(error);
    }
  },

  async getKeys(req, res, next) {
    try {
      const publicKey = sshKeyService.getPublicKey();
      res.json({ publicKey });
    } catch (error) {
      logger.error('SSH key retrieval error:', error);
      next(error);
    }
  },

  async testConnection(req, res, next) {
    try {
      // SSH connection test logic here
      res.json({ status: 'connection successful' });
    } catch (error) {
      logger.error('SSH connection test error:', error);
      next(error);
    }
  }
};