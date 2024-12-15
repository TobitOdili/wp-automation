/**
 * Utility functions for async operations
 */

/**
 * Sleep for specified milliseconds
 * @param {number} ms Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));