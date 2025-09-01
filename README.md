# Ian - Autonomous AI Agent CLI

![Ian Agent](https://img.shields.io/badge/AI-Agent-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

**Ian** is a powerful autonomous AI agent command-line interface inspired by Claude Code CLI and Gemini Gcloud CLI. It provides intelligent assistance for coding, file management, project analysis, and autonomous task execution with support for multiple AI models including OpenAI, Anthropic Claude, Google Gemini, and customizable open-source models.

## 🚀 Features

### 🤖 Multi-Model AI Support
- **OpenAI GPT-4/3.5**: Advanced language understanding and code generation
- **Anthropic Claude**: Constitutional AI with strong reasoning capabilities  
- **Google Gemini**: Multimodal AI with excellent coding abilities
- **Local Models**: Support for self-hosted open-source models (Ollama, LocalAI, etc.)

### 🎯 Core Capabilities
- **Interactive Chat**: Conversational AI assistance with context awareness
- **Autonomous Task Execution**: Let Ian handle complex multi-step tasks
- **Code Analysis**: Deep project structure analysis and code quality assessment
- **File Operations**: Intelligent file management and manipulation
- **Plugin System**: Extensible architecture with custom plugins
- **Configuration Management**: Easy setup and model switching

### 🔧 Advanced Features
- **Dry Run Mode**: Preview what Ian will do before execution
- **Risk Assessment**: Safety checks for potentially destructive operations
- **Task History**: Track and review completed operations
- **Real-time Logging**: Comprehensive logging with configurable verbosity
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Install from Source

```bash
# Clone the repository
git clone https://github.com/operatortecnick/trufadecu.git
cd trufadecu

# Install dependencies
npm install

# Install globally (optional)
npm link

# Or run directly
node src/index.js
```

### Using NPM (when published)
```bash
npm install -g trufadecu
```

## ⚡ Quick Start

### 1. Initial Setup
Run the setup wizard to configure your AI models:

```bash
ian config --setup
```

This will guide you through:
- Configuring API keys for AI providers
- Setting default preferences
- Enabling autonomous mode options

### 2. Start Chatting
Begin an interactive session:

```bash
ian chat
```

### 3. Execute Tasks
Run autonomous tasks:

```bash
ian exec "analyze this project and suggest improvements"
ian exec "create a REST API for user management" --output api.js
ian exec "debug the function in main.js" --file main.js
```

## 🎮 Usage Examples

### Interactive Mode
```bash
# Start chat with default model
ian chat

# Use specific model
ian chat --model anthropic
ian chat --model gemini --temperature 0.8

# Enable autonomous mode
ian chat --autonomous
```

### Task Execution
```bash
# Code analysis
ian exec "analyze the code quality in this project"

# Code generation
ian exec "create a React component for user authentication"

# File operations
ian exec "organize these files by file type"

# Dry run (preview only)
ian exec "refactor this entire codebase" --dry-run
```

### Configuration Management
```bash
# Show current configuration
ian config --show

# Reset to defaults
ian config --reset

# Test model connections
ian models --test openai
ian models --list
```

### Plugin Management
```bash
# List plugins
ian plugins --list

# Install plugin
ian plugins --install file:./my-plugin
ian plugins --install ian-plugin-git

# Remove plugin
ian plugins --remove my-plugin
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your project or home directory:

```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Local Model Configuration
LOCAL_MODEL_ENDPOINT=http://localhost:11434
LOCAL_MODEL_NAME=llama2
```

### Configuration File
Ian stores configuration in `~/.ian/config.json`:

```json
{
  "defaultModel": "openai",
  "temperature": 0.7,
  "maxTokens": 4000,
  "autonomousMode": false,
  "models": {
    "openai": {
      "enabled": true,
      "model": "gpt-4"
    },
    "anthropic": {
      "enabled": true,
      "model": "claude-3-sonnet-20240229"
    },
    "local": {
      "enabled": true,
      "endpoint": "http://localhost:11434",
      "defaultModel": "llama2"
    }
  }
}
```

## 🎯 Use Cases

### Software Development
- **Code Review**: Analyze code quality and suggest improvements
- **Bug Fixing**: Debug issues and generate fixes
- **Documentation**: Auto-generate docs from code
- **Testing**: Create comprehensive test suites
- **Refactoring**: Modernize and optimize codebases

### Project Management
- **Project Analysis**: Understand project structure and dependencies
- **Task Automation**: Automate repetitive development tasks
- **Environment Setup**: Configure development environments
- **Deployment**: Automate deployment processes

### Learning & Research
- **Code Explanation**: Understand complex algorithms and patterns
- **Best Practices**: Learn modern development practices
- **Technology Research**: Explore new frameworks and tools

## 🔌 Plugin Development

Create custom plugins to extend Ian's capabilities:

```bash
# Generate plugin template
ian plugins --create my-awesome-plugin

# Plugin structure
my-awesome-plugin/
├── package.json
├── index.js
└── README.md
```

Example plugin:

```javascript
export default class MyAwesomePlugin {
  constructor() {
    this.name = 'my-awesome-plugin';
    this.commands = [
      {
        name: 'awesome',
        description: 'Do something awesome',
        handler: this.awesomeCommand.bind(this)
      }
    ];
  }

  async awesomeCommand(args) {
    return 'Something awesome happened!';
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/operatortecnick/trufadecu.git
cd trufadecu
npm install
npm run test
```

### Code Style
- Use ESLint for code linting
- Follow conventional commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Claude Code CLI and Gemini Gcloud CLI
- Built with love for the developer community
- Thanks to all AI providers for their amazing APIs

## 📞 Support

- 📖 [Documentation](./examples/)
- 🐛 [Issues](https://github.com/operatortecnick/trufadecu/issues)
- 💬 [Discussions](https://github.com/operatortecnick/trufadecu/discussions)

---

**Happy coding with Ian! 🤖✨**