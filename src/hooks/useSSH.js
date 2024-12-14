import { useState, useCallback } from 'react';
import { SSHService } from '../services/SSHService';
import { WPCLIService } from '../services/WPCLIService';

export function useSSH() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const ssh = new SSHService();
  const wpCli = new WPCLIService(ssh);

  const connect = useCallback(async (config) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      await ssh.connect(config);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (isConnected) {
      await ssh.disconnect();
      setIsConnected(false);
    }
  }, [isConnected]);

  const executeCommand = useCallback(async (command) => {
    if (!isConnected) {
      throw new Error('Not connected to SSH');
    }

    setIsProcessing(true);
    setError(null);

    try {
      return await ssh.executeCommand(command);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected]);

  return {
    isConnected,
    isProcessing,
    error,
    connect,
    disconnect,
    executeCommand,
    wpCli
  };
}