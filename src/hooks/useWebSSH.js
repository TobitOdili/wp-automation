import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/ssh/logging';

export function useWebSSH() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const messageHandlers = useRef(new Map());

  const connect = useCallback(async (credentials) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      logger.info('Initiating SSH connection');

      // Create WebSocket connection using relative path
      const wsUrl = '/ssh-proxy';
      const fullUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${wsUrl}`;
      
      logger.debug('Creating WebSocket connection:', fullUrl);
      socketRef.current = new WebSocket(fullUrl);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          logger.error('Connection timeout');
          reject(new Error('Connection timeout'));
        }, 30000);

        socketRef.current.onopen = () => {
          logger.info('WebSocket connection established');
          clearTimeout(timeout);
          resolve();
        };

        socketRef.current.onerror = (event) => {
          logger.error('WebSocket error:', event);
          clearTimeout(timeout);
          reject(new Error('WebSocket connection failed'));
        };
      });

      // Set up message handler
      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          logger.debug('Received message:', message.type);
          
          const handler = messageHandlers.current.get(message.id);
          if (handler) {
            handler(message);
          }
        } catch (err) {
          logger.error('Error handling message:', err);
        }
      };

      // Authenticate
      logger.info('Authenticating SSH connection');
      const authResult = await sendMessage({
        type: 'auth',
        credentials
      });

      if (authResult.type === 'auth_success') {
        logger.info('SSH authentication successful');
        setIsConnected(true);
        setOutput('Connected successfully! Try running a test command.');
        return true;
      }

      throw new Error(authResult.error || 'Authentication failed');
    } catch (err) {
      logger.error('Connection failed:', err);
      setError(err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    logger.info('Disconnecting SSH');
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
    setOutput(prev => prev + '\nDisconnected.');
    messageHandlers.current.clear();
  }, []);

  const sendMessage = useCallback((message) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected'));
        return;
      }

      const messageId = Math.random().toString(36).substring(7);
      logger.debug('Sending message:', message.type, messageId);

      const timeout = setTimeout(() => {
        logger.warn('Message timeout:', messageId);
        messageHandlers.current.delete(messageId);
        reject(new Error('Message timeout'));
      }, 30000);

      messageHandlers.current.set(messageId, (response) => {
        logger.debug('Received response:', response.type, messageId);
        clearTimeout(timeout);
        messageHandlers.current.delete(messageId);
        resolve(response);
      });

      socketRef.current.send(JSON.stringify({
        ...message,
        id: messageId
      }));
    });
  }, []);

  const executeCommand = useCallback(async (command) => {
    if (!isConnected) {
      throw new Error('Not connected to SSH server');
    }

    setIsProcessing(true);
    setError(null);

    try {
      logger.info('Executing command:', command);
      const result = await sendMessage({
        type: 'command',
        command
      });

      if (result.type === 'exit' && result.code === 0) {
        logger.info('Command completed successfully');
        setOutput(prev => `${prev}\n\n$ ${command}\n${result.output}`);
        return result;
      }

      throw new Error(result.error || 'Command failed');
    } catch (err) {
      logger.error('Command execution failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        logger.info('Cleaning up SSH connection');
        socketRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isProcessing,
    error,
    output,
    connect,
    disconnect,
    executeCommand
  };
}