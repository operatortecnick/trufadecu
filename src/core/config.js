/**
 * Configuration Manager for Ian Agent
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Logger } from '../utils/logger.js';

export class ConfigManager {
  constructor() {
    this.logger = new Logger();
    this.configDir = path.join(os.homedir(), '.ian');
    this.configFile = path.join(this.configDir, 'config.json');
    this.secretsFile = path.join(this.configDir, 'secrets.json');
    
    this.defaultConfig = {
      version: '1.0.0',
      defaultModel: 'openai',
      temperature: 0.7,
      maxTokens: 4000,
      autonomousMode: false,
      plugins: [],
      preferences: {
        theme: 'dark',
        verbose: false,
        autoSave: true
      },
      models: {
        openai: {
          enabled: false,
          model: 'gpt-4',
          baseURL: null
        },
        anthropic: {
          enabled: false,
          model: 'claude-3-sonnet-20240229'
        },
        gemini: {
          enabled: false,
          model: 'gemini-pro'
        },
        local: {
          enabled: false,
          models: []
        }
      }
    };
  }

  /**
   * Initialize configuration directory and files
   */
  async initialize() {
    try {
      await fs.ensureDir(this.configDir);
      
      if (!await fs.pathExists(this.configFile)) {
        await this.createDefaultConfig();
      }
      
      if (!await fs.pathExists(this.secretsFile)) {
        await this.createDefaultSecrets();
      }
      
      this.logger.info('Configuration initialized');
    } catch (error) {
      this.logger.error('Failed to initialize configuration:', error);
      throw error;
    }
  }

  /**
   * Load configuration
   */
  async loadConfig() {
    try {
      await this.initialize();
      
      const config = await fs.readJson(this.configFile);
      const secrets = await fs.readJson(this.secretsFile);
      
      return { ...config, secrets };
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Save configuration
   */
  async saveConfig(config) {
    try {
      const { secrets, ...publicConfig } = config;
      
      await fs.writeJson(this.configFile, publicConfig, { spaces: 2 });
      
      if (secrets) {
        await fs.writeJson(this.secretsFile, secrets, { spaces: 2 });
      }
      
      this.logger.info('Configuration saved');
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * Run setup wizard
   */
  async runSetupWizard() {
    console.log(chalk.cyan(`
🚀 Welcome to Ian Agent Setup!

Let's configure your AI models and preferences.
`));

    try {
      const config = await this.loadConfig();
      const secrets = {};

      // Model configuration
      const { selectedModels } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedModels',
          message: 'Which AI models would you like to configure?',
          choices: [
            { name: 'OpenAI GPT-4', value: 'openai' },
            { name: 'Anthropic Claude', value: 'anthropic' },
            { name: 'Google Gemini', value: 'gemini' },
            { name: 'Local Models', value: 'local' }
          ]
        }
      ]);

      // Configure each selected model
      for (const model of selectedModels) {
        await this.configureModel(model, config, secrets);
      }

      // General preferences
      const preferences = await inquirer.prompt([
        {
          type: 'list',
          name: 'defaultModel',
          message: 'Default AI model:',
          choices: selectedModels.length > 0 ? selectedModels : ['openai'],
          default: config.defaultModel
        },
        {
          type: 'number',
          name: 'temperature',
          message: 'Default temperature (0-1):',
          default: config.temperature,
          validate: (value) => value >= 0 && value <= 1 || 'Temperature must be between 0 and 1'
        },
        {
          type: 'confirm',
          name: 'autonomousMode',
          message: 'Enable autonomous mode by default?',
          default: config.autonomousMode
        },
        {
          type: 'confirm',
          name: 'verbose',
          message: 'Enable verbose logging?',
          default: config.preferences.verbose
        }
      ]);

      // Update configuration
      const updatedConfig = {
        ...config,
        ...preferences,
        preferences: {
          ...config.preferences,
          verbose: preferences.verbose
        },
        secrets
      };

      // Enable configured models
      selectedModels.forEach(model => {
        updatedConfig.models[model].enabled = true;
      });

      await this.saveConfig(updatedConfig);

      console.log(chalk.green(`
✅ Setup completed successfully!

Run 'ian chat' to start using Ian Agent.
`));

    } catch (error) {
      this.logger.error('Setup wizard failed:', error);
      console.log(chalk.red('❌ Setup failed. Please try again.'));
    }
  }

  /**
   * Configure individual AI model
   */
  async configureModel(modelType, config, secrets) {
    console.log(chalk.yellow(`\n🔧 Configuring ${modelType.toUpperCase()}`));

    switch (modelType) {
      case 'openai':
        await this.configureOpenAI(config, secrets);
        break;
      case 'anthropic':
        await this.configureAnthropic(config, secrets);
        break;
      case 'gemini':
        await this.configureGemini(config, secrets);
        break;
      case 'local':
        await this.configureLocalModels(config, secrets);
        break;
    }
  }

  /**
   * Configure OpenAI
   */
  async configureOpenAI(config, secrets) {
    const openaiConfig = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'OpenAI API Key:',
        mask: '*'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Default OpenAI model:',
        choices: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
        default: config.models.openai.model
      },
      {
        type: 'input',
        name: 'baseURL',
        message: 'Custom base URL (optional):',
        default: config.models.openai.baseURL
      }
    ]);

    config.models.openai.model = openaiConfig.model;
    config.models.openai.baseURL = openaiConfig.baseURL || null;
    secrets.openai = { apiKey: openaiConfig.apiKey };
  }

  /**
   * Configure Anthropic Claude
   */
  async configureAnthropic(config, secrets) {
    const anthropicConfig = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Anthropic API Key:',
        mask: '*'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Default Claude model:',
        choices: [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ],
        default: config.models.anthropic.model
      }
    ]);

    config.models.anthropic.model = anthropicConfig.model;
    secrets.anthropic = { apiKey: anthropicConfig.apiKey };
  }

  /**
   * Configure Google Gemini
   */
  async configureGemini(config, secrets) {
    const geminiConfig = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Google AI API Key:',
        mask: '*'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Default Gemini model:',
        choices: ['gemini-pro', 'gemini-pro-vision'],
        default: config.models.gemini.model
      }
    ]);

    config.models.gemini.model = geminiConfig.model;
    secrets.gemini = { apiKey: geminiConfig.apiKey };
  }

  /**
   * Configure local models
   */
  async configureLocalModels(config, secrets) {
    const localConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'endpoint',
        message: 'Local model endpoint (e.g., http://localhost:8080):',
        default: 'http://localhost:11434'
      },
      {
        type: 'input',
        name: 'model',
        message: 'Default local model name:',
        default: 'llama2'
      }
    ]);

    config.models.local.endpoint = localConfig.endpoint;
    config.models.local.defaultModel = localConfig.model;
  }

  /**
   * Show current configuration
   */
  async showConfiguration() {
    try {
      const config = await this.loadConfig();
      
      console.log(chalk.cyan(`
📋 Current Ian Configuration:

Default Model: ${config.defaultModel}
Temperature: ${config.temperature}
Autonomous Mode: ${config.autonomousMode ? 'Enabled' : 'Disabled'}
Verbose Logging: ${config.preferences.verbose ? 'Enabled' : 'Disabled'}

Configured Models:
`));

      Object.entries(config.models).forEach(([name, modelConfig]) => {
        const status = modelConfig.enabled ? '✅' : '❌';
        console.log(`  ${status} ${name.toUpperCase()}: ${modelConfig.model || 'Not configured'}`);
      });

      console.log(chalk.cyan(`
Plugins: ${config.plugins.length} installed
Config Directory: ${this.configDir}
`));

    } catch (error) {
      this.logger.error('Failed to show configuration:', error);
      console.log(chalk.red('❌ Failed to load configuration'));
    }
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfiguration() {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.red('⚠️  This will reset all configuration. Continue?'),
        default: false
      }
    ]);

    if (confirm) {
      try {
        await fs.remove(this.configDir);
        await this.initialize();
        console.log(chalk.green('✅ Configuration reset successfully'));
      } catch (error) {
        this.logger.error('Failed to reset configuration:', error);
        console.log(chalk.red('❌ Failed to reset configuration'));
      }
    }
  }

  /**
   * Create default configuration file
   */
  async createDefaultConfig() {
    await fs.writeJson(this.configFile, this.defaultConfig, { spaces: 2 });
  }

  /**
   * Create default secrets file
   */
  async createDefaultSecrets() {
    await fs.writeJson(this.secretsFile, {}, { spaces: 2 });
  }

  /**
   * Get configuration value
   */
  async getConfig(key) {
    const config = await this.loadConfig();
    return key ? config[key] : config;
  }

  /**
   * Set configuration value
   */
  async setConfig(key, value) {
    const config = await this.loadConfig();
    config[key] = value;
    await this.saveConfig(config);
  }
}