/**
 * Cloudways configuration using Vite environment variables
 */
export const CLOUDWAYS_CONFIG = {
  // Use import.meta.env for Vite environment variables
  API_KEY: import.meta.env.VITE_CLOUDWAYS_API_KEY || 'NIf9IVWsTJ21DBlNCI3C9EShBSHYSg',
  EMAIL: import.meta.env.VITE_CLOUDWAYS_EMAIL || 'admin@whitelabelresell.com',
  SOURCE_SERVER_ID: import.meta.env.VITE_SOURCE_SERVER_ID || '1380855',
  SOURCE_APP_ID: import.meta.env.VITE_SOURCE_APP_ID || '5108215',
  // API request configuration
  REQUEST_TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000 // 2 seconds
};