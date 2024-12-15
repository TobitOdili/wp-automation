/**
 * SSH configuration constants
 */
export const SSHConfig = {
  connection: {
    timeout: 30000,
    keepaliveInterval: 10000
  },
  
  websocket: {
    path: '/ssh-proxy',
    pingInterval: 30000,
    pongTimeout: 5000
  },
  
  auth: {
    timeout: 30000
  }
};