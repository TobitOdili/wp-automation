import { validateColors } from '../../utils/validation';

export class ColorSchemeService {
  constructor(siteSettings) {
    this.siteSettings = siteSettings;
  }

  updateColorScheme(colorScheme) {
    validateColors([
      colorScheme.primary,
      colorScheme.secondary,
      colorScheme.accent,
      colorScheme.text
    ]);

    // Only update the color values in system_colors
    const updatedColors = this.siteSettings.settings.system_colors.map(color => {
      const newColor = colorScheme[color._id];
      return newColor ? { ...color, color: newColor } : color;
    });

    // Create new settings object preserving all other properties
    this.siteSettings = {
      ...this.siteSettings,
      settings: {
        ...this.siteSettings.settings,
        system_colors: updatedColors
      }
    };

    return this.siteSettings;
  }
}