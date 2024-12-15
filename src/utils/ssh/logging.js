/**
 * SSH logging utilities
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class SSHLogger {
  constructor(minLevel = 'INFO') {
    this.minLevel = LOG_LEVELS[minLevel] || LOG_LEVELS.INFO;
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  _formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...data
    };
  }

  debug(message, data) {
    if (this._shouldLog('DEBUG')) {
      console.debug(this._formatMessage('DEBUG', message, data));
    }
  }

  info(message, data) {
    if (this._shouldLog('INFO')) {
      console.info(this._formatMessage('INFO', message, data));
    }
  }

  warn(message, data) {
    if (this._shouldLog('WARN')) {
      console.warn(this._formatMessage('WARN', message, data));
    }
  }

  error(message, error, data = {}) {
    if (this._shouldLog('ERROR')) {
      console.error(this._formatMessage('ERROR', message, {
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack
        },
        ...data
      }));
    }
  }
}

export const logger = new SSHLogger(process.env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO');