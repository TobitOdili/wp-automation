import { useState, useCallback } from 'react';
import { SSHClient } from '../services/ssh/SSHClient';

export function useSSH() {
  const [client] = useState(() => new SSHClient());
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async (credentials) => {
    setIsProcessing(true);
    setError(null);

    try {
      await client.connect(credentials);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [client]);

  const disconnect = useCallback(() => {
    client.disconnect();
    setIsConnected(false);
    setError(null);
  }, [client]);

  const executeCommand = useCallback(async (command) => {
    if (!isConnected) {
      throw new Error('Not connected to SSH server');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await client.executeCommand(command);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [client, isConnected]);

  return {
    isConnected,
    isProcessing,
    error,
    connect,
    disconnect,
    executeCommand
  };
}