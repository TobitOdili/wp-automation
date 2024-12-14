import { createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import archiver from 'archiver';

/**
 * Creates a zip archive from a template file
 * @param {string} templatePath - Path to the template file
 * @param {string} outputPath - Path for the zip file
 * @returns {Promise<string>} Path to the created zip file
 */
export function createZipArchive(templatePath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => resolve(outputPath));
    archive.on('error', reject);

    archive.pipe(output);
    archive.file(templatePath, { name: 'template.json' });
    archive.finalize();
  });
}