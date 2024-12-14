import { useState, useCallback } from 'react';
import { SSHKeyService } from '../services/SSHKeyService';
import { CloudwaysService } from '../services/CloudwaysService';
import { CLOUDWAYS_CONFIG } from '../config';

export function useSSHSetup() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [keyPair, setKeyPair] = useState(null);

  const cloudways = new CloudwaysService(
    CLOUDWAYS_CONFIG.API_KEY,
    CLOUDWAYS_CONFIG.EMAIL
  );
  const sshKeyService = new SSHKeyService();

  const generateKeys = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const newKeyPair = await sshKeyService.generateKeyPair();
      setKeyPair(newKeyPair);
      return newKeyPair;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateCloudwaysKey = useCallback(async () => {
    if (!keyPair) {
      throw new Error('No SSH key pair available');
    }

    setIsUpdating(true);
    setError(null);

    try {
      await cloudways.initialize();
      
      await cloudways.updateSSHKey(
        CLOUDWAYS_CONFIG.SOURCE_SERVER_ID,
        keyPair.publicKey
      );

      // Get updated SSH access details
      const sshAccess = await cloudways.getSSHAccess(
        CLOUDWAYS_CONFIG.SOURCE_SERVER_ID,
        CLOUDWAYS_CONFIG.SOURCE_APP_ID
      );

      return sshAccess;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [keyPair]);

  return {
    isGenerating,
    isUpdating,
    error,
    keyPair,
    generateKeys,
    updateCloudwaysKey
  };
}