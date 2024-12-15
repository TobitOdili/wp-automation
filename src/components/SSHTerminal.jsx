import React, { useState, useCallback } from 'react';
import { Button } from './Button';
import { useWebSSH } from '../hooks/useWebSSH';
import { logger } from '../utils/ssh/logging';

export function SSHTerminal() {
  const { 
    isConnected,
    isProcessing,
    error,
    output,
    connect,
    disconnect,
    executeCommand
  } = useWebSSH();

  const [credentials, setCredentials] = useState({
    host: '',
    username: '',
    password: ''
  });

  const handleConnect = useCallback(async () => {
    try {
      logger.info('Attempting SSH connection...');
      await connect(credentials);
    } catch (err) {
      logger.error('SSH connection failed:', err);
    }
  }, [connect, credentials]);

  const handleDisconnect = useCallback(() => {
    try {
      disconnect();
      logger.info('SSH disconnected');
    } catch (err) {
      logger.error('SSH disconnect error:', err);
    }
  }, [disconnect]);

  const handleTestCommand = useCallback(async () => {
    try {
      logger.info('Executing test command...');
      await executeCommand('whoami && pwd');
    } catch (err) {
      logger.error('Command execution failed:', err);
    }
  }, [executeCommand]);

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">SSH Terminal</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Host</label>
          <input
            type="text"
            value={credentials.host}
            onChange={(e) => setCredentials(prev => ({
              ...prev,
              host: e.target.value.trim()
            }))}
            placeholder="Enter hostname or IP"
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500"
            disabled={isConnected || isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({
              ...prev,
              username: e.target.value
            }))}
            placeholder="Enter username"
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500"
            disabled={isConnected || isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({
              ...prev,
              password: e.target.value
            }))}
            placeholder="Enter password"
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500"
            disabled={isConnected || isProcessing}
          />
        </div>
      </div>

      <div className="space-x-4 mb-6">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isProcessing || !credentials.host || !credentials.username || !credentials.password}
          >
            {isProcessing ? 'Connecting...' : 'Connect'}
          </Button>
        ) : (
          <>
            <Button onClick={handleDisconnect} variant="secondary">
              Disconnect
            </Button>
            <Button onClick={handleTestCommand} disabled={isProcessing}>
              {isProcessing ? 'Running...' : 'Test Command'}
            </Button>
          </>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 text-red-200 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Output Display */}
      {output && (
        <div className="p-4 bg-gray-900 rounded">
          <p className="font-semibold mb-2">Output:</p>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}