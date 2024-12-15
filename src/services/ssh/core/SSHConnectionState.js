import { SSHConnectionEvents } from './SSHConnectionEvents';
import { SSHEventEmitter } from './SSHEventEmitter';
import { logger } from '../../../utils/ssh/logging';

export class SSHConnectionState extends SSHEventEmitter {
  static States = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error'
  };

  constructor() {
    super();
    this.state = SSHConnectionState.States.DISCONNECTED;
    this.error = null;
  }

  setState(newState, error = null) {
    const oldState = this.state;
    this.state = newState;
    this.error = error;

    logger.debug(`Connection state changed: ${oldState} -> ${newState}`);
    
    this.emit(SSHConnectionEvents.STATE_CHANGE, {
      oldState,
      newState,
      error
    });
  }

  getState() {
    return this.state;
  }

  getError() {
    return this.error;
  }

  isConnected() {
    return this.state === SSHConnectionState.States.CONNECTED;
  }
}