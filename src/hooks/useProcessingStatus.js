import { useState } from 'react';

const STATUS_MESSAGES = {
  'idle': '',
  'processing': 'Processing template...',
  'generating-colors': 'Generating color suggestions with AI...',
  'loading-files': 'Loading template files...',
  'customizing': 'Customizing your template...',
  'preparing-download': 'Preparing download...',
  'ready': 'Template is ready!',
  'error': 'An error occurred'
};

export function useProcessingStatus() {
  const [status, setInternalStatus] = useState('idle');

  const setStatus = (newStatus) => {
    if (!STATUS_MESSAGES[newStatus]) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    setInternalStatus(newStatus);
  };

  return {
    status,
    statusMessage: STATUS_MESSAGES[status],
    setStatus,
    isProcessing: status !== 'idle' && status !== 'ready' && status !== 'error'
  };
}