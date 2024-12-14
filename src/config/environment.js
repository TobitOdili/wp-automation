// Environment configuration
const config = {
  openai: {
    apiKey: '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'
  },
  cloudways: {
    apiKey: 'NIf9IVWsTJ21DBlNCI3C9EShBSHYSg',
    sourceServerId: '1380855',
    sourceAppId: '5101314'
  }
};

/**
 * Get the current configuration
 * @returns {Object} The current configuration object
 */
export function getConfig() {
  return config;
}

/**
 * Validate the configuration
 * @throws {Error} If any required configuration is missing
 */
export function validateConfig() {
  // OpenAI validation
  if (!config.openai.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Cloudways validation
  if (!config.cloudways.apiKey) {
    throw new Error('Cloudways API key is required');
  }
  if (!config.cloudways.sourceServerId) {
    throw new Error('Cloudways source server ID is required');
  }
  if (!config.cloudways.sourceAppId) {
    throw new Error('Cloudways source app ID is required');
  }
}

/**
 * Get OpenAI configuration
 * @returns {Object} OpenAI configuration
 */
export function getOpenAIConfig() {
  return config.openai;
}

/**
 * Get Cloudways configuration
 * @returns {Object} Cloudways configuration
 */
export function getCloudwaysConfig() {
  return config.cloudways;
}