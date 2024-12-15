export const SSH_CONFIG = {
  CONNECTION: {
    PORT: 22,
    TIMEOUT: 60000, // 60 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
    KEEPALIVE_INTERVAL: 10000,
    KEEPALIVE_COUNT_MAX: 3
  },

  ALGORITHMS: {
    KEX: [
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521',
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha1'
    ],
    CIPHER: [
      'aes128-ctr',
      'aes192-ctr',
      'aes256-ctr',
      'aes128-gcm',
      'aes256-gcm'
    ]
  },

  WEBSOCKET: {
    PING_INTERVAL: 30000,
    PONG_TIMEOUT: 5000,
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 2000
  }
};