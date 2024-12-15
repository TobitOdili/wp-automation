import { logger } from './logging.js';

export function validateCredentials(credentials) {
  logger.debug('Validating SSH credentials');
  
  const { host, username, password } = credentials;

  if (!host || !username || !password) {
    throw new Error('Missing required SSH credentials');
  }

  if (!isValidHost(host)) {
    throw new Error('Invalid host address');
  }

  return true;
}

function isValidHost(host) {
  // IP address validation
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Hostname validation
  const hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
  
  return ipRegex.test(host) || hostnameRegex.test(host);
}