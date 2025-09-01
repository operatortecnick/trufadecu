/**
 * IanAgent - Core autonomous AI agent class
 * Inspired by Claude Code CLI and Gemini Gcloud CLI
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

import { ModelManager } from '../models/modelManager.js';
import { FileSystemUtils } from '../utils/fileSystem.js';
import { CodeAnalyzer } from '../utils/codeAnalyzer.js';
import { TaskExecutor } from '../utils/taskExecutor.js';
import { Logger } from '../utils/logger.js';
import { PluginManager } from './pluginManager.js';

export class IanAgent {
  constructor(options = {}) {
    this.options = options;
    this.logger = new Logger();
    this.modelManager = new ModelManager();
    this.fileSystemUtils = new FileSystemUtils();
    this.codeAnalyzer = new CodeAnalyzer();
    this.taskExecutor = new TaskExecutor();
    this.pluginManager = new PluginManager();
    
    this.conversationHistory = [];
    this.workingDirectory = process.cwd();
    this.autonomousMode = options.autonomous || false;
    
    this.logger.info('Ian Agent initialized', { 
      model: options.model || 'openai',
      autonomous: this.autonomousMode 
    });
  }

  /**
   * Start interactive chat session
   */
  async startInteractiveSession() {
    console.log(chalk.green('🚀 Ian is ready! Type your requests or /help for commands.'));
    console.log(chalk.gray('Working directory:', this.workingDirectory));
    
    while (true) {
      try {
        const { input } = await inquirer.prompt([
          {
            type: 'input',
            name: 'input',
            message: chalk.blue('You:'),
            prefix: '',
          }
        ]);

        if (input.toLowerCase() === '/exit' || input.toLowerCase() === '/quit') {
          console.log(chalk.yellow('👋 Goodbye!'));
          break;
        }

        if (input.toLowerCase() === '/help') {
          this.showHelp();
          continue;
        }

        if (input.toLowerCase() === '/clear') {
          console.clear();
          continue;
        }

        if (input.startsWith('/')) {
          await this.handleCommand(input);
          continue;
        }

        // Process the request
        const response = await this.processRequest(input);
        console.log(chalk.green('\nIan:'), response);
        
      } catch (error) {
        this.logger.error('Error in interactive session:', error);
        console.log(chalk.red('❌ Sorry, I encountered an error. Please try again.'));
      }
    }
  }

  /**
   * Execute a specific task
   */
  async executeTask(task, options = {}) {
    this.logger.info('Executing task:', task);
    
    try {
      // Analyze the task
      const taskAnalysis = await this.analyzeTask(task, options);
      
      if (options.dryRun) {
        return this.generateDryRunReport(taskAnalysis);
      }

      // Execute the task
      const result = await this.taskExecutor.execute(taskAnalysis, {
        autonomous: this.autonomousMode,
        fileContext: options.file,
        ...options
      });

      return result;
    } catch (error) {
      this.logger.error('Task execution failed:', error);
      throw error;
    }
  }

  /**
   * Process a user request
   */
  async processRequest(request) {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: request,
      timestamp: new Date().toISOString()
    });

    // Analyze the request to determine intent
    const intent = await this.analyzeIntent(request);
    
    let response;
    
    switch (intent.type) {
      case 'code_analysis':
        response = await this.handleCodeAnalysis(intent);
        break;
      case 'file_operation':
        response = await this.handleFileOperation(intent);
        break;
      case 'code_generation':
        response = await this.handleCodeGeneration(intent);
        break;
      case 'autonomous_task':
        response = await this.handleAutonomousTask(intent);
        break;
      case 'general_chat':
      default:
        response = await this.handleGeneralChat(request);
        break;
    }

    // Add response to conversation history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    return response;
  }

  /**
   * Analyze task requirements
   */
  async analyzeTask(task, options) {
    const context = {
      task,
      workingDirectory: this.workingDirectory,
      fileContext: options.file ? await this.fileSystemUtils.readFile(options.file) : null,
      availableFiles: await this.fileSystemUtils.listFiles(this.workingDirectory),
      projectStructure: await this.analyzeProjectStructure()
    };

    const analysis = await this.modelManager.analyze(
      `Analyze this task and break it down into actionable steps:\n\nTask: ${task}\n\nContext: ${JSON.stringify(context, null, 2)}`,
      { model: this.options.model }
    );

    return {
      originalTask: task,
      steps: this.parseTaskSteps(analysis),
      context,
      estimatedTime: this.estimateTaskTime(analysis),
      riskLevel: this.assessRiskLevel(analysis)
    };
  }

  /**
   * Analyze user intent from request
   */
  async analyzeIntent(request) {
    const codeKeywords = ['code', 'function', 'class', 'implement', 'debug', 'fix', 'refactor'];
    const fileKeywords = ['file', 'create', 'read', 'write', 'delete', 'list', 'search'];
    const autonomousKeywords = ['automate', 'autonomous', 'do it', 'handle', 'manage'];

    const requestLower = request.toLowerCase();

    if (codeKeywords.some(keyword => requestLower.includes(keyword))) {
      return { type: 'code_analysis', request, keywords: codeKeywords };
    }

    if (fileKeywords.some(keyword => requestLower.includes(keyword))) {
      return { type: 'file_operation', request, keywords: fileKeywords };
    }

    if (autonomousKeywords.some(keyword => requestLower.includes(keyword)) && this.autonomousMode) {
      return { type: 'autonomous_task', request, keywords: autonomousKeywords };
    }

    return { type: 'general_chat', request };
  }

  /**
   * Handle code analysis requests
   */
  async handleCodeAnalysis(intent) {
    const files = await this.fileSystemUtils.findCodeFiles(this.workingDirectory);
    const analysis = await this.codeAnalyzer.analyzeProject(files);
    
    const prompt = `
Analyze this code project and respond to: ${intent.request}

Project Analysis:
${JSON.stringify(analysis, null, 2)}

Provide detailed insights and recommendations.
`;

    return await this.modelManager.generate(prompt, { model: this.options.model });
  }

  /**
   * Handle file operations
   */
  async handleFileOperation(intent) {
    const request = intent.request.toLowerCase();
    
    if (request.includes('create')) {
      return await this.handleFileCreation(intent);
    } else if (request.includes('read') || request.includes('show')) {
      return await this.handleFileReading(intent);
    } else if (request.includes('list')) {
      return await this.handleFileListing(intent);
    } else {
      return await this.handleGeneralFileOperation(intent);
    }
  }

  /**
   * Handle code generation requests
   */
  async handleCodeGeneration(intent) {
    const prompt = `
Generate code based on this request: ${intent.request}

Working directory: ${this.workingDirectory}
Project context: ${JSON.stringify(await this.analyzeProjectStructure(), null, 2)}

Provide working, production-ready code with proper error handling and documentation.
`;

    return await this.modelManager.generate(prompt, { model: this.options.model });
  }

  /**
   * Handle autonomous tasks
   */
  async handleAutonomousTask(intent) {
    if (!this.autonomousMode) {
      return "Autonomous mode is not enabled. Use --autonomous flag to enable advanced autonomous capabilities.";
    }

    const taskAnalysis = await this.analyzeTask(intent.request, {});
    
    if (taskAnalysis.riskLevel === 'high') {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: chalk.red('⚠️  This task has high risk. Do you want to proceed?'),
          default: false
        }
      ]);

      if (!confirm) {
        return "Task cancelled due to high risk level.";
      }
    }

    return await this.taskExecutor.execute(taskAnalysis, { autonomous: true });
  }

  /**
   * Handle general chat
   */
  async handleGeneralChat(request) {
    const context = this.conversationHistory.slice(-10); // Last 10 messages
    const prompt = `
You are Ian, an autonomous AI agent assistant. Respond helpfully to: ${request}

Conversation context:
${context.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current working directory: ${this.workingDirectory}
`;

    return await this.modelManager.generate(prompt, { model: this.options.model });
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(chalk.cyan(`
📋 Ian Commands:

Chat Commands:
  /help     - Show this help message
  /clear    - Clear the screen
  /exit     - Exit Ian
  /status   - Show agent status
  /models   - List available models
  /plugins  - List loaded plugins

File Operations:
  "read file.txt"           - Read file contents
  "create new file"         - Create a new file
  "list files"              - List directory contents
  "analyze project"         - Analyze project structure

Code Operations:
  "debug this function"     - Debug code
  "implement feature X"     - Generate code
  "refactor this code"      - Improve code quality
  "explain this algorithm"  - Code explanation

Autonomous Tasks (when enabled):
  "automate deployment"     - Automated deployment
  "setup development env"   - Environment setup
  "optimize performance"    - Performance optimization

💡 Tips:
- Be specific in your requests for better results
- Use file names and paths when relevant
- Ask for explanations if you need clarification
`));
  }

  /**
   * Handle special commands
   */
  async handleCommand(command) {
    const cmd = command.toLowerCase();
    
    switch (cmd) {
      case '/status':
        await this.showStatus();
        break;
      case '/models':
        await this.listAvailableModels();
        break;
      case '/plugins':
        await this.listPlugins();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        this.showHelp();
    }
  }

  /**
   * Show agent status
   */
  async showStatus() {
    console.log(chalk.cyan(`
📊 Ian Agent Status:

Model: ${this.options.model || 'openai'}
Autonomous Mode: ${this.autonomousMode ? '✅ Enabled' : '❌ Disabled'}
Working Directory: ${this.workingDirectory}
Conversation History: ${this.conversationHistory.length} messages
Plugins Loaded: ${await this.pluginManager.getLoadedPluginCount()}
`));
  }

  /**
   * List available models
   */
  async listAvailableModels() {
    const models = await this.modelManager.getAvailableModels();
    console.log(chalk.cyan('\n🤖 Available Models:'));
    models.forEach(model => {
      const status = model.available ? '✅' : '❌';
      console.log(`  ${status} ${model.name} - ${model.description}`);
    });
  }

  /**
   * List loaded plugins
   */
  async listPlugins() {
    const plugins = await this.pluginManager.getLoadedPlugins();
    console.log(chalk.cyan('\n🔌 Loaded Plugins:'));
    plugins.forEach(plugin => {
      console.log(`  ✅ ${plugin.name} - ${plugin.description}`);
    });
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure() {
    try {
      const structure = await this.fileSystemUtils.getProjectStructure(this.workingDirectory);
      return structure;
    } catch (error) {
      this.logger.error('Failed to analyze project structure:', error);
      return null;
    }
  }

  /**
   * Save results to file
   */
  async saveResult(result, outputFile) {
    await this.fileSystemUtils.writeFile(outputFile, JSON.stringify(result, null, 2));
  }

  // Additional helper methods...
  parseTaskSteps(analysis) {
    // Parse the AI analysis into actionable steps
    return [];
  }

  estimateTaskTime(analysis) {
    // Estimate task completion time
    return 'Unknown';
  }

  assessRiskLevel(analysis) {
    // Assess risk level of the task
    return 'medium';
  }

  generateDryRunReport(taskAnalysis) {
    return `Dry run report for: ${taskAnalysis.originalTask}`;
  }

  // File operation handlers
  async handleFileCreation(intent) { return "File creation handled"; }
  async handleFileReading(intent) { return "File reading handled"; }
  async handleFileListing(intent) { return "File listing handled"; }
  async handleGeneralFileOperation(intent) { return "General file operation handled"; }

  // Model testing and management
  async testModel(modelName) { return this.modelManager.testModel(modelName); }
  async addLocalModel(modelPath) { return this.modelManager.addLocalModel(modelPath); }
  async installPlugin(pluginName) { return this.pluginManager.installPlugin(pluginName); }
  async removePlugin(pluginName) { return this.pluginManager.removePlugin(pluginName); }
}