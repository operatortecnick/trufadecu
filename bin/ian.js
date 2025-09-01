#!/usr/bin/env node

/**
 * Ian - Autonomous AI Agent CLI
 * Entry point for the command line interface
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main CLI module
import('../src/index.js').then(({ default: main }) => {
  main();
}).catch(error => {
  console.error('Failed to start Ian:', error.message);
  process.exit(1);
});