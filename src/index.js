/**
 * Main entry point for Ian - Autonomous AI Agent
 */

import { program } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

import { IanAgent } from './core/agent.js';
import { ConfigManager } from './core/config.js';
import { Logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version info
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

const logger = new Logger();
const configManager = new ConfigManager();

// Initialize the main CLI
function initializeCLI() {
  program
    .name('ian')
    .description('Ian - Autonomous AI Agent CLI')
    .version(packageJson.version);

  // Chat command - Interactive mode
  program
    .command('chat')
    .description('Start interactive chat session with Ian')
    .option('-m, --model <model>', 'AI model to use (openai, anthropic, gemini, local)', 'openai')
    .option('-t, --temperature <number>', 'Model temperature (0-1)', '0.7')
    .option('--autonomous', 'Enable autonomous mode for advanced tasks')
    .action(async (options) => {
      await startChat(options);
    });

  // Execute command - Run a single task
  program
    .command('exec <task>')
    .description('Execute a specific task autonomously')
    .option('-m, --model <model>', 'AI model to use', 'openai')
    .option('-f, --file <file>', 'File context for the task')
    .option('-o, --output <file>', 'Output file for results')
    .option('--dry-run', 'Show what would be done without executing')
    .action(async (task, options) => {
      await executeTask(task, options);
    });

  // Configure command - Setup and manage configuration
  program
    .command('config')
    .description('Manage Ian configuration')
    .option('--setup', 'Run initial setup wizard')
    .option('--show', 'Show current configuration')
    .option('--reset', 'Reset configuration to defaults')
    .action(async (options) => {
      await manageConfig(options);
    });

  // Models command - Manage AI models
  program
    .command('models')
    .description('Manage AI models and providers')
    .option('--list', 'List available models')
    .option('--test <model>', 'Test a specific model')
    .option('--add-local <path>', 'Add a local model')
    .action(async (options) => {
      await manageModels(options);
    });

  // Plugins command - Manage plugins
  program
    .command('plugins')
    .description('Manage Ian plugins')
    .option('--list', 'List installed plugins')
    .option('--install <plugin>', 'Install a plugin')
    .option('--remove <plugin>', 'Remove a plugin')
    .action(async (options) => {
      await managePlugins(options);
    });

  // Parse command line arguments
  program.parse();
}

// Start interactive chat session
async function startChat(options) {
  try {
    console.log(chalk.blue('🤖 Starting Ian - Autonomous AI Agent'));
    console.log(chalk.gray(`Model: ${options.model} | Temperature: ${options.temperature}`));
    
    if (options.autonomous) {
      console.log(chalk.yellow('⚡ Autonomous mode enabled - Ian can perform advanced tasks'));
    }

    const agent = new IanAgent(options);
    await agent.startInteractiveSession();
  } catch (error) {
    logger.error('Failed to start chat session:', error);
    process.exit(1);
  }
}

// Execute a specific task
async function executeTask(task, options) {
  try {
    console.log(chalk.blue(`🎯 Executing task: ${task}`));
    
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 Dry run mode - showing what would be done'));
    }

    const agent = new IanAgent(options);
    const result = await agent.executeTask(task, options);
    
    if (options.output) {
      await agent.saveResult(result, options.output);
      console.log(chalk.green(`✅ Results saved to: ${options.output}`));
    } else {
      console.log(chalk.green('✅ Task completed successfully'));
      console.log(result);
    }
  } catch (error) {
    logger.error('Failed to execute task:', error);
    process.exit(1);
  }
}

// Manage configuration
async function manageConfig(options) {
  try {
    if (options.setup) {
      await configManager.runSetupWizard();
    } else if (options.show) {
      await configManager.showConfiguration();
    } else if (options.reset) {
      await configManager.resetConfiguration();
    } else {
      console.log(chalk.yellow('Use --setup, --show, or --reset with the config command'));
    }
  } catch (error) {
    logger.error('Configuration error:', error);
    process.exit(1);
  }
}

// Manage AI models
async function manageModels(options) {
  try {
    const agent = new IanAgent();
    
    if (options.list) {
      await agent.listAvailableModels();
    } else if (options.test) {
      await agent.testModel(options.test);
    } else if (options.addLocal) {
      await agent.addLocalModel(options.addLocal);
    } else {
      console.log(chalk.yellow('Use --list, --test, or --add-local with the models command'));
    }
  } catch (error) {
    logger.error('Models management error:', error);
    process.exit(1);
  }
}

// Manage plugins
async function managePlugins(options) {
  try {
    const agent = new IanAgent();
    
    if (options.list) {
      await agent.listPlugins();
    } else if (options.install) {
      await agent.installPlugin(options.install);
    } else if (options.remove) {
      await agent.removePlugin(options.remove);
    } else {
      console.log(chalk.yellow('Use --list, --install, or --remove with the plugins command'));
    }
  } catch (error) {
    logger.error('Plugin management error:', error);
    process.exit(1);
  }
}

// Main function
export default function main() {
  // Display banner
  console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║        🤖 IAN - AI Agent CLI          ║
║     Autonomous • Intelligent • CLI    ║
╚═══════════════════════════════════════╝
`));

  // Initialize CLI
  initializeCLI();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});