import { logger } from '../../utils/ssh/logging.js';

export class SSHMessageHandler {
  constructor() {
    this.handlers = new Map();
  }

  addHandler(messageId, handler, timeout = 30000) {
    logger.debug(`Adding message handler for ID: ${messageId}`);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeHandler(messageId);
        reject(new Error('Operation timed out'));
      }, timeout);

      this.handlers.set(messageId, {
        handler,
        timeoutId,
        resolve,
        reject
      });
    });
  }

  handleMessage(message) {
    const handler = this.handlers.get(message.id);
    if (!handler) {
      logger.debug(`No handler found for message ID: ${message.id}`);
      return;
    }

    try {
      const result = handler.handler(message);
      if (result?.complete) {
        this.removeHandler(message.id);
        handler.resolve(result.data);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      this.removeHandler(message.id);
      handler.reject(error);
    }
  }

  removeHandler(messageId) {
    const handler = this.handlers.get(messageId);
    if (handler) {
      clearTimeout(handler.timeoutId);
      this.handlers.delete(messageId);
      logger.debug(`Removed handler for ID: ${messageId}`);
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