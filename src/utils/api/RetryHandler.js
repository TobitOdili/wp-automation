import { sleep } from '../async';

export class RetryHandler {
  constructor(maxAttempts = 3, baseDelay = 2000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
  }

  async execute(operation, { onRetry = () => {} } = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // Last attempt
        if (attempt === this.maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);
        
        onRetry({
          error,
          attempt,
          delay,
          remainingAttempts: this.maxAttempts - attempt
        });

        await sleep(delay);
      }
    }

    throw lastError;
  }

  shouldNotRetry(error) {
    // Don't retry on validation errors or unauthorized
    return error.response?.status === 400 || 
           error.response?.status === 401 ||
           error.response?.status === 403;
  }

  calculateDelay(attempt) {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    return exponentialDelay + jitter;
  }
}