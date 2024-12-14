import { useMemo } from 'react';
import * as templates from '../templates';
import * as taxonomies from '../taxonomies';
import * as content from '../content';
import { wpContent } from '../wp-content';
import manifestJson from '../Elementor Kit Template/manifest.json';
import siteSettingsJson from '../Elementor Kit Template/site-settings.json';

export function useTemplateFiles() {
  const files = useMemo(() => {
    const templateFiles = new Map();

    // Add site settings and manifest
    templateFiles.set('site-settings.json', siteSettingsJson);
    templateFiles.set('manifest.json', manifestJson);

    // Add template files
    Object.entries(templates).forEach(([key, value]) => {
      const filename = key.replace('template', '');
      templateFiles.set(`templates/${filename}.json`, value);
    });

    // Add taxonomy files
    Object.entries(taxonomies).forEach(([key, value]) => {
      templateFiles.set(`taxonomies/${key}.json`, value);
    });

    // Add content files
    Object.entries(content).forEach(([key, value]) => {
      const filename = key.replace('page', '');
      templateFiles.set(`content/page/${filename}.json`, value);
    });

    // Add WordPress XML content files
    Object.entries(wpContent).forEach(([path, content]) => {
      templateFiles.set(`wp-content/${path}`, content);
    });

    return templateFiles;
  }, []);

  return {
    getTemplateFiles: () => files
  };
}