import React from 'react';

export function SSHOutput({ output, error }) {
  if (!output && !error) return null;

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/50 text-red-200 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Command Output */}
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