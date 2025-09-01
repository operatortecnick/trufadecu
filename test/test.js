/**
 * Basic test for Ian Agent
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import assert from 'assert';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import modules to test
import { Logger } from '../src/utils/logger.js';
import { FileSystemUtils } from '../src/utils/fileSystem.js';
import { ConfigManager } from '../src/core/config.js';

async function runTests() {
  console.log('🧪 Starting Ian Agent Tests...\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test Logger
  totalTests++;
  try {
    console.log('Testing Logger...');
    const logger = new Logger({ verbose: false });
    logger.info('Test log message');
    logger.debug('Debug message');
    logger.warn('Warning message');
    console.log('✅ Logger test passed');
    passedTests++;
  } catch (error) {
    console.log('❌ Logger test failed:', error.message);
  }

  // Test FileSystemUtils
  totalTests++;
  try {
    console.log('Testing FileSystemUtils...');
    const fsUtils = new FileSystemUtils();
    
    // Test file operations
    const testDir = join(__dirname, 'temp');
    await fs.ensureDir(testDir);
    
    const testFile = join(testDir, 'test.txt');
    await fsUtils.writeFile(testFile, 'Hello Ian!');
    
    const content = await fsUtils.readFile(testFile);
    assert(content.content === 'Hello Ian!', 'File content mismatch');
    
    const exists = await fsUtils.exists(testFile);
    assert(exists === true, 'File should exist');
    
    await fs.remove(testDir);
    console.log('✅ FileSystemUtils test passed');
    passedTests++;
  } catch (error) {
    console.log('❌ FileSystemUtils test failed:', error.message);
  }

  // Test ConfigManager
  totalTests++;
  try {
    console.log('Testing ConfigManager...');
    const configManager = new ConfigManager();
    
    // This test just checks if the class can be instantiated
    // and basic methods exist
    assert(typeof configManager.loadConfig === 'function', 'loadConfig method should exist');
    assert(typeof configManager.saveConfig === 'function', 'saveConfig method should exist');
    assert(typeof configManager.runSetupWizard === 'function', 'runSetupWizard method should exist');
    
    console.log('✅ ConfigManager test passed');
    passedTests++;
  } catch (error) {
    console.log('❌ ConfigManager test failed:', error.message);
  }

  // Test project structure
  totalTests++;
  try {
    console.log('Testing project structure...');
    const projectRoot = join(__dirname, '..');
    
    // Check if essential files exist
    const packageJsonExists = await fs.pathExists(join(projectRoot, 'package.json'));
    assert(packageJsonExists, 'package.json should exist');
    
    const mainIndexExists = await fs.pathExists(join(projectRoot, 'src', 'index.js'));
    assert(mainIndexExists, 'src/index.js should exist');
    
    const binFileExists = await fs.pathExists(join(projectRoot, 'bin', 'ian.js'));
    assert(binFileExists, 'bin/ian.js should exist');
    
    console.log('✅ Project structure test passed');
    passedTests++;
  } catch (error) {
    console.log('❌ Project structure test failed:', error.message);
  }

  // Test basic CLI imports
  totalTests++;
  try {
    console.log('Testing basic CLI imports...');
    
    // Try to import the main index file
    const mainModule = await import('../src/index.js');
    assert(typeof mainModule.default === 'function', 'Main module should export a function');
    
    console.log('✅ CLI imports test passed');
    passedTests++;
  } catch (error) {
    console.log('❌ CLI imports test failed:', error.message);
  }

  // Summary
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Ian Agent is ready to use.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { runTests };