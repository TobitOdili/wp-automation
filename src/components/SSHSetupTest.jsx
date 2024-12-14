import React, { useState } from 'react';
import { useSSHSetup } from '../hooks/useSSHSetup';
import { Button } from './Button';

export function SSHSetupTest() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { generateKeys, updateCloudwaysKey } = useSSHSetup();

  const handleTest = async () => {
    setStatus('running');
    setError(null);
    setResult(null);

    try {
      // Step 1: Generate SSH key pair
      setStatus('generating-keys');
      const keyPair = await generateKeys();
      setResult(prev => ({ ...prev, keyPair }));

      // Step 2: Update Cloudways with public key
      setStatus('updating-cloudways');
      const sshAccess = await updateCloudwaysKey();
      setResult(prev => ({ ...prev, sshAccess }));

      setStatus('complete');
    } catch (err) {
      console.error('SSH setup failed:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">SSH Setup Test</h2>
      
      <Button 
        onClick={handleTest}
        disabled={status === 'running'}
        className="mb-4"
      >
        {status === 'running' ? 'Testing...' : 'Run SSH Setup Test'}
      </Button>

      {/* Status Display */}
      {status !== 'idle' && status !== 'error' && (
        <div className="mb-4">
          <p className="text-blue-400">
            Status: {status === 'running' ? 'Running test...' :
                    status === 'generating-keys' ? 'Generating SSH keys...' :
                    status === 'updating-cloudways' ? 'Updating Cloudways...' :
                    status === 'complete' ? 'Test complete!' : status}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900 text-red-100 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Test Results:</h3>
          
          {result.keyPair && (
            <div className="mb-4">
              <p className="font-semibold">SSH Key Pair Generated:</p>
              <div className="bg-gray-900 p-2 rounded mt-2">
                <p className="text-sm">Public Key (first 44 chars):</p>
                <code className="text-green-400 block mt-1">
                  {result.keyPair.publicKey.substring(0, 44)}...
                </code>
              </div>
            </div>
          )}

          {result.sshAccess && (
            <div className="mb-4">
              <p className="font-semibold">SSH Access Details:</p>
              <pre className="bg-gray-900 p-2 rounded mt-2 overflow-x-auto">
                <code className="text-green-400">
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