export const API_ENDPOINTS = {
  CLOUDWAYS: {
    BASE_URL: 'https://api.cloudways.com/api/v1',
    OAUTH_TOKEN: '/oauth/access_token',
    CLONE_APP: '/app/clone',
    CLONE_TO_SERVER: '/app/cloneToOtherServer',
    OPERATION_STATUS: '/operation',
    SSH_KEY: '/server/ssh_key',
    SSH_ACCESS: '/server/access'
  }
};

export const CLOUDWAYS_CONFIG = {
  API_KEY: process.env.CLOUDWAYS_API_KEY || 'NIf9IVWsTJ21DBlNCI3C9EShBSHYSg',
  EMAIL: process.env.CLOUDWAYS_EMAIL || 'admin@whitelabelresell.com',
  SOURCE_SERVER_ID: process.env.SOURCE_SERVER_ID || '1380855',
  SOURCE_APP_ID: process.env.SOURCE_APP_ID || '5108215'
};