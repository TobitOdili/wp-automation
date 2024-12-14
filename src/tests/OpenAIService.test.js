import { describe, it, expect, vi } from 'vitest';
import { OpenAIService } from '../services/OpenAIService.js';

describe('OpenAIService', () => {
  it('should generate valid color scheme', async () => {
    const mockApiKey = 'test-key';
    const service = new OpenAIService(mockApiKey);

    // Mock the OpenAI API response
    service.client.chat.completions.create = vi.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            primary: '#FF0000',
            secondary: '#00FF00',
            accent: '#0000FF',
            text: '#000000'
          })
        }
      }]
    });

    const colorScheme = await service.generateColorScheme('personal', 'Test Blog');

    expect(colorScheme).toEqual({
      primary: '#FF0000',
      secondary: '#00FF00',
      accent: '#0000FF',
      text: '#000000'
    });
  });

  it('should enforce black text color', async () => {
    const mockApiKey = 'test-key';
    const service = new OpenAIService(mockApiKey);

    // Mock response with different text color
    service.client.chat.completions.create = vi.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            primary: '#FF0000',
            secondary: '#00FF00',
            accent: '#0000FF',
            text: '#FFFFFF' // Different text color
          })
        }
      }]
    });

    const colorScheme = await service.generateColorScheme('personal', 'Test Blog');

    expect(colorScheme.text).toBe('#000000');
  });
});