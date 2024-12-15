/**
 * SSH message type constants
 */
export const SSHMessageTypes = {
  // Authentication messages
  AUTH_REQUEST: 'auth',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  
  // Command messages
  COMMAND: 'command',
  OUTPUT: 'output',
  ERROR: 'error',
  EXIT: 'exit',
  
  // Control messages
  PING: 'ping',
  PONG: 'pong'
};