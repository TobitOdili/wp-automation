/**
 * API utilities
 */

/**
 * Formats an API endpoint URL by replacing path parameters
 * @param {string} endpoint - Endpoint URL with placeholders
 * @param {Object} params - Parameters to replace in URL
 * @returns {string} Formatted URL
 */
export function formatEndpoint(endpoint, params) {
  let formattedUrl = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    formattedUrl = formattedUrl.replace(`{${key}}`, value);
  });
  return formattedUrl;
}

/**
 * Validates API response
 * @param {Object} response - API response
 * @throws {Error} If response is invalid
 */
export function validateResponse(response) {
  if (!response?.data) {
    throw new Error('Invalid API response: No data received');
  }
  
  if (response.data.error) {
    throw new Error(`API error: ${response.data.error}`);
  }

  return response.data;
}

/**
 * Extracts error details from API error
 * @param {Error} error - Error object
 * @returns {Object} Error details
 */
export function extractErrorDetails(error) {
  return {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  };
}