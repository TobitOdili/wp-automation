import axios from 'axios';
import { API_ENDPOINTS } from '../config';

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
    this.client = null;
    this.accessToken = null;
  }

  async initialize() {
    try {
      // Get OAuth access token
      const tokenResponse = await axios.post(
        `${API_ENDPOINTS.CLOUDWAYS.BASE_URL}${API_ENDPOINTS.CLOUDWAYS.OAUTH_TOKEN}`, 
        {
          email: this.email,
          api_key: this.apiKey
        }
      );

      if (!tokenResponse.data?.access_token) {
        throw new Error('No access token received');
      }

      this.accessToken = tokenResponse.data.access_token;

      // Create authenticated client
      this.client = axios.create({
        baseURL: API_ENDPOINTS.CLOUDWAYS.BASE_URL,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error_description || 
                      error.response?.data?.message || 
                      error.message;
      throw new Error(`Failed to initialize Cloudways API: ${errorMsg}`);
    }
  }

  async updateSSHKey(serverId, publicKey) {
    if (!this.client) {
      throw new Error('Must call initialize() before making API calls');
    }

    try {
      const response = await this.client.post(API_ENDPOINTS.CLOUDWAYS.SSH_KEY, {
        server_id: serverId,
        public_key: publicKey
      });

      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error_description || 
                      error.response?.data?.message || 
                      error.message;
      throw new Error(`Failed to update SSH key: ${errorMsg}`);
    }
  }

  async getSSHAccess(serverId, appId) {
    if (!this.client) {
      throw new Error('Must call initialize() before making API calls');
    }

    try {
      const response = await this.client.get(
        `${API_ENDPOINTS.CLOUDWAYS.SSH_ACCESS}/${serverId}/${appId}`
      );
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error_description || 
                      error.response?.data?.message || 
                      error.message;
      throw new Error(`Failed to get SSH access details: ${errorMsg}`);
    }
  }
}