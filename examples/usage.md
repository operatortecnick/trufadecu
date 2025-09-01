# Ian Agent Usage Examples

## Basic Chat

Start an interactive chat session:

```bash
ian chat
```

With specific model:
```bash
ian chat --model anthropic
ian chat --model gemini
ian chat --model local
```

With autonomous mode:
```bash
ian chat --autonomous
```

## Task Execution

Execute specific tasks:

```bash
# Analyze a project
ian exec "analyze this project structure"

# Generate code
ian exec "create a REST API for user management" --output api.js

# Debug code
ian exec "debug the function in main.js" --file main.js

# Dry run (see what would be done)
ian exec "refactor this codebase" --dry-run
```

## Configuration

Run setup wizard:
```bash
ian config --setup
```

Show current configuration:
```bash
ian config --show
```

Reset configuration:
```bash
ian config --reset
```

## Model Management

List available models:
```bash
ian models --list
```

Test a model:
```bash
ian models --test openai
ian models --test anthropic
```

Add a local model:
```bash
ian models --add-local /path/to/model
```

## Plugin Management

List installed plugins:
```bash
ian plugins --list
```

Install a plugin:
```bash
ian plugins --install file:./my-plugin
ian plugins --install ian-plugin-git
```

Remove a plugin:
```bash
ian plugins --remove my-plugin
```

## Interactive Commands

Within the chat interface:

```
/help       - Show help
/clear      - Clear screen
/status     - Show agent status
/models     - List available models
/plugins    - List loaded plugins
/exit       - Exit Ian
```

## Example Conversations

### Code Analysis
```
You: analyze the code structure in this project
Ian: I'll analyze your project structure. Let me examine the files...

[Analysis results with recommendations]
```

### Code Generation
```
You: create a simple HTTP server in Node.js
Ian: I'll create a Node.js HTTP server for you.

[Generated code with explanations]
```

### Autonomous Tasks
```
You: automate the deployment process for this app
Ian: I'll analyze your deployment requirements and create an automated process.

[Step-by-step automation plan]
```

### File Operations
```
You: create a new React component called UserProfile
Ian: I'll create a UserProfile React component with proper structure.

[Component code generated and saved]
```

## Advanced Usage

### Environment Variables

Set up your AI provider credentials:

```bash
export OPENAI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
export GOOGLE_AI_API_KEY="your-key-here"
```

### Custom Model Endpoints

For self-hosted models:
```bash
export LOCAL_MODEL_ENDPOINT="http://localhost:11434"
export LOCAL_MODEL_NAME="llama2"
```

### Batch Processing

Process multiple tasks:
```bash
# Process tasks from file
ian exec "$(cat tasks.txt)"

# Chain multiple tasks
ian exec "analyze code" && ian exec "generate tests" && ian exec "create documentation"
```

### Integration with CI/CD

Use Ian in automation:
```bash
# In your CI pipeline
ian exec "analyze pull request changes" --file changes.diff --output analysis.json
ian exec "generate test cases for new features" --autonomous
```