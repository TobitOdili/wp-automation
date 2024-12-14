export class WPCLIService {
  constructor(sshService) {
    this.ssh = sshService;
  }

  async installPlugin(pluginName) {
    return this.ssh.executeWPCLI(`plugin install ${pluginName} --activate`);
  }

  async updatePlugins() {
    return this.ssh.executeWPCLI('plugin update --all');
  }

  async updateCore() {
    return this.ssh.executeWPCLI('core update');
  }

  async updateTheme(themeName) {
    return this.ssh.executeWPCLI(`theme update ${themeName}`);
  }

  async importContent(xmlFile) {
    return this.ssh.executeWPCLI(`import ${xmlFile} --authors=create`);
  }

  async exportContent(outputFile) {
    return this.ssh.executeWPCLI(`export --output=${outputFile}`);
  }

  async setOption(key, value) {
    return this.ssh.executeWPCLI(`option update ${key} "${value}"`);
  }

  async getOption(key) {
    return this.ssh.executeWPCLI(`option get ${key}`);
  }
}