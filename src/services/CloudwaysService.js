import axios from 'axios';
import { API_ENDPOINTS } from '../config/constants';

/**
 * Handles all Cloudways API interactions
 */
export class CloudwaysService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Cloudways API key is required');
    }

    this.client = axios.create({
      baseURL: API_ENDPOINTS.CLOUDWAYS.BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Duplicates a WordPress site
   * @param {string} sourceId - Source server ID
   * @param {string} targetName - Target application name
   * @returns {Promise<Object>} Response data
   */
  async duplicateWordPressSite(sourceId, targetName) {
    try {
      const response = await this.client.post(API_ENDPOINTS.CLOUDWAYS.CLONE_APP, {
        server_id: sourceId,
        app_name: targetName
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to duplicate WordPress site: ${error.message}`);
    }
  }

  /**
   * Checks the status of a deployment operation
   * @param {string} deploymentId - Deployment operation ID
   * @returns {Promise<Object>} Operation status
   */
  async checkDeploymentStatus(deploymentId) {
    try {
      const response = await this.client.get(
        `${API_ENDPOINTS.CLOUDWAYS.OPERATION_STATUS}/${deploymentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to check deployment status: ${error.message}`);
    }
  }
}