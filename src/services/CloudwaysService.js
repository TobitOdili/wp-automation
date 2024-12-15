import { CloudwaysApiClient } from './api/CloudwaysApiClient';
import { CLOUDWAYS_CONFIG } from '../config';

export class CloudwaysService {
  constructor(apiKey, email) {
    if (!apiKey) {
      throw new Error('Cloudways API key is required');
    }
    if (!email) {
      throw new Error('Cloudways email is required');
    }

    this.apiKey = apiKey;
    this.email = email;
    this.apiClient = new CloudwaysApiClient();
  }

  async initialize() {
    this.client = await this.apiClient.initialize(this.apiKey, this.email);
    return true;
  }

  async request(config) {
    return this.apiClient.request(config);
  }
}