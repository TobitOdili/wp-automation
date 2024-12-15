import React from 'react';
import { useSSHSetup } from '../hooks/useSSHSetup';
import { Button } from './Button';

export function SSHSetupTest() {
  const { 
    status, 
    result, 
    error, 
    logs,
    setupSSH, 
    isProcessing 
  } = useSSHSetup();

  const handleTest = async () => {
    try {
      await setupSSH();
    } catch (err) {
      // Only log the error message to avoid serialization issues
      console.error('SSH setup failed:', err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">SSH Setup Test</h2>
      
      <Button 
        onClick={handleTest}
        disabled={isProcessing}
        className="mb-4"
      >
        {isProcessing ? 'Setting up SSH...' : 'Run SSH Setup'}
      </Button>

      {/* Status Display */}
      <div className="mb-4">
        <p className={`${
          status === 'error' ? 'text-red-400' :
          status === 'complete' ? 'text-green-400' :
          'text-blue-400'
        }`}>
          Status: {status === 'running' ? 'Setting up SSH access...' :
                  status === 'complete' ? 'Setup complete!' :
                  status === 'error' ? 'Setup failed' : status}
        </p>
      </div>

      {/* Logs Display */}
      {logs.length > 0 && (
        <div className="mb-4 p-2 bg-gray-900 rounded">
          <p className="font-semibold mb-2">Progress:</p>
          {logs.map((log, index) => (
            <p key={index} className={`text-sm mb-1 ${
              log.startsWith('Error:') ? 'text-red-300' : 'text-gray-300'
            }`}>
              {log}
            </p>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 text-red-100 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Setup Results:</h3>
          
          {result.keyPair && (
            <div className="mb-4">
              <p className="font-semibold">SSH Key Pair Generated:</p>
              <div className="bg-gray-900 p-2 rounded mt-2">
                <p className="text-sm">Public Key (first 44 chars):</p>
                <code className="text-green-400 block mt-1 break-all">
                  {result.keyPair.publicKey.substring(0, 44)}...
                </code>
              </div>
            </div>
          )}

          {result.sshAccess && (
            <div className="mb-4">
              <p className="font-semibold">SSH Access Details:</p>
              <pre className="bg-gray-900 p-2 rounded mt-2 overflow-x-auto">
                <code className="text-green-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(result.sshAccess, null, 2)}
                </code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}