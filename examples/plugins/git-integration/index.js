/**
 * Git Integration Plugin for Ian Agent
 * Provides Git operations and repository management
 */

import { spawn } from 'child_process';
import chalk from 'chalk';

export default class GitIntegrationPlugin {
  constructor() {
    this.name = 'git-integration';
    this.version = '1.0.0';
    
    this.hooks = [
      {
        event: 'beforeTaskExecution',
        handler: this.checkGitStatus.bind(this),
        priority: 5
      },
      {
        event: 'afterTaskExecution',
        handler: this.suggestCommit.bind(this),
        priority: 5
      }
    ];
    
    this.commands = [
      {
        name: 'status',
        description: 'Show git status with analysis',
        usage: 'status',
        handler: this.gitStatus.bind(this)
      },
      {
        name: 'smart-commit',
        description: 'Generate intelligent commit message',
        usage: 'smart-commit [files...]',
        handler: this.smartCommit.bind(this)
      },
      {
        name: 'branch-analysis',
        description: 'Analyze branch differences',
        usage: 'branch-analysis [branch]',
        handler: this.branchAnalysis.bind(this)
      },
      {
        name: 'conflict-helper',
        description: 'Help resolve merge conflicts',
        usage: 'conflict-helper',
        handler: this.conflictHelper.bind(this)
      }
    ];
  }

  async initialize() {
    console.log(chalk.green(`✅ ${this.name} plugin initialized`));
  }

  async cleanup() {
    console.log(chalk.yellow(`🧹 ${this.name} plugin cleaned up`));
  }

  /**
   * Hook: Check git status before task execution
   */
  async checkGitStatus(data) {
    try {
      const status = await this.runGitCommand(['status', '--porcelain']);
      if (status.trim()) {
        console.log(chalk.yellow('⚠️  Uncommitted changes detected in repository'));
        return { hasUncommittedChanges: true, status };
      }
      return { hasUncommittedChanges: false };
    } catch (error) {
      return { gitAvailable: false };
    }
  }

  /**
   * Hook: Suggest commit after task execution
   */
  async suggestCommit(data) {
    if (data.modifiedFiles && data.modifiedFiles.length > 0) {
      console.log(chalk.blue('💡 Suggestion: Consider committing the changes made by Ian'));
      return { suggestCommit: true, files: data.modifiedFiles };
    }
    return { suggestCommit: false };
  }

  /**
   * Command: Enhanced git status
   */
  async gitStatus(args) {
    try {
      const status = await this.runGitCommand(['status', '--short']);
      const branch = await this.runGitCommand(['branch', '--show-current']);
      const commits = await this.runGitCommand(['log', '--oneline', '-5']);
      
      const result = {
        branch: branch.trim(),
        status: status.trim(),
        recentCommits: commits.trim().split('\n').filter(line => line.trim()),
        summary: this.analyzeGitStatus(status)
      };

      console.log(chalk.cyan('\n📊 Git Repository Status:'));
      console.log(chalk.green(`Branch: ${result.branch}`));
      console.log(chalk.blue('\nStatus:'));
      
      if (result.status) {
        console.log(result.status);
        console.log(chalk.yellow('\nSummary:'));
        console.log(`  Modified: ${result.summary.modified}`);
        console.log(`  Added: ${result.summary.added}`);
        console.log(`  Deleted: ${result.summary.deleted}`);
        console.log(`  Untracked: ${result.summary.untracked}`);
      } else {
        console.log(chalk.green('  Working tree clean'));
      }

      console.log(chalk.blue('\nRecent Commits:'));
      result.recentCommits.forEach(commit => {
        console.log(`  ${commit}`);
      });

      return result;
    } catch (error) {
      throw new Error(`Git status failed: ${error.message}`);
    }
  }

  /**
   * Command: Smart commit with AI-generated message
   */
  async smartCommit(args) {
    try {
      const diff = await this.runGitCommand(['diff', '--cached']);
      if (!diff.trim()) {
        throw new Error('No staged changes found. Stage your changes first with git add.');
      }

      // In a real implementation, this would use the AI model to analyze the diff
      const commitMessage = this.generateCommitMessage(diff);
      
      console.log(chalk.blue('🤖 Generated commit message:'));
      console.log(chalk.green(`"${commitMessage}"`));
      
      // For safety, we'll just show the message instead of committing
      console.log(chalk.yellow('\nTo commit with this message, run:'));
      console.log(chalk.gray(`git commit -m "${commitMessage}"`));
      
      return { message: commitMessage, diff: diff.substring(0, 500) + '...' };
    } catch (error) {
      throw new Error(`Smart commit failed: ${error.message}`);
    }
  }

  /**
   * Command: Analyze branch differences
   */
  async branchAnalysis(args) {
    try {
      const targetBranch = args.branch || 'main';
      const currentBranch = await this.runGitCommand(['branch', '--show-current']);
      
      const ahead = await this.runGitCommand(['rev-list', '--count', `${targetBranch}..HEAD`]);
      const behind = await this.runGitCommand(['rev-list', '--count', `HEAD..${targetBranch}`]);
      const diff = await this.runGitCommand(['diff', '--stat', targetBranch]);
      
      const result = {
        currentBranch: currentBranch.trim(),
        targetBranch,
        ahead: parseInt(ahead.trim()),
        behind: parseInt(behind.trim()),
        diffStat: diff.trim()
      };

      console.log(chalk.cyan(`\n🔍 Branch Analysis: ${result.currentBranch} vs ${targetBranch}`));
      console.log(chalk.green(`Commits ahead: ${result.ahead}`));
      console.log(chalk.red(`Commits behind: ${result.behind}`));
      
      if (result.diffStat) {
        console.log(chalk.blue('\nFile changes:'));
        console.log(result.diffStat);
      }

      return result;
    } catch (error) {
      throw new Error(`Branch analysis failed: ${error.message}`);
    }
  }

  /**
   * Command: Help resolve merge conflicts
   */
  async conflictHelper(args) {
    try {
      const conflicts = await this.runGitCommand(['diff', '--name-only', '--diff-filter=U']);
      
      if (!conflicts.trim()) {
        return { message: 'No merge conflicts detected', conflicts: [] };
      }

      const conflictFiles = conflicts.trim().split('\n');
      
      console.log(chalk.red('🔴 Merge conflicts detected in:'));
      conflictFiles.forEach(file => {
        console.log(chalk.yellow(`  - ${file}`));
      });

      console.log(chalk.blue('\n💡 Conflict resolution steps:'));
      console.log('1. Open each conflicted file in your editor');
      console.log('2. Look for conflict markers: <<<<<<<, =======, >>>>>>>');
      console.log('3. Resolve conflicts by choosing the correct code');
      console.log('4. Remove conflict markers');
      console.log('5. Stage resolved files with: git add <file>');
      console.log('6. Complete merge with: git commit');

      return { conflicts: conflictFiles, resolved: false };
    } catch (error) {
      throw new Error(`Conflict helper failed: ${error.message}`);
    }
  }

  /**
   * Run git command and return output
   */
  async runGitCommand(args) {
    return new Promise((resolve, reject) => {
      const git = spawn('git', args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      git.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      git.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      git.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Git command failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Analyze git status output
   */
  analyzeGitStatus(status) {
    const lines = status.split('\n').filter(line => line.trim());
    const summary = {
      modified: 0,
      added: 0,
      deleted: 0,
      untracked: 0
    };

    lines.forEach(line => {
      const statusCode = line.substring(0, 2);
      if (statusCode.includes('M')) summary.modified++;
      if (statusCode.includes('A')) summary.added++;
      if (statusCode.includes('D')) summary.deleted++;
      if (statusCode.includes('?')) summary.untracked++;
    });

    return summary;
  }

  /**
   * Generate commit message from diff
   */
  generateCommitMessage(diff) {
    // Simple heuristic-based commit message generation
    // In a real implementation, this would use AI
    
    if (diff.includes('package.json')) {
      return 'Update dependencies and package configuration';
    }
    
    if (diff.includes('README') || diff.includes('CHANGELOG')) {
      return 'Update documentation';
    }
    
    if (diff.includes('test/') || diff.includes('.test.') || diff.includes('.spec.')) {
      return 'Add/update tests';
    }
    
    if (diff.includes('function ') || diff.includes('class ')) {
      return 'Implement new functionality';
    }
    
    if (diff.includes('fix') || diff.includes('bug')) {
      return 'Fix bug and improve stability';
    }
    
    return 'Update code and improve functionality';
  }
}