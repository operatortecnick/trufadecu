# Ian Agent Demo Script

This script demonstrates the various capabilities of Ian Agent.

## Setup Demo Environment

```bash
# 1. Create a demo project
mkdir ian-demo
cd ian-demo

# 2. Initialize a sample project
cat > package.json << 'EOF'
{
  "name": "ian-demo-project",
  "version": "1.0.0",
  "description": "Demo project for Ian Agent",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo 'No tests yet'"
  }
}
EOF

# 3. Create sample files
cat > index.js << 'EOF'
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Ian Demo!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

cat > utils.js << 'EOF'
function calculateSum(a, b) {
  return a + b;
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = { calculateSum, validateEmail };
EOF

# 4. Create a README
cat > README.md << 'EOF'
# Demo Project

A simple Express.js application for demonstrating Ian Agent capabilities.

## Installation

npm install express

## Usage

npm start
EOF
```

## Demo Commands

### 1. Basic Chat Interaction

```bash
# Start interactive session
ian chat

# Example conversation:
# You: Hello Ian, can you help me understand this project?
# Ian: I'll analyze your project structure and help you understand it.

# You: What programming language is used here?
# Ian: Based on the files, this is a Node.js project using JavaScript...

# You: Can you suggest improvements?
# Ian: Here are some suggestions for your project...
```

### 2. Project Analysis

```bash
# Analyze project structure
ian exec "analyze this project structure and provide insights"

# Expected output:
# 📊 Project Analysis Results:
# - Language: JavaScript (Node.js)
# - Framework: Express.js
# - Files: 4 total
# - Complexity: Low
# - Recommendations: Add error handling, tests, documentation
```

### 3. Code Generation

```bash
# Generate tests for the utilities
ian exec "create unit tests for the functions in utils.js" --output tests/utils.test.js

# Generate API documentation
ian exec "create API documentation for the Express server" --output API.md

# Create error handling middleware
ian exec "add error handling middleware to the Express app" --file index.js
```

### 4. File Operations

```bash
# List project files with analysis
ian exec "list all files in this project and categorize them"

# Create project structure documentation
ian exec "create a project structure diagram" --output STRUCTURE.md

# Organize files
ian exec "create proper directory structure for this project"
```

### 5. Autonomous Task Execution

```bash
# Enable autonomous mode for complex tasks
ian chat --autonomous

# Example autonomous tasks:
# You: Setup this project for production deployment
# Ian: I'll configure production settings, add Docker support, and create deployment scripts.

# You: Improve code quality and add best practices
# Ian: I'll add error handling, logging, tests, and documentation.
```

### 6. Model Comparison

```bash
# Test different models on the same task
ian exec "explain the code in index.js" --model openai
ian exec "explain the code in index.js" --model anthropic
ian exec "explain the code in index.js" --model gemini
```

### 7. Plugin Usage

```bash
# List available plugins
ian plugins --list

# Install Git integration plugin
ian plugins --install file:../examples/plugins/git-integration

# Use Git plugin commands
ian plugins --execute git-integration status
ian plugins --execute git-integration smart-commit
```

### 8. Configuration Management

```bash
# Show current configuration
ian config --show

# Switch default model
ian config --set defaultModel anthropic

# Test model connections
ian models --test openai
ian models --test anthropic
ian models --test local
```

### 9. Dry Run Examples

```bash
# Preview what Ian would do without executing
ian exec "refactor this entire codebase for better performance" --dry-run

# Preview file operations
ian exec "reorganize project structure following Node.js best practices" --dry-run
```

### 10. Advanced Use Cases

```bash
# Code review and suggestions
ian exec "review the code in this project and suggest security improvements"

# Performance optimization
ian exec "analyze performance bottlenecks and suggest optimizations"

# Documentation generation
ian exec "generate comprehensive documentation for this project"

# CI/CD setup
ian exec "create GitHub Actions workflow for testing and deployment"
```

## Sample Conversation Flows

### Flow 1: New Developer Onboarding

```
You: I'm new to this project. Can you help me understand it?

Ian: I'll analyze your project and provide an overview.

[Analysis of project structure, dependencies, and functionality]

You: How do I run this project?

Ian: Based on your package.json, here are the steps:
1. Install dependencies: npm install express
2. Start the server: npm start
3. Visit http://localhost:3000

You: What should I work on first?

Ian: Here are some suggested improvements:
1. Add error handling to your routes
2. Create unit tests for your utilities
3. Add input validation
4. Set up proper logging

Would you like me to help implement any of these?
```

### Flow 2: Code Improvement Session

```
You: This code needs improvement. Can you help?

Ian: I'll analyze your code quality and suggest improvements.

[Code analysis with specific recommendations]

You: Implement the error handling you suggested

Ian: I'll add comprehensive error handling to your Express application.

[Generates improved code with proper error handling]

You: Now add tests for the new error handling

Ian: I'll create test cases for the error handling scenarios.

[Generates test files with comprehensive coverage]
```

### Flow 3: Autonomous Development

```
You: Make this a production-ready application

Ian: I'll transform this into a production-ready application. This will involve:
1. Adding proper error handling and logging
2. Setting up environment configuration
3. Adding security middleware
4. Creating Docker configuration
5. Setting up monitoring and health checks
6. Adding comprehensive tests
7. Creating deployment documentation

Proceeding with autonomous mode...

[Ian automatically implements all improvements]
```

## Expected Outputs

### Project Analysis Output
```
📊 Project Analysis Results:

Overview:
- Total Files: 4
- Total Lines: 47
- Languages: JavaScript (100%)
- Main Framework: Express.js

Structure:
- Entry Point: index.js
- Utilities: utils.js
- Documentation: README.md
- Configuration: package.json

Code Quality:
- Complexity: Low
- Functions: 3 total
- Dependencies: 1 (express)

Recommendations:
1. Add error handling middleware
2. Implement input validation
3. Add unit tests
4. Set up proper logging
5. Add security middleware
6. Create proper project structure
```

### Code Generation Output
```javascript
// Generated test file
const { calculateSum, validateEmail } = require('../utils');

describe('Utils Tests', () => {
  describe('calculateSum', () => {
    test('should add two positive numbers', () => {
      expect(calculateSum(2, 3)).toBe(5);
    });
    
    test('should handle negative numbers', () => {
      expect(calculateSum(-1, 1)).toBe(0);
    });
  });
  
  describe('validateEmail', () => {
    test('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });
    
    test('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

## Performance Metrics

Track Ian's performance during the demo:

```bash
# Time command execution
time ian exec "analyze this project"

# Monitor resource usage
ian exec "large refactoring task" --verbose

# Compare model response times
ian models --test openai  # Response time: ~2s
ian models --test anthropic  # Response time: ~3s
ian models --test local  # Response time: ~1s
```

## Troubleshooting Demo Issues

If commands fail during demo:

1. **No API keys configured:**
   ```bash
   ian config --setup  # Run setup wizard
   ```

2. **Model not responding:**
   ```bash
   ian models --test openai  # Test connectivity
   ```

3. **Permission errors:**
   ```bash
   chmod +x bin/ian.js  # Make executable
   ```

4. **Module import errors:**
   ```bash
   node --version  # Check Node.js version (need 18+)
   ```

This demo showcases Ian's capabilities from basic chat to advanced autonomous development tasks, demonstrating why it's a powerful tool for developers.