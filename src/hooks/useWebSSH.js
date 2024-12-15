import { useState, useCallback } from 'react';
import { WebSSHClient } from '../services/ssh/WebSSHClient';

export function useWebSSH() {
  const [client] = useState(() => new WebSSHClient());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const disconnect = useCallback(async () => {
    if (isConnected) {
      await client.disconnect();
      setIsConnected(false);
    }
  }, [client, isConnected]);

  const executeCommand = useCallback(async (command) => {
    if (!isConnected) {
      throw new Error('Not connected to SSH server');
    }

    setIsProcessing(true);
    setError(null);

    try {
      return await client.executeCommand(command);
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