import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getEnvironment } from '../../utils/environment.js';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../../..');
const DIST_DIR = join(ROOT_DIR, 'dist');

// Get environment config
const env = getEnvironment();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: env.isDevelopment,
  isProduction: env.isProduction,
  paths: {
    root: ROOT_DIR,
    dist: DIST_DIR
  },
  ssh: {
    timeout: 30000,
    keepaliveInterval: 10000,
    retryAttempts: 3
  }
};