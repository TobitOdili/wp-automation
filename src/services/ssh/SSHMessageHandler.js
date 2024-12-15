/**
 * Handles WebSocket message processing for SSH communication
 */
export class SSHMessageHandler {
  constructor() {
    this.handlers = new Map();
  }

  addHandler(messageId, handler, timeout = 30000) {
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

  removeHandler(messageId) {
    const handler = this.handlers.get(messageId);
    if (handler) {
      clearTimeout(handler.timeoutId);
      this.handlers.delete(messageId);
    }
  }

  handleMessage(message) {
    const handler = this.handlers.get(message.id);
    if (handler) {
      try {
        const result = handler.handler(message);
        if (result?.complete) {
          this.removeHandler(message.id);
          handler.resolve(result.data);
        }
      } catch (error) {
        this.removeHandler(message.id);
        handler.reject(error);
      }
    }
  }

  clear() {
    this.handlers.forEach(handler => {
      clearTimeout(handler.timeoutId);
    });
    this.handlers.clear();
  }
}