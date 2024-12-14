import { useCallback } from 'react';
import { OpenAIService } from '../services/OpenAIService';
import { getConfig } from '../config/environment';

export function useColorScheme() {
  const generateColorScheme = useCallback(async (formData) => {
    const config = getConfig();
    const openAI = new OpenAIService(config.openai.apiKey);
    return await openAI.generateColorScheme(
      formData.blogType,
      formData.blogName
    );
  }, []);

  return { generateColorScheme };
}