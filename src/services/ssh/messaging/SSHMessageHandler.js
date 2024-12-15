import { logger } from '../../../utils/ssh/logging.js';
import { MessageHandlerStore } from './MessageHandlerStore.js';

export class SSHMessageHandler {
  constructor() {
    this.store = new MessageHandlerStore();
  }

  addHandler(messageId, handler, timeout = 30000) {
    logger.debug(`Adding message handler for ID: ${messageId}`);
    return this.store.add(messageId, handler, timeout);
  }

  handleMessage(message) {
    const handler = this.store.get(message.id);
    if (!handler) {
      logger.debug(`No handler found for message ID: ${message.id}`);
      return;
    }

    try {
      const result = handler.handler(message);
      if (result?.complete) {
        this.store.remove(message.id);
        handler.resolve(result.data);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      this.store.remove(message.id);
      handler.reject(error);
    }
  }

  removeHandler(messageId) {
    this.store.remove(messageId);
  }

  clear() {
    this.store.clear();
  }
}