import React, { useState, useCallback } from 'react';
import { SSHClient } from '../services/ssh/browser/SSHClient';

export function SSHTerminal() {
  const [client] = useState(() => new SSHClient());
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

  // Setup event listeners
  React.useEffect(() => {
    const unsubscribe = [
      client.on('connecting', () => {
        setOutput(prev => prev + '\nConnecting...');
        setIsLoading(true);
      }),
      client.on('connected', () => {
        setOutput(prev => prev + '\nConnected!');
        setIsConnected(true);
        setIsLoading(false);
      }),
      client.on('executing', (cmd) => {
        setOutput(prev => prev + `\n$ ${cmd}`);
        setIsLoading(true);
      }),
      client.on('executed', (result) => {
        setOutput(prev => prev + `\n${result}`);
        setIsLoading(false);
      }),
      client.on('error', (error) => {
        setError(error.message);
        setIsLoading(false);
      }),
      client.on('disconnected', () => {
        setOutput(prev => prev + '\nDisconnected');
        setIsConnected(false);
      })
    ];

    return () => unsubscribe.forEach(fn => fn());
  }, [client]);

  const handleConnect = useCallback(async () => {
    try {
      setError(null);
      await client.connect(credentials);
    } catch (err) {
      setError(err.message);
    }
  }, [client, credentials]);

  const handleCommand = useCallback(async () => {
    if (!command.trim()) return;

    try {
      setError(null);
      await client.executeCommand(command);
      setCommand('');
    } catch (err) {
      setError(err.message);
    }
  }, [client, command]);

  const handleDisconnect = useCallback(() => {
    client.disconnect();
  }, [client]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">SSH Terminal</h2>

      {/* Connection Form */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Host"
          value={credentials.host}
          onChange={e => setCredentials(prev => ({ ...prev, host: e.target.value }))}
          className="w-full p-2 bg-gray-700 rounded text-white"
          disabled={isConnected}
        />
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={e => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          className="w-full p-2 bg-gray-700 rounded text-white"
          disabled={isConnected}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          className="w-full p-2 bg-gray-700 rounded text-white"
          disabled={isConnected}
        />
      </div>

      {/* Command Input */}
      {isConnected && (
        <div className="mb-4 flex space-x-2">
          <input
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCommand()}
            placeholder="Enter command..."
            className="flex-1 p-2 bg-gray-700 rounded text-white"
          />
          <button
            onClick={handleCommand}
            disabled={isLoading || !command.trim()}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Execute
          </button>
        </div>
      )}

      {/* Connection Controls */}
      <div className="mb-4">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Output Display */}
      <div className="font-mono bg-black p-4 rounded h-64 overflow-auto">
        <pre className="text-green-400 whitespace-pre-wrap">{output || 'No output'}</pre>
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