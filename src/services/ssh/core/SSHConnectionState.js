/**
 * Manages SSH connection state
 */
export class SSHConnectionState {
  static States = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error'
  };

  constructor() {
    this.state = SSHConnectionState.States.DISCONNECTED;
    this.error = null;
  }

  setState(newState, error = null) {
    this.state = newState;
    this.error = error;
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