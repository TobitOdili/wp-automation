import axios from 'axios';
import { RateLimiter } from '../../utils/api/RateLimiter';
import { RetryHandler } from '../../utils/api/RetryHandler';
import { API_ENDPOINTS, CLOUDWAYS_CONFIG } from '../../config';
import { formatError } from '../../utils/error';

export class CloudwaysApiClient {
  constructor() {
    this.rateLimiter = new RateLimiter();
    this.retryHandler = new RetryHandler();
    this.client = null;
  }

  async initialize(apiKey, email) {
    try {
      // Get OAuth access token
      const tokenResponse = await this.retryHandler.execute(
        async () => {
          await this.rateLimiter.waitForSlot();
          return axios.post(
            `${API_ENDPOINTS.CLOUDWAYS.BASE_URL}${API_ENDPOINTS.CLOUDWAYS.OAUTH_TOKEN}`,
            { email, api_key: apiKey },
            { timeout: CLOUDWAYS_CONFIG.REQUEST_TIMEOUT }
          );
        }
      );

      if (!tokenResponse?.data?.access_token) {
        throw new Error('No access token received');
      }

      // Create authenticated client
      this.client = axios.create({
        baseURL: API_ENDPOINTS.CLOUDWAYS.BASE_URL,
        timeout: CLOUDWAYS_CONFIG.REQUEST_TIMEOUT,
        headers: {
          'Authorization': `Bearer ${tokenResponse.data.access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Add request interceptor for rate limiting
      this.client.interceptors.request.use(async config => {
        await this.rateLimiter.waitForSlot();
        return config;
      });

      return this.client;
    } catch (error) {
      throw new Error(`API initialization failed: ${formatError(error)}`);
    }
  }

  async request(config) {
    if (!this.client) {
      throw new Error('API client not initialized');
    }

    return this.retryHandler.execute(
      async () => this.client.request(config),
      {
        onRetry: ({ error, attempt, delay }) => {
          console.warn(
            `Request failed (attempt ${attempt}):`, 
            formatError(error),
            `Retrying in ${delay}ms...`
          );
        }
      }
    );
  }
}