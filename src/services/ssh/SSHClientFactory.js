import { logger } from '../../utils/ssh/logging';
import { NativeSSHClient } from './browser/NativeSSHClient';
import { WebSocketSSHClient } from './browser/WebSocketSSHClient';

export class SSHClientFactory {
  static async createClient() {
    logger.info('Creating SSH client...');
    
    // Try native SSH first
    try {
      const nativeClient = new NativeSSHClient();
      logger.info('Using native SSH implementation');
      return nativeClient;
    } catch (error) {
      // Fall back to WebSocket implementation
      logger.info('Falling back to WebSocket SSH implementation');
      return new WebSocketSSHClient();
    }
  }
}