import { useState, useCallback, useEffect } from 'react';
import { useTemplateDownload } from './useTemplateDownload';
import { useColorScheme } from './useColorScheme';
import { useTemplateFiles } from './useTemplateFiles';
import { ElementorService } from '../services/ElementorService';
import { useProcessingStatus } from './useProcessingStatus';
import { useErrorHandler } from './useErrorHandler';

const elementorService = new ElementorService();

export function useTemplateProcessor() {
  const { status, statusMessage, setStatus } = useProcessingStatus();
  const { error, handleError, clearError } = useErrorHandler();
  const { downloadUrl, createDownload, cleanupDownload } = useTemplateDownload();
  const { generateColorScheme } = useColorScheme();
  const { getTemplateFiles } = useTemplateFiles();

  const processTemplate = useCallback(async (formData) => {
    setStatus('processing');
    
    try {
      // Step 1: Generate color scheme
      setStatus('generating-colors');
      const colorScheme = await generateColorScheme(formData);

      // Step 2: Load template files
      setStatus('loading-files');
      const templateFiles = getTemplateFiles();
      
      // Step 3: Load and update site settings
      const siteSettings = templateFiles.get('site-settings.json');
      elementorService.loadSiteSettings(siteSettings);
      
      // Step 4: Add all other files without modification
      for (const [path, content] of templateFiles) {
        if (path !== 'site-settings.json') {
          elementorService.addTemplateFile(path, content);
        }
      }

      // Step 5: Update colors in site settings
      setStatus('customizing');
      elementorService.updateColorScheme({
        primary: formData.preferredColor || colorScheme.primary,
        secondary: colorScheme.secondary,
        text: colorScheme.text,
        accent: colorScheme.accent
      });

      // Step 6: Create download
      setStatus('preparing-download');
      const zipBlob = await elementorService.createTemplateArchive();
      await createDownload(zipBlob);
      
      setStatus('ready');
    } catch (err) {
      handleError(err);
      setStatus('error');
    }
  }, [createDownload, generateColorScheme, getTemplateFiles, handleError, setStatus]);

  useEffect(() => {
    return () => cleanupDownload();
  }, [cleanupDownload]);

  return {
    isProcessing: status !== 'idle' && status !== 'ready' && status !== 'error',
    currentStatus: status,
    statusMessage,
    processTemplate,
    downloadUrl,
    error,
    clearError
  };
}