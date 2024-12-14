import JSZip from 'jszip';
import { TEMPLATE_FILE_STRUCTURE } from '../../constants/fileStructure';

export class ArchiveService {
  async createArchive(siteSettings, templateFiles) {
    try {
      const zip = new JSZip();
      
      // Add the modified site-settings.json first
      zip.file('site-settings.json', JSON.stringify(siteSettings, null, 2));
      
      // Add all files in the correct order from template structure
      for (const path of TEMPLATE_FILE_STRUCTURE) {
        // Skip site-settings.json as we've already added it
        if (path === 'site-settings.json') continue;
        
        const content = templateFiles.get(path);
        if (!content) {
          throw new Error(`Missing required file: ${path}`);
        }

        // Handle XML files differently
        if (path.endsWith('.xml')) {
          zip.file(path, content, { binary: false });
        } else {
          zip.file(path, content);
        }
      }
      
      return await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });
    } catch (error) {
      console.error('Archive creation error:', error);
      throw new Error(`Failed to create archive: ${error.message}`);
    }
  }
}