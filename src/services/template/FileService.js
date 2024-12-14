import { TEMPLATE_FILE_STRUCTURE } from '../../constants/fileStructure';

export class FileService {
  constructor() {
    this.files = new Map();
  }

  loadFile(path, content) {
    // Normalize path to match expected structure
    const normalizedPath = path.replace(/^\/+/, '');
    
    // Validate path is in expected structure
    if (!TEMPLATE_FILE_STRUCTURE.includes(normalizedPath)) {
      console.warn(`Unexpected file path: ${normalizedPath}`);
    }

    // Convert content to string if it's an object
    const fileContent = typeof content === 'object' 
      ? JSON.stringify(content, null, 2)
      : content;

    this.files.set(normalizedPath, fileContent);
  }

  getFile(path) {
    return this.files.get(path);
  }

  getAllFiles() {
    return this.files;
  }

  validateFiles() {
    // Check all required files are present
    const missingFiles = TEMPLATE_FILE_STRUCTURE.filter(
      path => !this.files.has(path)
    );

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    return true;
  }
}