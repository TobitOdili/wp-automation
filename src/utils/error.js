/**
 * Error handling utilities
 */

/**
 * Safely extracts error details for logging
 * @param {Error} error - Error object
 * @returns {Object} Safe error details
 */
export function getSafeErrorDetails(error) {
  return {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
    // Omit stack trace and other non-serializable properties
  };
}

/**
 * Formats error for display
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatError(error) {
  if (error.response?.data?.error) {
    return `API Error: ${error.response.data.error}`;
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  return error.message || 'An unknown error occurred';
}