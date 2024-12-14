import { validateTemplate } from '../utils/template';

/**
 * Service for loading and managing Elementor templates
 */
export class TemplateService {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Load a template from a JSON object
   * @param {string} key - Template identifier
   * @param {Object} data - Template data
   */
  loadTemplate(key, data) {
    try {
      // Add required site_name if missing
      const templateData = {
        site_name: 'Default Site',
        ...data
      };
      
      validateTemplate(templateData);
      this.templates.set(key, templateData);
      return templateData;
    } catch (error) {
      throw new Error(`Failed to load template: ${error.message}`);
    }
  }

  /**
   * Get a loaded template
   * @param {string} key - Template identifier
   * @returns {Object} Template data
   */
  getTemplate(key) {
    const template = this.templates.get(key);
    if (!template) {
      throw new Error(`Template not found: ${key}`);
    }
    return JSON.parse(JSON.stringify(template));
  }

  /**
   * Check if a template exists
   * @param {string} key - Template identifier
   * @returns {boolean} True if template exists
   */
  hasTemplate(key) {
    return this.templates.has(key);
  }
}