import { logger } from '../../../utils/ssh/logging';
import { SSHEventEmitter } from './SSHEventEmitter';
import { SSHConnectionEvents } from './SSHConnectionEvents';

export class SSHMessageHandler extends SSHEventEmitter {
  constructor() {
    super();
    this.handlers = new Map();
  }

  handleMessage(message) {
    logger.debug('Handling message:', message.type);
    
    const handler = this.handlers.get(message.id);
    if (!handler) {
      logger.debug('No handler found for message:', message.id);
      return;
    }

    try {
      const result = handler.callback(message);
      
      if (result?.complete) {
        this.removeHandler(message.id);
        handler.resolve(result.data);
      }
      
      this.emit(SSHConnectionEvents.DATA, message);
    } catch (error) {
      logger.error('Error handling message:', error);
      this.removeHandler(message.id);
      handler.reject(error);
    }
  }

  addHandler(messageId, callback, timeout = 30000) {
    logger.debug('Adding message handler:', messageId);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeHandler(messageId);
        reject(new Error('Operation timeout'));
      }, timeout);

      this.handlers.set(messageId, {
        callback,
        resolve,
        reject,
        timeoutId
      });
    });
  }

  removeHandler(messageId) {
    const handler = this.handlers.get(messageId);
    if (handler) {
      clearTimeout(handler.timeoutId);
      this.handlers.delete(messageId);
      logger.debug('Removed message handler:', messageId);
    }
  }

  clear() {
    this.handlers.forEach(handler => {
      clearTimeout(handler.timeoutId);
    });
    this.handlers.clear();
    logger.debug('Cleared all message handlers');
  }
}