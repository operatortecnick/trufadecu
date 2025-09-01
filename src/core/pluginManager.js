/**
 * Plugin Manager for Ian Agent
 */

import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import chalk from 'chalk';
import { spawn } from 'child_process';

import { Logger } from '../utils/logger.js';

export class PluginManager {
  constructor() {
    this.logger = new Logger();
    this.pluginsDir = path.join(os.homedir(), '.ian', 'plugins');
    this.loadedPlugins = new Map();
    this.pluginHooks = new Map();
  }

  /**
   * Initialize plugin manager
   */
  async initialize() {
    try {
      await fs.ensureDir(this.pluginsDir);
      await this.loadPlugins();
      this.logger.info('Plugin manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize plugin manager:', error);
    }
  }

  /**
   * Load all plugins from plugins directory
   */
  async loadPlugins() {
    try {
      const pluginDirs = await fs.readdir(this.pluginsDir);
      
      for (const pluginDir of pluginDirs) {
        const pluginPath = path.join(this.pluginsDir, pluginDir);
        const pluginStat = await fs.stat(pluginPath);
        
        if (pluginStat.isDirectory()) {
          await this.loadPlugin(pluginPath);
        }
      }
      
      console.log(chalk.green(`✅ Loaded ${this.loadedPlugins.size} plugins`));
    } catch (error) {
      this.logger.error('Failed to load plugins:', error);
    }
  }

  /**
   * Load individual plugin
   */
  async loadPlugin(pluginPath) {
    try {
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const mainFilePath = path.join(pluginPath, 'index.js');
      
      if (!await fs.pathExists(packageJsonPath) || !await fs.pathExists(mainFilePath)) {
        this.logger.warn(`Invalid plugin structure: ${pluginPath}`);
        return;
      }
      
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Validate plugin metadata
      if (!this.validatePluginMetadata(packageJson)) {
        this.logger.warn(`Invalid plugin metadata: ${pluginPath}`);
        return;
      }
      
      // Import the plugin module
      const pluginModule = await import(`file://${mainFilePath}`);
      const plugin = new pluginModule.default();
      
      // Initialize plugin
      await plugin.initialize?.();
      
      this.loadedPlugins.set(packageJson.name, {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        author: packageJson.author,
        path: pluginPath,
        instance: plugin,
        hooks: plugin.hooks || [],
        commands: plugin.commands || []
      });
      
      // Register plugin hooks
      this.registerPluginHooks(packageJson.name, plugin.hooks || []);
      
      this.logger.info(`Plugin loaded: ${packageJson.name}@${packageJson.version}`);
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginPath}:`, error);
    }
  }

  /**
   * Validate plugin metadata
   */
  validatePluginMetadata(packageJson) {
    const requiredFields = ['name', 'version', 'description'];
    
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        return false;
      }
    }
    
    // Check if it's an Ian plugin
    if (!packageJson.keywords || !packageJson.keywords.includes('ian-plugin')) {
      return false;
    }
    
    return true;
  }

  /**
   * Register plugin hooks
   */
  registerPluginHooks(pluginName, hooks) {
    for (const hook of hooks) {
      if (!this.pluginHooks.has(hook.event)) {
        this.pluginHooks.set(hook.event, []);
      }
      
      this.pluginHooks.get(hook.event).push({
        plugin: pluginName,
        handler: hook.handler,
        priority: hook.priority || 0
      });
    }
    
    // Sort hooks by priority
    for (const [event, handlers] of this.pluginHooks) {
      handlers.sort((a, b) => b.priority - a.priority);
    }
  }

  /**
   * Execute plugin hooks
   */
  async executeHooks(event, data = {}) {
    const hooks = this.pluginHooks.get(event) || [];
    const results = [];
    
    for (const hook of hooks) {
      try {
        const plugin = this.loadedPlugins.get(hook.plugin);
        if (plugin && plugin.instance) {
          const result = await hook.handler.call(plugin.instance, data);
          results.push({
            plugin: hook.plugin,
            result
          });
        }
      } catch (error) {
        this.logger.error(`Hook execution failed for ${hook.plugin}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Install plugin from npm or local path
   */
  async installPlugin(pluginIdentifier) {
    try {
      console.log(chalk.blue(`📦 Installing plugin: ${pluginIdentifier}`));
      
      let pluginName;
      let installPath;
      
      if (pluginIdentifier.startsWith('file:') || fs.pathExistsSync(pluginIdentifier)) {
        // Local plugin installation
        pluginName = path.basename(pluginIdentifier);
        installPath = path.join(this.pluginsDir, pluginName);
        await fs.copy(pluginIdentifier.replace('file:', ''), installPath);
      } else {
        // NPM plugin installation
        pluginName = pluginIdentifier;
        installPath = path.join(this.pluginsDir, pluginName);
        
        await fs.ensureDir(installPath);
        
        // Use npm to install the plugin
        await this.runNpmCommand(['install', pluginIdentifier], installPath);
        
        // Move from node_modules to plugin directory
        const nodeModulesPath = path.join(installPath, 'node_modules', pluginName);
        if (await fs.pathExists(nodeModulesPath)) {
          await fs.copy(nodeModulesPath, installPath);
          await fs.remove(path.join(installPath, 'node_modules'));
        }
      }
      
      // Load the newly installed plugin
      await this.loadPlugin(installPath);
      
      console.log(chalk.green(`✅ Plugin ${pluginName} installed successfully`));
      
      return {
        success: true,
        plugin: pluginName,
        path: installPath
      };
    } catch (error) {
      console.log(chalk.red(`❌ Failed to install plugin: ${error.message}`));
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove plugin
   */
  async removePlugin(pluginName) {
    try {
      console.log(chalk.blue(`🗑️  Removing plugin: ${pluginName}`));
      
      const plugin = this.loadedPlugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found`);
      }
      
      // Call plugin cleanup if available
      if (plugin.instance && plugin.instance.cleanup) {
        await plugin.instance.cleanup();
      }
      
      // Remove plugin files
      await fs.remove(plugin.path);
      
      // Remove from loaded plugins
      this.loadedPlugins.delete(pluginName);
      
      // Remove plugin hooks
      for (const [event, hooks] of this.pluginHooks) {
        const filteredHooks = hooks.filter(hook => hook.plugin !== pluginName);
        this.pluginHooks.set(event, filteredHooks);
      }
      
      console.log(chalk.green(`✅ Plugin ${pluginName} removed successfully`));
      
      return { success: true };
    } catch (error) {
      console.log(chalk.red(`❌ Failed to remove plugin: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * List installed plugins
   */
  async getLoadedPlugins() {
    return Array.from(this.loadedPlugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      hooks: plugin.hooks.length,
      commands: plugin.commands.length
    }));
  }

  /**
   * Get plugin by name
   */
  getPlugin(pluginName) {
    return this.loadedPlugins.get(pluginName);
  }

  /**
   * Get loaded plugin count
   */
  async getLoadedPluginCount() {
    return this.loadedPlugins.size;
  }

  /**
   * Execute plugin command
   */
  async executePluginCommand(pluginName, commandName, args = {}) {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    
    const command = plugin.commands.find(cmd => cmd.name === commandName);
    if (!command) {
      throw new Error(`Command ${commandName} not found in plugin ${pluginName}`);
    }
    
    return await command.handler.call(plugin.instance, args);
  }

  /**
   * Get available plugin commands
   */
  getAvailableCommands() {
    const commands = [];
    
    for (const plugin of this.loadedPlugins.values()) {
      for (const command of plugin.commands) {
        commands.push({
          plugin: plugin.name,
          command: command.name,
          description: command.description,
          usage: command.usage
        });
      }
    }
    
    return commands;
  }

  /**
   * Create plugin template
   */
  async createPluginTemplate(pluginName, options = {}) {
    const pluginPath = path.join(this.pluginsDir, pluginName);
    
    if (await fs.pathExists(pluginPath)) {
      throw new Error(`Plugin ${pluginName} already exists`);
    }
    
    await fs.ensureDir(pluginPath);
    
    // Create package.json
    const packageJson = {
      name: pluginName,
      version: '1.0.0',
      description: options.description || `Ian plugin: ${pluginName}`,
      main: 'index.js',
      keywords: ['ian-plugin'],
      author: options.author || 'Unknown',
      license: 'MIT'
    };
    
    await fs.writeJson(path.join(pluginPath, 'package.json'), packageJson, { spaces: 2 });
    
    // Create main plugin file
    const pluginTemplate = `/**
 * ${pluginName} - Ian Agent Plugin
 * ${packageJson.description}
 */

export default class ${this.capitalize(pluginName)}Plugin {
  constructor() {
    this.name = '${pluginName}';
    this.version = '1.0.0';
    
    // Define plugin hooks
    this.hooks = [
      {
        event: 'beforeTaskExecution',
        handler: this.beforeTaskExecution.bind(this),
        priority: 0
      }
    ];
    
    // Define plugin commands
    this.commands = [
      {
        name: 'hello',
        description: 'Say hello from ${pluginName}',
        usage: 'hello [name]',
        handler: this.helloCommand.bind(this)
      }
    ];
  }

  /**
   * Initialize plugin
   */
  async initialize() {
    console.log(\`\${this.name} plugin initialized\`);
  }

  /**
   * Cleanup plugin resources
   */
  async cleanup() {
    console.log(\`\${this.name} plugin cleaned up\`);
  }

  /**
   * Hook: Before task execution
   */
  async beforeTaskExecution(data) {
    console.log(\`\${this.name}: Task about to execute: \${data.task}\`);
    return { processed: true };
  }

  /**
   * Command: Hello
   */
  async helloCommand(args) {
    const name = args.name || 'World';
    return \`Hello \${name} from \${this.name} plugin!\`;
  }
}
`;
    
    await fs.writeFile(path.join(pluginPath, 'index.js'), pluginTemplate);
    
    // Create README
    const readmeContent = `# ${pluginName}

${packageJson.description}

## Installation

\`\`\`bash
ian plugins --install file:${pluginPath}
\`\`\`

## Commands

- \`hello [name]\` - Say hello from the plugin

## Hooks

- \`beforeTaskExecution\` - Called before task execution

## Development

This plugin was generated using Ian's plugin template.
`;
    
    await fs.writeFile(path.join(pluginPath, 'README.md'), readmeContent);
    
    console.log(chalk.green(`✅ Plugin template created: ${pluginPath}`));
    
    return { path: pluginPath, name: pluginName };
  }

  /**
   * Run npm command
   */
  async runNpmCommand(args, cwd) {
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', args, { cwd, stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      npm.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      npm.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      npm.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`npm command failed: ${stderr}`));
        }
      });
    });
  }

  /**
   * Capitalize string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Validate plugin integrity
   */
  async validatePlugin(pluginPath) {
    try {
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const mainFilePath = path.join(pluginPath, 'index.js');
      
      if (!await fs.pathExists(packageJsonPath)) {
        return { valid: false, error: 'Missing package.json' };
      }
      
      if (!await fs.pathExists(mainFilePath)) {
        return { valid: false, error: 'Missing main file' };
      }
      
      const packageJson = await fs.readJson(packageJsonPath);
      
      if (!this.validatePluginMetadata(packageJson)) {
        return { valid: false, error: 'Invalid metadata' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}