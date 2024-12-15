import { API_CONFIG } from '../../config/api';

/**
 * Manages API rate limiting
 */
export class RateLimitManager {
  constructor() {
    this.requests = [];
    this.config = API_CONFIG.RATE_LIMIT;
  }

  async acquireToken() {
    const now = Date.now();
    
    // Clean up old requests
    this.requests = this.requests.filter(
      time => time > now - this.config.TIME_WINDOW
    );

    if (this.requests.length >= this.config.MAX_REQUESTS) {
      const waitTime = this._calculateWaitTime(now);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquireToken(); // Recursively try again
    }

    this.requests.push(now);
  }

  _calculateWaitTime(now) {
    const oldestRequest = this.requests[0];
    const baseWaitTime = oldestRequest + this.config.TIME_WINDOW - now;
    const jitter = Math.random() * 1000; // Add random jitter
    return baseWaitTime + this.config.BACKOFF_TIME + jitter;
  }

  handleRateLimit() {
    return new Promise(resolve => {
      setTimeout(resolve, this.config.BACKOFF_TIME);
    });
  }
}