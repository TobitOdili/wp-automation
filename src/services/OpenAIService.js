import OpenAI from 'openai';

/**
 * Handles OpenAI API interactions for generating suggestions
 */
export class OpenAIService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for browser usage
    });
  }

  /**
   * Generates a color scheme based on blog type and name
   * @param {string} blogType - Type of the blog
   * @param {string} blogName - Name of the blog
   * @returns {Promise<ColorScheme>} Generated color scheme
   */
  async generateColorScheme(blogType, blogName) {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "user",
          content: `Generate a professional color scheme for a ${blogType} blog named "${blogName}".
                    Return a JSON object with the following hex color codes:
                    {
                      "primary": "main theme color",
                      "secondary": "complementary color (lighter version of primary or contrasting)",
                      "accent": "color for CTAs and highlights",
                      "text": "#000000"
                    }
                    Ensure colors are accessible and work well together.
                    Primary should be the dominant brand color.
                    Secondary should complement the primary color.
                    Accent should stand out for calls-to-action.`
        }]
      });

      const colorScheme = JSON.parse(response.choices[0].message.content);
      return {
        ...colorScheme,
        text: '#000000' // Ensure text is always black
      };
    } catch (error) {
      throw new Error(`Failed to generate color scheme: ${error.message}`);
    }
  }
}