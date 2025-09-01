/**
 * Model Manager - Handles different AI model providers
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import chalk from 'chalk';

import { ConfigManager } from '../core/config.js';
import { Logger } from '../utils/logger.js';

export class ModelManager {
  constructor() {
    this.logger = new Logger();
    this.configManager = new ConfigManager();
    this.models = new Map();
    this.config = null;
  }

  /**
   * Initialize model manager
   */
  async initialize() {
    try {
      this.config = await this.configManager.loadConfig();
      await this.initializeProviders();
      this.logger.info('Model manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize model manager:', error);
      throw error;
    }
  }

  /**
   * Initialize AI providers
   */
  async initializeProviders() {
    const { models, secrets } = this.config;

    // Initialize OpenAI
    if (models.openai.enabled && secrets.openai?.apiKey) {
      try {
        const openai = new OpenAI({
          apiKey: secrets.openai.apiKey,
          baseURL: models.openai.baseURL || undefined
        });
        this.models.set('openai', {
          client: openai,
          config: models.openai,
          type: 'openai'
        });
        this.logger.info('OpenAI provider initialized');
      } catch (error) {
        this.logger.error('Failed to initialize OpenAI:', error);
      }
    }

    // Initialize Anthropic
    if (models.anthropic.enabled && secrets.anthropic?.apiKey) {
      try {
        const anthropic = new Anthropic({
          apiKey: secrets.anthropic.apiKey
        });
        this.models.set('anthropic', {
          client: anthropic,
          config: models.anthropic,
          type: 'anthropic'
        });
        this.logger.info('Anthropic provider initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Anthropic:', error);
      }
    }

    // Initialize Google Gemini
    if (models.gemini.enabled && secrets.gemini?.apiKey) {
      try {
        const gemini = new GoogleGenerativeAI(secrets.gemini.apiKey);
        this.models.set('gemini', {
          client: gemini,
          config: models.gemini,
          type: 'gemini'
        });
        this.logger.info('Gemini provider initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Gemini:', error);
      }
    }

    // Initialize local models
    if (models.local.enabled && models.local.endpoint) {
      try {
        this.models.set('local', {
          endpoint: models.local.endpoint,
          config: models.local,
          type: 'local'
        });
        this.logger.info('Local model provider initialized');
      } catch (error) {
        this.logger.error('Failed to initialize local models:', error);
      }
    }
  }

  /**
   * Generate response using specified model
   */
  async generate(prompt, options = {}) {
    const modelName = options.model || this.config.defaultModel;
    const temperature = options.temperature || this.config.temperature;
    const maxTokens = options.maxTokens || this.config.maxTokens;

    if (!this.config) {
      await this.initialize();
    }

    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not available. Run 'ian config --setup' to configure models.`);
    }

    try {
      switch (model.type) {
        case 'openai':
          return await this.generateOpenAI(model, prompt, { temperature, maxTokens, ...options });
        case 'anthropic':
          return await this.generateAnthropic(model, prompt, { temperature, maxTokens, ...options });
        case 'gemini':
          return await this.generateGemini(model, prompt, { temperature, maxTokens, ...options });
        case 'local':
          return await this.generateLocal(model, prompt, { temperature, maxTokens, ...options });
        default:
          throw new Error(`Unknown model type: ${model.type}`);
      }
    } catch (error) {
      this.logger.error(`Generation failed with ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Generate with OpenAI
   */
  async generateOpenAI(model, prompt, options) {
    const response = await model.client.chat.completions.create({
      model: model.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are Ian, an autonomous AI agent assistant. Be helpful, accurate, and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: false
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate with Anthropic Claude
   */
  async generateAnthropic(model, prompt, options) {
    const response = await model.client.messages.create({
      model: model.config.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: 'You are Ian, an autonomous AI agent assistant. Be helpful, accurate, and concise.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  }

  /**
   * Generate with Google Gemini
   */
  async generateGemini(model, prompt, options) {
    const genModel = model.client.getGenerativeModel({ 
      model: model.config.model,
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      }
    });

    const result = await genModel.generateContent([
      'You are Ian, an autonomous AI agent assistant. Be helpful, accurate, and concise.',
      prompt
    ]);

    const response = await result.response;
    return response.text();
  }

  /**
   * Generate with local model
   */
  async generateLocal(model, prompt, options) {
    try {
      const response = await axios.post(`${model.endpoint}/api/generate`, {
        model: model.config.defaultModel,
        prompt: `You are Ian, an autonomous AI agent assistant. Be helpful, accurate, and concise.\n\n${prompt}`,
        stream: false,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens
        }
      });

      return response.data.response;
    } catch (error) {
      // Try alternative local API format (e.g., text-generation-webui)
      try {
        const response = await axios.post(`${model.endpoint}/v1/chat/completions`, {
          model: model.config.defaultModel,
          messages: [
            {
              role: 'system',
              content: 'You are Ian, an autonomous AI agent assistant. Be helpful, accurate, and concise.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature,
          max_tokens: options.maxTokens
        });

        return response.data.choices[0].message.content;
      } catch (altError) {
        throw new Error(`Local model request failed: ${error.message}`);
      }
    }
  }

  /**
   * Analyze content (for task analysis)
   */
  async analyze(content, options = {}) {
    const analysisPrompt = `
Analyze the following content and provide structured insights:

${content}

Provide analysis in the following format:
- Summary: Brief overview
- Key Points: Main elements identified
- Recommendations: Suggested actions
- Risk Assessment: Potential risks or concerns
- Next Steps: Recommended follow-up actions
`;

    return await this.generate(analysisPrompt, options);
  }

  /**
   * Get available models
   */
  async getAvailableModels() {
    if (!this.config) {
      await this.initialize();
    }

    const models = [];
    
    Object.entries(this.config.models).forEach(([name, config]) => {
      models.push({
        name: name,
        description: this.getModelDescription(name),
        available: config.enabled && this.models.has(name),
        model: config.model || config.defaultModel
      });
    });

    return models;
  }

  /**
   * Test model connection
   */
  async testModel(modelName) {
    try {
      console.log(chalk.blue(`🧪 Testing ${modelName} model...`));
      
      const testPrompt = 'Hello! Please respond with "Test successful" to confirm you are working correctly.';
      const response = await this.generate(testPrompt, { model: modelName });
      
      console.log(chalk.green(`✅ ${modelName} test successful`));
      console.log(chalk.gray(`Response: ${response.substring(0, 100)}...`));
      
      return { success: true, response };
    } catch (error) {
      console.log(chalk.red(`❌ ${modelName} test failed: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * Add local model
   */
  async addLocalModel(modelPath) {
    try {
      // This would integrate with local model management
      // For now, we'll just validate the path and add to config
      console.log(chalk.blue(`📦 Adding local model: ${modelPath}`));
      
      const config = await this.configManager.loadConfig();
      if (!config.models.local.models) {
        config.models.local.models = [];
      }
      
      config.models.local.models.push({
        name: modelPath.split('/').pop(),
        path: modelPath,
        added: new Date().toISOString()
      });
      
      await this.configManager.saveConfig(config);
      
      console.log(chalk.green(`✅ Local model added successfully`));
      return { success: true };
    } catch (error) {
      console.log(chalk.red(`❌ Failed to add local model: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * Get model description
   */
  getModelDescription(modelName) {
    const descriptions = {
      openai: 'OpenAI GPT models - Advanced language understanding and generation',
      anthropic: 'Anthropic Claude - Constitutional AI with strong reasoning capabilities',
      gemini: 'Google Gemini - Multimodal AI with strong coding capabilities',
      local: 'Local models - Self-hosted open-source models'
    };
    
    return descriptions[modelName] || 'AI language model';
  }

  /**
   * Check if model is available
   */
  isModelAvailable(modelName) {
    return this.models.has(modelName);
  }

  /**
   * Get model configuration
   */
  getModelConfig(modelName) {
    const model = this.models.get(modelName);
    return model ? model.config : null;
  }

  /**
   * Stream response (for real-time generation)
   */
  async streamGenerate(prompt, options = {}, onChunk) {
    const modelName = options.model || this.config.defaultModel;
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model ${modelName} not available`);
    }

    // Implement streaming based on model type
    switch (model.type) {
      case 'openai':
        return await this.streamOpenAI(model, prompt, options, onChunk);
      case 'anthropic':
        return await this.streamAnthropic(model, prompt, options, onChunk);
      default:
        // Fallback to regular generate for non-streaming models
        const response = await this.generate(prompt, options);
        if (onChunk) onChunk(response);
        return response;
    }
  }

  async streamOpenAI(model, prompt, options, onChunk) {
    // Implementation for OpenAI streaming
    // This would use the streaming API
    return await this.generate(prompt, { ...options, model: 'openai' });
  }

  async streamAnthropic(model, prompt, options, onChunk) {
    // Implementation for Anthropic streaming
    // This would use the streaming API
    return await this.generate(prompt, { ...options, model: 'anthropic' });
  }
}