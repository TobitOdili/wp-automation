/**
 * API configuration
 */
export const API_CONFIG = {
  // Rate limiting settings
  RATE_LIMIT: {
    MAX_REQUESTS: 25, // Slightly lower than server limit for safety
    TIME_WINDOW: 60000, // 1 minute in milliseconds
    BACKOFF_TIME: 5000 // Time to wait when rate limited
  },

  // Request settings
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000 // Base delay between retries
  }
};

export const API_ENDPOINTS = {
  CLOUDWAYS: {
    BASE_URL: 'https://api.cloudways.com/api/v1',
    OAUTH_TOKEN: '/oauth/access_token',
    SSH_KEY: '/ssh_key',
    SSH_KEYS: '/server/{server_id}/ssh_keys', // Fixed endpoint
    SSH_ACCESS: '/server/{server_id}/access'
  }
};