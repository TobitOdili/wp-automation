import React, { useState, useCallback, useEffect } from 'react';
import { SSHClientFactory } from '../services/ssh/SSHClientFactory';
import { logger } from '../utils/ssh/logging';

export function SSHTerminal() {
  const [client, setClient] = useState(null);
  const [output, setOutput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [command, setCommand] = useState('');

  const [credentials, setCredentials] = useState({
    host: '',
    username: '',
    password: ''
  });

  // Initialize SSH client
  useEffect(() => {
    async function initClient() {
      try {
        logger.info('Initializing SSH client...');
        const sshClient = await SSHClientFactory.createClient();
        
        sshClient.on('connecting', () => {
          setOutput(prev => prev + '\nConnecting...');
          setIsLoading(true);
        });

        sshClient.on('connected', () => {
          setIsConnected(true);
          setIsLoading(false);
          setOutput(prev => prev + '\nConnected!');
        });

        sshClient.on('error', (error) => {
          setError(error.message);
          setIsLoading(false);
        });

        sshClient.on('disconnected', () => {
          setIsConnected(false);
          setOutput(prev => prev + '\nDisconnected');
        });

        setClient(sshClient);
      } catch (error) {
        setError('Failed to initialize SSH client: ' + error.message);
      }
    }

    initClient();
  }, []);

  const handleConnect = useCallback(async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      setError(null);
      await client.connect(credentials);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [client, credentials]);

  const handleCommand = useCallback(async () => {
    if (!command.trim()) return;

    try {
      setError(null);
      const output = await client.executeCommand(command);
      setOutput(prev => `${prev}\n\n$ ${command}\n${output}`);
      setCommand('');
    } catch (error) {
      setError(error.message);
    }
  }, [client, command]);

  const handleDisconnect = useCallback(() => {
    if (client) {
      client.disconnect();
    }
  }, [client]);

  const handleCredentialsChange = useCallback((field) => (e) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">SSH Terminal</h2>

      {/* Connection Form */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Host</label>
          <input
            type="text"
            value={credentials.host}
            onChange={handleCredentialsChange('host')}
            disabled={isConnected || isLoading}
            placeholder="hostname or IP address"
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={credentials.username}
            onChange={handleCredentialsChange('username')}
            disabled={isConnected || isLoading}
            placeholder="username"
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={handleCredentialsChange('password')}
            disabled={isConnected || isLoading}
            placeholder="password"
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500 text-white"
          />
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Connection Controls */}
      <div className="mb-6">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading || !credentials.host || !credentials.username || !credentials.password}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 
                     disabled:opacity-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Command Input */}
      {isConnected && (
        <div className="mb-4 flex space-x-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
            placeholder="Enter command..."
            className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 
                     focus:outline-none focus:border-blue-500 text-white"
          />
          <button
            onClick={handleCommand}
            disabled={isLoading || !command.trim()}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 
                     disabled:opacity-50"
          >
            Execute
          </button>
        </div>
      )}

      {/* Terminal Output */}
      <div className="font-mono bg-black p-4 rounded h-64 overflow-auto">
        <pre className="text-green-400 whitespace-pre-wrap">
          {output || 'No output'}
        </pre>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded">
          {error}
        </div>
      )}
    </div>
  );
}