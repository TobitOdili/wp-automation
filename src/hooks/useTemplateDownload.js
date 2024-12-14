import { useState, useCallback } from 'react';
import { createDownloadUrl, cleanupDownloadUrl } from '../utils/template';

export function useTemplateDownload() {
  const [downloadUrl, setDownloadUrl] = useState('');

  const createDownload = useCallback(async (blob) => {
    try {
      // Cleanup previous URL if exists
      if (downloadUrl) {
        cleanupDownloadUrl(downloadUrl);
      }

      // Create new download URL
      const url = createDownloadUrl(blob);
      setDownloadUrl(url);

      return url;
    } catch (error) {
      console.error('Error creating download:', error);
      throw new Error('Failed to create download');
    }
  }, [downloadUrl]);

  const cleanupDownload = useCallback(() => {
    if (downloadUrl) {
      cleanupDownloadUrl(downloadUrl);
      setDownloadUrl('');
    }
  }, [downloadUrl]);

  return {
    downloadUrl,
    createDownload,
    cleanupDownload
  };
}