import { CloudwaysApi } from '../api/CloudwaysApi';
import { SSHKeyGenerator } from './SSHKeyGenerator';
import { CLOUDWAYS_CONFIG } from '../../config';

export class SSHSetupService {
  constructor(onLog = () => {}) {
    this.onLog = onLog;
    this.api = new CloudwaysApi(
      CLOUDWAYS_CONFIG.API_KEY,
      CLOUDWAYS_CONFIG.EMAIL
    );
    this.keyGenerator = new SSHKeyGenerator();
  }

  async setup() {
    try {
      // Step 1: Initialize API
      this.onLog('Initializing Cloudways API...');
      await this.api.initialize();

      // Step 2: Generate SSH key pair
      this.onLog('Generating SSH key pair...');
      const keyPair = await this.keyGenerator.generate();

      // Step 3: Add SSH key to server
      this.onLog('Adding SSH key to server...');
      await this._addSSHKey(keyPair.publicKey);

      // Step 4: Get SSH access details
      this.onLog('Getting SSH access details...');
      const access = await this._getSSHAccess();

      return { keyPair, sshAccess: access };
    } catch (error) {
      const message = error.data?.message || error.message;
      throw new Error(`SSH setup failed: ${message}`);
    }
  }

  async _addSSHKey(publicKey) {
    const response = await this.api.request({
      method: 'POST',
      url: '/ssh_key',
      data: {
        server_id: CLOUDWAYS_CONFIG.SOURCE_SERVER_ID,
        ssh_key_name: 'wordpress-automation',
        ssh_key: publicKey
      }
    });

    return response.data;
  }

  async _getSSHAccess() {
    const response = await this.api.request({
      method: 'GET',
      url: `/server/${CLOUDWAYS_CONFIG.SOURCE_SERVER_ID}/access`
    });

    return response.data;
  }
}