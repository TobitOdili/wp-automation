/**
 * Manages SSH connection state transitions
 */
export class SSHConnectionState {
  static States = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    AUTHENTICATING: 'authenticating',
    AUTHENTICATED: 'authenticated',
    READY: 'ready',
    ERROR: 'error'
  };

  constructor() {
    this.state = SSHConnectionState.States.DISCONNECTED;
    this.error = null;
    this.listeners = new Set();
  }

  setState(newState, error = null) {
    const oldState = this.state;
    this.state = newState;
    this.error = error;
    
    this.notifyListeners({
      oldState,
      newState,
      error
    });
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners(stateChange) {
    this.listeners.forEach(listener => {
      try {
        listener(stateChange);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  getState() {
    return {
      state: this.state,
      error: this.error
    };
  }
}