import { CloudwaysService } from '../services/CloudwaysService.js';
import { OperationMonitor } from '../utils/operationMonitor.js';
import { CLOUDWAYS_CONFIG } from '../config/constants.js';

async function testCloneApp() {
  try {
    console.log('Starting app clone test...');
    
    // Create Cloudways service instance
    const cloudways = new CloudwaysService(
      CLOUDWAYS_CONFIG.API_KEY,
      CLOUDWAYS_CONFIG.EMAIL
    );

    // Initialize API client first
    console.log('Initializing Cloudways API...');
    await cloudways.initialize();
    
    // Clone the application
    console.log('Starting app clone...');
    console.log(`Using server ID: ${CLOUDWAYS_CONFIG.SOURCE_SERVER_ID}`);
    console.log(`Using app ID: ${CLOUDWAYS_CONFIG.SOURCE_APP_ID}`);
    
    const cloneResponse = await cloudways.cloneApplication({
      serverId: CLOUDWAYS_CONFIG.SOURCE_SERVER_ID,
      appId: CLOUDWAYS_CONFIG.SOURCE_APP_ID,
      newAppName: `Clone Test ${new Date().toISOString().slice(0,10)}`
    });

    console.log('Clone initiated:', cloneResponse);

    if (!cloneResponse?.operation_id) {
      throw new Error('No operation ID received from clone response');
    }

    console.log('Monitoring operation status...');
    
    const monitor = new OperationMonitor(cloudways, cloneResponse.operation_id, {
      onProgress: (status) => {
        const { operation } = status;
        console.log(`Status: ${operation.status} (${operation.estimated_time_remaining}s remaining)`);
      }
    });

    const finalStatus = await monitor.start();
    
    if (finalStatus.operation?.is_completed === "1") {
      console.log('Clone completed successfully!');
      console.log('New app ID:', cloneResponse.app_id);
      console.log('System user:', cloneResponse.sys_user);
    } else {
      console.error('Clone failed:', finalStatus.operation?.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Clone test failed:', error.message);
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testCloneApp();