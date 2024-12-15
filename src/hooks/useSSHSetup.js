/**
 * Hook for managing SSH setup state and operations
 */
import { useState, useCallback } from 'react';
import { SSHSetupService } from '../services/ssh/SSHSetupService';

export function useSSHSetup() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message) => {
    setLogs(prev => [...prev, message]);
  }, []);

  const setupSSH = useCallback(async () => {
    const service = new SSHSetupService(addLog);
    
    setStatus('running');
    setError(null);
    setResult(null);
    setLogs([]);

    try {
      const setupResult = await service.setup();
      setResult(setupResult);
      setStatus('complete');
      addLog('SSH setup completed successfully');
      return setupResult;
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
      addLog(`Error: ${errorMessage}`);
      throw err;
    }
  }, [addLog]);

  return {
    status,
    result,
    error,
    logs,
    setupSSH,
    isProcessing: status === 'running'
  };
}