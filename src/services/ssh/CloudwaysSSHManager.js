import { API_ENDPOINTS } from '../../config';
import { formatEndpoint } from '../../utils/api';
import { formatError } from '../../utils/error';

export class CloudwaysSSHManager {
  constructor(cloudwaysService) {
    if (!cloudwaysService) {
      throw new Error('Cloudways service is required');
    }
    this.cloudways = cloudwaysService;
  }

  async getKeys(serverId) {
    try {
      const endpoint = formatEndpoint(API_ENDPOINTS.CLOUDWAYS.SSH_KEYS, {
        server_id: serverId
      });
      
      const response = await this.cloudways.request({
        method: 'GET',
        url: endpoint
      });

      return response.data?.ssh_keys || [];
    } catch (error) {
      throw new Error(`Failed to get SSH keys: ${formatError(error)}`);
    }
  }

  async addKey(serverId, publicKey) {
    try {
      // First try to get existing keys
      const existingKeys = await this.getKeys(serverId);
      const existingKey = existingKeys.find(k => k.name === 'wordpress-automation');
      
      if (existingKey) {
        return this.updateKey(serverId, existingKey.id, publicKey);
      }

      const response = await this.cloudways.request({
        method: 'POST',
        url: API_ENDPOINTS.CLOUDWAYS.SSH_KEY,
        data: {
          server_id: serverId,
          ssh_key_name: 'wordpress-automation',
          ssh_key: publicKey
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to add SSH key: ${formatError(error)}`);
    }
  }

  async updateKey(serverId, keyId, publicKey) {
    try {
      const response = await this.cloudways.request({
        method: 'PUT',
        url: `${API_ENDPOINTS.CLOUDWAYS.SSH_KEY}/${keyId}`,
        data: {
          server_id: serverId,
          ssh_key_name: 'wordpress-automation',
          ssh_key: publicKey
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update SSH key: ${formatError(error)}`);
    }
  }

  async getAccess(serverId, appId) {
    try {
      const endpoint = formatEndpoint(API_ENDPOINTS.CLOUDWAYS.SSH_ACCESS, {
        server_id: serverId,
        app_id: appId
      });

      const response = await this.cloudways.request({
        method: 'GET',
        url: endpoint
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get SSH access: ${formatError(error)}`);
    }
  }
}