import React from 'react';
import { Button } from '../Button';

export function SSHControls({ 
  isConnected,
  isProcessing,
  onConnect,
  onDisconnect,
  onTestCommand,
  disabled
}) {
  return (
    <div className="space-x-4 mb-6">
      {!isConnected ? (
        <Button
          onClick={onConnect}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? 'Connecting...' : 'Connect'}
        </Button>
      ) : (
        <>
          <Button onClick={onDisconnect} variant="secondary">
            Disconnect
          </Button>
          <Button onClick={onTestCommand} disabled={isProcessing}>
            {isProcessing ? 'Running...' : 'Test Command'}
          </Button>
        </>
      )}
    </div>
  );
}