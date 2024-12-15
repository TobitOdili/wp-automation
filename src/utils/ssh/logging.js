/**
 * SSH logging utilities with browser support
 */
export const logger = {
  debug: (...args) => {
    console.debug('[SSH]', ...args);
  },
  
  info: (...args) => {
    console.info('[SSH]', ...args);
  },
  
  warn: (...args) => {
    console.warn('[SSH]', ...args);
  },
  
  error: (message, error = null) => {
    const errorDetails = error ? {
      message: error.message,
      code: error.code,
      stack: error.stack
    } : null;

    console.error('[SSH]', message, errorDetails);
  }
};