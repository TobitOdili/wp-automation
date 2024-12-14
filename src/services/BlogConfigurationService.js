/**
 * Manages blog configuration and user inputs
 */
export class BlogConfigurationService {
  constructor() {
    this.config = {
      blogName: '',
      blogType: '',
      colors: [],
      logo: null
    };
  }

  setBlogName(name) {
    this.config.blogName = name;
  }

  setBlogType(type) {
    this.config.blogType = type;
  }

  setColors(colors) {
    this.config.colors = colors;
  }

  setLogo(logo) {
    this.config.logo = logo;
  }

  getConfig() {
    return { ...this.config };
  }

  validateConfig() {
    if (!this.config.blogName) {
      throw new Error('Blog name is required');
    }
    if (!this.config.blogType) {
      throw new Error('Blog type is required');
    }
    return true;
  }
}