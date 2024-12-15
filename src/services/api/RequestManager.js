import axios from 'axios';
import { API_CONFIG } from '../../config/api';

/**
 * Manages API requests with retries and error handling
 */
export class RequestManager {
  constructor(rateLimitManager) {
    this.rateLimitManager = rateLimitManager;
    this.config = API_CONFIG.REQUEST;
  }

  async execute(config, retryCount = 0) {
    try {
      // Wait for rate limit token
      await this.rateLimitManager.acquireToken();

      // Make request
      const response = await axios({
        ...config,
        timeout: this.config.TIMEOUT
      });

      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        await this.rateLimitManager.handleRateLimit();
        return this.execute(config, retryCount);
      }

      if (this._shouldRetry(error, retryCount)) {
        const delay = this._getRetryDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.execute(config, retryCount + 1);
      }

      throw this._enhanceError(error);
    }
  }

  _shouldRetry(error, retryCount) {
    if (retryCount >= this.config.MAX_RETRIES) return false;
    
    // Retry on network errors and 5xx responses
    return !error.response || error.response.status >= 500;
  }

  _getRetryDelay(retryCount) {
    return this.config.RETRY_DELAY * Math.pow(2, retryCount);
  }

  _enhanceError(error) {
    const enhancedError = new Error(
      error.response?.data?.message || error.message
    );
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    return enhancedError;
  }
}