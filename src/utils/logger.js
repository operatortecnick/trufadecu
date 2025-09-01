/**
 * Logger utility for Ian Agent
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.logFile = options.logFile || path.join(os.homedir(), '.ian', 'logs', 'ian.log');
    this.verbose = options.verbose || false;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.colors = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blue,
      debug: chalk.gray
    };
    
    this.initialize();
  }

  /**
   * Initialize logger
   */
  async initialize() {
    try {
      await fs.ensureDir(path.dirname(this.logFile));
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  /**
   * Log message
   */
  log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const colorFn = this.colors[level] || chalk.white;
    
    // Console output
    if (this.verbose || level === 'error') {
      const formattedMessage = typeof message === 'object' 
        ? JSON.stringify(message, null, 2)
        : message;
      
      console.log(colorFn(`[${timestamp}] ${level.toUpperCase()}: ${formattedMessage}`));
      
      if (Object.keys(meta).length > 0) {
        console.log(chalk.gray('  Meta:', JSON.stringify(meta, null, 2)));
      }
    }

    // File output
    this.writeToFile(level, message, meta, timestamp);
  }

  /**
   * Write to log file
   */
  async writeToFile(level, message, meta, timestamp) {
    try {
      const logEntry = {
        timestamp,
        level,
        message: typeof message === 'object' ? JSON.stringify(message) : message,
        meta
      };
      
      await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Error logging
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Debug logging
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Set log level
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Set verbose mode
   */
  setVerbose(verbose) {
    this.verbose = verbose;
  }

  /**
   * Get recent logs
   */
  async getRecentLogs(count = 100) {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n');
      
      return lines
        .slice(-count)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return line;
          }
        });
    } catch (error) {
      this.error('Failed to read log file:', error);
      return [];
    }
  }

  /**
   * Clear logs
   */
  async clearLogs() {
    try {
      await fs.writeFile(this.logFile, '');
      this.info('Log file cleared');
    } catch (error) {
      this.error('Failed to clear log file:', error);
    }
  }
}