import { API_ENDPOINTS } from '../../config/api';
import { RateLimitManager } from './RateLimitManager';
import { RequestManager } from './RequestManager';

/**
 * Cloudways API client with rate limiting and retries
 */
export class CloudwaysApi {
  constructor(apiKey, email) {
    this.apiKey = apiKey;
    this.email = email;
    this.accessToken = null;
    this.rateLimitManager = new RateLimitManager();
    this.requestManager = new RequestManager(this.rateLimitManager);
  }

  async initialize() {
    const response = await this.requestManager.execute({
      method: 'POST',
      url: `${API_ENDPOINTS.CLOUDWAYS.BASE_URL}${API_ENDPOINTS.CLOUDWAYS.OAUTH_TOKEN}`,
      data: {
        email: this.email,
        api_key: this.apiKey
      }
    });

    this.accessToken = response.data.access_token;
    return this;
  }

  async request(config) {
    if (!this.accessToken) {
      throw new Error('API not initialized');
    }

    return this.requestManager.execute({
      ...config,
      baseURL: API_ENDPOINTS.CLOUDWAYS.BASE_URL,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
  }
}