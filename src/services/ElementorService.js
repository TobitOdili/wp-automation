import { validateTemplate } from '../utils/template';
import { ColorSchemeService, ArchiveService, FileService } from './template';

export class ElementorService {
  constructor() {
    this.fileService = new FileService();
    this.colorSchemeService = null;
    this.archiveService = new ArchiveService();
  }

  loadSiteSettings(siteSettings) {
    try {
      validateTemplate(siteSettings);
      this.colorSchemeService = new ColorSchemeService(siteSettings);
      // Add site settings to file service
      this.fileService.loadFile('site-settings.json', siteSettings);
    } catch (error) {
      throw new Error(`Failed to load site settings: ${error.message}`);
    }
  }

  updateColorScheme(colorScheme) {
    if (!this.colorSchemeService) {
      throw new Error('Site settings must be loaded before customization');
    }
    const updatedSettings = this.colorSchemeService.updateColorScheme(colorScheme);
    // Update site settings in file service
    this.fileService.loadFile('site-settings.json', updatedSettings);
    return updatedSettings;
  }

  addTemplateFile(path, content) {
    this.fileService.loadFile(path, content);
  }

  async createTemplateArchive() {
    if (!this.colorSchemeService) {
      throw new Error('Site settings must be loaded');
    }

    try {
      // Validate all required files are present
      this.fileService.validateFiles();

      return await this.archiveService.createArchive(
        this.colorSchemeService.siteSettings,
        this.fileService.getAllFiles()
      );
    } catch (error) {
      throw new Error(`Failed to create archive: ${error.message}`);
    }
  }
}