/**
 * API endpoints and other constants
 */
export const API_ENDPOINTS = {
  CLOUDWAYS: {
    BASE_URL: 'https://api.cloudways.com/api/v1',
    CLONE_APP: '/clone/app',
    OPERATION_STATUS: '/operation'
  }
};

export const VALIDATION_RULES = {
  BLOG_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50
  },
  COLORS: {
    MIN_COLORS: 1,
    MAX_COLORS: 5
  }
};

export const DEFAULT_SETTINGS = {
  BLOG_TYPE: 'personal',
  MAX_COLOR_SUGGESTIONS: 5,
  LOGO_STYLE: 'wordmark'
};