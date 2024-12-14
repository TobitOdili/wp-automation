import axios from 'axios';

/**
 * Creates a configured axios instance for API requests
 */
export function createApiClient(baseURL, headers = {}) {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

/**
 * Handles API errors consistently across the application
 */
export function handleApiError(error, context) {
  const message = error.response?.data?.message || error.message;
  throw new Error(`${context}: ${message}`);
}