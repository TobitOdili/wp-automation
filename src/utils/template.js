export function validateTemplate(template) {
  if (!template || typeof template !== 'object') {
    throw new Error('Invalid template structure');
  }

  if (!template.settings?.system_colors?.length) {
    throw new Error('Missing system colors in template');
  }

  return true;
}

export function createDownloadUrl(blob) {
  return URL.createObjectURL(blob);
}

export function cleanupDownloadUrl(url) {
  URL.revokeObjectURL(url);
}