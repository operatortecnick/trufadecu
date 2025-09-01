/**
 * Task Executor for Ian Agent - Handles autonomous task execution
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { Logger } from './logger.js';
import { FileSystemUtils } from './fileSystem.js';

export class TaskExecutor {
  constructor() {
    this.logger = new Logger();
    this.fileSystemUtils = new FileSystemUtils();
    this.taskHistory = [];
  }

  /**
   * Execute a task analysis
   */
  async execute(taskAnalysis, options = {}) {
    const { autonomous = false, dryRun = false } = options;
    
    this.logger.info('Executing task:', taskAnalysis.originalTask);
    
    try {
      // Validate task before execution
      await this.validateTask(taskAnalysis);
      
      if (dryRun) {
        return this.simulateExecution(taskAnalysis);
      }

      // Get user approval for risky tasks
      if (!autonomous && taskAnalysis.riskLevel === 'high') {
        const approved = await this.requestApproval(taskAnalysis);
        if (!approved) {
          return { status: 'cancelled', reason: 'User denied approval' };
        }
      }

      // Execute task steps
      const result = await this.executeSteps(taskAnalysis, options);
      
      // Record task execution
      this.recordExecution(taskAnalysis, result);
      
      return result;
    } catch (error) {
      this.logger.error('Task execution failed:', error);
      throw error;
    }
  }

  /**
   * Validate task before execution
   */
  async validateTask(taskAnalysis) {
    // Check if required files exist
    for (const step of taskAnalysis.steps) {
      if (step.requiredFiles) {
        for (const file of step.requiredFiles) {
          if (!await this.fileSystemUtils.exists(file)) {
            throw new Error(`Required file not found: ${file}`);
          }
        }
      }
    }

    // Check for conflicting operations
    const fileOperations = taskAnalysis.steps.filter(step => step.type === 'file_operation');
    const deleteOperations = fileOperations.filter(op => op.action === 'delete');
    const createOperations = fileOperations.filter(op => op.action === 'create');
    
    // Check for delete-create conflicts on same file
    for (const deleteOp of deleteOperations) {
      for (const createOp of createOperations) {
        if (deleteOp.target === createOp.target) {
          console.log(chalk.yellow(`⚠️  Warning: Task will delete and recreate ${deleteOp.target}`));
        }
      }
    }

    return true;
  }

  /**
   * Request user approval for risky tasks
   */
  async requestApproval(taskAnalysis) {
    console.log(chalk.red('\n⚠️  HIGH RISK TASK DETECTED'));
    console.log(chalk.yellow('Task:', taskAnalysis.originalTask));
    console.log(chalk.yellow('Risk Level:', taskAnalysis.riskLevel));
    console.log(chalk.yellow('Steps:'));
    
    taskAnalysis.steps.forEach((step, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${step.description}`));
    });

    const { approved } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'approved',
        message: 'Do you want to proceed with this task?',
        default: false
      }
    ]);

    return approved;
  }

  /**
   * Simulate task execution (dry run)
   */
  simulateExecution(taskAnalysis) {
    console.log(chalk.blue('\n🔍 DRY RUN - Task Simulation'));
    console.log(chalk.cyan('Task:', taskAnalysis.originalTask));
    console.log(chalk.cyan('Estimated Time:', taskAnalysis.estimatedTime));
    console.log(chalk.cyan('Risk Level:', taskAnalysis.riskLevel));
    
    console.log(chalk.cyan('\nSteps that would be executed:'));
    taskAnalysis.steps.forEach((step, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${step.description}`));
      if (step.files) {
        console.log(chalk.gray(`     Files: ${step.files.join(', ')}`));
      }
      if (step.commands) {
        console.log(chalk.gray(`     Commands: ${step.commands.join(', ')}`));
      }
    });

    return {
      status: 'simulated',
      task: taskAnalysis.originalTask,
      steps: taskAnalysis.steps.length,
      estimatedTime: taskAnalysis.estimatedTime,
      riskLevel: taskAnalysis.riskLevel
    };
  }

  /**
   * Execute task steps
   */
  async executeSteps(taskAnalysis, options) {
    const results = [];
    let currentStep = 0;
    
    console.log(chalk.blue(`\n🚀 Executing task: ${taskAnalysis.originalTask}`));
    console.log(chalk.gray(`Total steps: ${taskAnalysis.steps.length}`));

    for (const step of taskAnalysis.steps) {
      currentStep++;
      console.log(chalk.cyan(`\n📋 Step ${currentStep}/${taskAnalysis.steps.length}: ${step.description}`));
      
      try {
        const stepResult = await this.executeStep(step, options);
        results.push({
          step: currentStep,
          description: step.description,
          result: stepResult,
          status: 'completed'
        });
        
        console.log(chalk.green(`✅ Step ${currentStep} completed`));
      } catch (error) {
        this.logger.error(`Step ${currentStep} failed:`, error);
        results.push({
          step: currentStep,
          description: step.description,
          error: error.message,
          status: 'failed'
        });
        
        console.log(chalk.red(`❌ Step ${currentStep} failed: ${error.message}`));
        
        // Ask user if they want to continue
        if (!options.autonomous) {
          const { continueTask } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'continueTask',
              message: 'Step failed. Continue with remaining steps?',
              default: false
            }
          ]);
          
          if (!continueTask) {
            break;
          }
        }
      }
    }

    const completedSteps = results.filter(r => r.status === 'completed').length;
    const failedSteps = results.filter(r => r.status === 'failed').length;

    console.log(chalk.blue(`\n📊 Task execution summary:`));
    console.log(chalk.green(`✅ Completed: ${completedSteps} steps`));
    if (failedSteps > 0) {
      console.log(chalk.red(`❌ Failed: ${failedSteps} steps`));
    }

    return {
      status: failedSteps === 0 ? 'completed' : 'partial',
      task: taskAnalysis.originalTask,
      steps: results,
      completedSteps,
      failedSteps,
      totalSteps: taskAnalysis.steps.length
    };
  }

  /**
   * Execute individual step
   */
  async executeStep(step, options) {
    switch (step.type) {
      case 'file_operation':
        return await this.executeFileOperation(step);
      case 'command_execution':
        return await this.executeCommand(step);
      case 'code_generation':
        return await this.executeCodeGeneration(step);
      case 'analysis':
        return await this.executeAnalysis(step);
      case 'validation':
        return await this.executeValidation(step);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute file operations
   */
  async executeFileOperation(step) {
    const { action, target, content, source } = step;

    switch (action) {
      case 'create':
        if (content) {
          return await this.fileSystemUtils.writeFile(target, content);
        } else {
          return await this.fileSystemUtils.createDirectory(target);
        }
      
      case 'read':
        return await this.fileSystemUtils.readFile(target);
      
      case 'update':
        const existing = await this.fileSystemUtils.readFile(target);
        const updated = this.applyContentUpdate(existing.content, step.changes);
        return await this.fileSystemUtils.writeFile(target, updated);
      
      case 'delete':
        return await this.fileSystemUtils.delete(target);
      
      case 'copy':
        return await this.fileSystemUtils.copy(source, target);
      
      case 'move':
        return await this.fileSystemUtils.move(source, target);
      
      default:
        throw new Error(`Unknown file operation: ${action}`);
    }
  }

  /**
   * Execute system commands
   */
  async executeCommand(step) {
    const { command, args = [], cwd } = step;
    
    return new Promise((resolve, reject) => {
      console.log(chalk.gray(`Running: ${command} ${args.join(' ')}`));
      
      const process = spawn(command, args, {
        cwd: cwd || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(chalk.gray(data.toString().trim()));
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(chalk.red(data.toString().trim()));
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            command: `${command} ${args.join(' ')}`,
            exitCode: code,
            stdout,
            stderr
          });
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to execute command: ${error.message}`));
      });
    });
  }

  /**
   * Execute code generation
   */
  async executeCodeGeneration(step) {
    // This would typically use the model manager to generate code
    console.log(chalk.blue('🔧 Generating code...'));
    
    const { template, target, context } = step;
    let generatedCode = template;

    // Simple template replacement
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        generatedCode = generatedCode.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    if (target) {
      await this.fileSystemUtils.writeFile(target, generatedCode);
    }

    return {
      type: 'code_generation',
      target,
      generatedLines: generatedCode.split('\n').length
    };
  }

  /**
   * Execute analysis step
   */
  async executeAnalysis(step) {
    console.log(chalk.blue('🔍 Performing analysis...'));
    
    const { analysisType, targets } = step;
    const results = {};

    for (const target of targets) {
      switch (analysisType) {
        case 'file_structure':
          results[target] = await this.fileSystemUtils.getProjectStructure(target);
          break;
        case 'disk_usage':
          results[target] = await this.fileSystemUtils.getDiskUsage(target);
          break;
        default:
          results[target] = `Analysis type ${analysisType} not implemented`;
      }
    }

    return results;
  }

  /**
   * Execute validation step
   */
  async executeValidation(step) {
    console.log(chalk.blue('✓ Validating...'));
    
    const { validationType, targets, criteria } = step;
    const results = {};

    for (const target of targets) {
      try {
        switch (validationType) {
          case 'file_exists':
            results[target] = await this.fileSystemUtils.exists(target);
            break;
          case 'file_content':
            const content = await this.fileSystemUtils.readFile(target);
            results[target] = criteria.every(criterion => 
              content.content.includes(criterion)
            );
            break;
          default:
            results[target] = false;
        }
      } catch (error) {
        results[target] = false;
      }
    }

    return results;
  }

  /**
   * Apply content updates to existing file
   */
  applyContentUpdate(content, changes) {
    let updated = content;
    
    for (const change of changes) {
      switch (change.type) {
        case 'replace':
          updated = updated.replace(change.find, change.replace);
          break;
        case 'insert':
          const lines = updated.split('\n');
          lines.splice(change.line, 0, change.content);
          updated = lines.join('\n');
          break;
        case 'append':
          updated += '\n' + change.content;
          break;
      }
    }
    
    return updated;
  }

  /**
   * Record task execution for history
   */
  recordExecution(taskAnalysis, result) {
    const record = {
      timestamp: new Date().toISOString(),
      task: taskAnalysis.originalTask,
      status: result.status,
      steps: result.totalSteps,
      completed: result.completedSteps,
      failed: result.failedSteps,
      duration: Date.now() - taskAnalysis.startTime
    };

    this.taskHistory.push(record);
    this.logger.info('Task execution recorded', record);
  }

  /**
   * Get task execution history
   */
  getTaskHistory() {
    return this.taskHistory;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    const total = this.taskHistory.length;
    const completed = this.taskHistory.filter(task => task.status === 'completed').length;
    const failed = this.taskHistory.filter(task => task.status === 'failed').length;
    const partial = this.taskHistory.filter(task => task.status === 'partial').length;

    return {
      total,
      completed,
      failed,
      partial,
      successRate: total > 0 ? (completed / total * 100).toFixed(2) : 0
    };
  }
}