import { SSHMessageTypes } from './SSHMessageTypes.js';

/**
 * Validates SSH protocol messages
 */
export class SSHMessageValidator {
  static isValidMessage(message) {
    return message && 
           typeof message === 'object' &&
           typeof message.type === 'string' &&
           Object.values(SSHMessageTypes).includes(message.type);
  }

  static isAuthSuccess(message) {
    return message?.type === SSHMessageTypes.AUTH_SUCCESS;
  }

  static isAuthFailure(message) {
    return message?.type === SSHMessageTypes.AUTH_FAILURE;
  }

  static isError(message) {
    return message?.type === SSHMessageTypes.ERROR;
  }

  static isOutput(message) {
    return message?.type === SSHMessageTypes.OUTPUT;
  }

  static isExit(message) {
    return message?.type === SSHMessageTypes.EXIT;
  }

  static isPong(message) {
    return message?.type === SSHMessageTypes.PONG;
  }
}