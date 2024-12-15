import { logger } from '../../../utils/ssh/logging.js';
import { SSHConnectionState } from './SSHConnectionState.js';

export class SSHConnectionLogger {
  constructor(connectionState) {
    this.setupStateLogging(connectionState);
  }

  setupStateLogging(connectionState) {
    connectionState.addListener(({ oldState, newState, error }) => {
      const States = SSHConnectionState.States;

      switch (newState) {
        case States.CONNECTING:
          logger.info('Initiating SSH connection...');
          break;

        case States.AUTHENTICATING:
          logger.info('Starting SSH authentication...');
          break;

        case States.AUTHENTICATED:
          logger.info('SSH authentication successful');
          break;

        case States.READY:
          logger.info('SSH connection ready');
          break;

        case States.ERROR:
          logger.error('SSH connection error:', error?.message || 'Unknown error');
          if (error?.stack) {
            logger.debug('Error stack:', error.stack);
          }
          break;

        case States.DISCONNECTED:
          if (oldState !== States.DISCONNECTED) {
            logger.info('SSH connection closed');
          }
          break;
      }
    });
  }
}