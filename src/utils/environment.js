/**
 * Environment detection and configuration utilities
 */

export function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

export function isNode() {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

export function getEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test'
  };
}