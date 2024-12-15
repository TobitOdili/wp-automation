import { logger } from '../../../utils/ssh/logging.js';

export class MessageHandlerStore {
  constructor() {
    this.handlers = new Map();
  }

  add(messageId, handler, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.remove(messageId);
        reject(new Error('Operation timed out'));
      }, timeout);

      this.handlers.set(messageId, {
        handler,
        timeoutId,
        resolve,
        reject
      });

      logger.debug(`Added handler for message ID: ${messageId}`);
    });
  }

  get(messageId) {
    return this.handlers.get(messageId);
  }

  remove(messageId) {
    const handler = this.handlers.get(messageId);
    if (handler) {
      clearTimeout(handler.timeoutId);
      this.handlers.delete(messageId);
      logger.debug(`Removed handler for message ID: ${messageId}`);
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