import { config } from 'dotenv';
import { BlogConfigurationService } from './services/BlogConfigurationService.js';
import { CloudwaysService } from './services/CloudwaysService.js';
import { ElementorService } from './services/ElementorService.js';
import { OpenAIService } from './services/OpenAIService.js';

// Load environment variables
config();

async function main() {
  try {
    const blogConfig = new BlogConfigurationService();
    const cloudways = new CloudwaysService(process.env.CLOUDWAYS_API_KEY);
    const elementor = new ElementorService();
    const openai = new OpenAIService(process.env.OPENAI_API_KEY);

    console.log('WordPress Deployment Automation Started');
    // Main application logic will be implemented here
  } catch (error) {
    console.error('Error in main application:', error.message);
    process.exit(1);
  }
}

main();