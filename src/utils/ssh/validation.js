/**
 * SSH validation utilities
 */

// IP address validation
export function isValidIpAddress(ip) {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

// Hostname validation
export function isValidHostname(hostname) {
  const hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
  return hostnameRegex.test(hostname);
}

// Credential validation
export function validateCredentials(credentials) {
  const { host, username, password } = credentials;

  if (!host || !username || !password) {
    throw new Error('Missing required SSH credentials');
  }

  if (!isValidIpAddress(host) && !isValidHostname(host)) {
    throw new Error('Invalid host address');
  }

  return true;
}