import { describe, it, expect, beforeEach } from 'vitest';
import { ElementorService } from '../services/ElementorService.js';
import { readFile } from 'fs/promises';
import path from 'path';

describe('ElementorService', () => {
  let service;
  const testTemplate = {
    site_name: 'Test Site',
    settings: {
      global: {
        colors: {}
      }
    }
  };

  beforeEach(() => {
    service = new ElementorService();
    service.template = JSON.parse(JSON.stringify(testTemplate));
  });

  it('should update color scheme correctly', () => {
    const colorScheme = {
      primary: '#FF0000',
      secondary: '#00FF00',
      text: '#000000',
      accent: '#0000FF'
    };

    service.updateColorScheme(colorScheme);
    
    expect(service.template.settings.global.colors).toEqual(colorScheme);
  });

  it('should throw error when updating colors without loading template', () => {
    service.template = null;
    const colorScheme = {
      primary: '#FF0000',
      secondary: '#00FF00',
      text: '#000000',
      accent: '#0000FF'
    };

    expect(() => service.updateColorScheme(colorScheme)).toThrow('Template must be loaded');
  });

  it('should validate color values', () => {
    const invalidColorScheme = {
      primary: 'invalid',
      secondary: '#00FF00',
      text: '#000000',
      accent: '#0000FF'
    };

    expect(() => service.updateColorScheme(invalidColorScheme)).toThrow('Invalid color format');
  });
});