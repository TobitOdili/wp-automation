/**
 * Rate limiter implementation for API requests
 */
export class RateLimiter {
  constructor(maxRequests = 30, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(time => time > now - this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + this.timeWindow - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot();
    }

    this.requests.push(now);
  }
}