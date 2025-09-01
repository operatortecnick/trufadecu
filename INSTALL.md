# Installation & Deployment Guide

## Quick Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git (optional, for plugins)

### Automated Setup

1. **Clone and setup:**
   ```bash
   git clone https://github.com/operatortecnick/trufadecu.git
   cd trufadecu
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure API keys:**
   ```bash
   # Edit .env file with your API keys
   nano .env
   
   # Run setup wizard
   ./bin/ian.js config --setup
   ```

3. **Start using Ian:**
   ```bash
   ./bin/ian.js chat
   ```

### Manual Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env with your API keys:**
   ```bash
   # OpenAI
   OPENAI_API_KEY=sk-your-key-here
   
   # Anthropic
   ANTHROPIC_API_KEY=your-key-here
   
   # Google AI
   GOOGLE_AI_API_KEY=your-key-here
   ```

4. **Test installation:**
   ```bash
   npm test
   ./bin/ian.js --help
   ```

## Global Installation

To use Ian from anywhere on your system:

```bash
# Install globally
npm install -g .

# Or create symlink
npm link

# Then use from anywhere
ian chat
ian exec "analyze this project"
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Setup environment:**
   ```bash
   # Create .env file with your API keys
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Use Ian in container:**
   ```bash
   docker-compose exec ian-agent ./bin/ian.js chat
   ```

### Manual Docker Build

```bash
# Build image
docker build -t ian-agent .

# Run container
docker run -it --rm \
  -e OPENAI_API_KEY="your-key" \
  -e ANTHROPIC_API_KEY="your-key" \
  -v $(pwd)/data:/home/ian/.ian \
  ian-agent ./bin/ian.js chat
```

## Local AI Models

### Using Ollama

1. **Install Ollama:**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Pull models:**
   ```bash
   ollama pull llama2
   ollama pull codellama
   ollama pull mistral
   ```

3. **Configure Ian:**
   ```bash
   export LOCAL_MODEL_ENDPOINT=http://localhost:11434
   export LOCAL_MODEL_NAME=llama2
   
   ./bin/ian.js models --test local
   ```

### Using LocalAI

1. **Start LocalAI:**
   ```bash
   docker run -p 8080:8080 \
     -v $PWD/models:/models \
     localai/localai:latest
   ```

2. **Configure Ian:**
   ```bash
   export OPENAI_BASE_URL=http://localhost:8080/v1
   export OPENAI_API_KEY=local-key
   ```

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04 LTS)

2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm git
   ```

3. **Setup Ian:**
   ```bash
   git clone https://github.com/operatortecnick/trufadecu.git
   cd trufadecu
   ./setup.sh
   ```

4. **Configure as service:**
   ```bash
   sudo tee /etc/systemd/system/ian-agent.service > /dev/null <<EOF
   [Unit]
   Description=Ian AI Agent
   After=network.target
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/trufadecu
   ExecStart=/usr/bin/node src/index.js
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   sudo systemctl enable ian-agent
   sudo systemctl start ian-agent
   ```

### Google Cloud Platform

1. **Create VM instance**
2. **Setup similar to AWS**
3. **Configure firewall rules if needed**

### Heroku

1. **Create Heroku app:**
   ```bash
   heroku create your-ian-agent
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set ANTHROPIC_API_KEY=your-key
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

## Development Setup

### For Contributors

1. **Clone repository:**
   ```bash
   git clone https://github.com/operatortecnick/trufadecu.git
   cd trufadecu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install development tools:**
   ```bash
   npm install -g eslint prettier nodemon
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   npm run test:watch  # Watch mode
   ```

### Plugin Development

1. **Create plugin directory:**
   ```bash
   mkdir -p ~/.ian/plugins/my-plugin
   cd ~/.ian/plugins/my-plugin
   ```

2. **Generate plugin template:**
   ```bash
   ian plugins --create my-plugin
   ```

3. **Install plugin:**
   ```bash
   ian plugins --install file:~/.ian/plugins/my-plugin
   ```

## Troubleshooting

### Common Issues

1. **"Command not found"**
   - Make sure Node.js 18+ is installed
   - Check PATH includes node and npm
   - Try absolute path: `/path/to/trufadecu/bin/ian.js`

2. **"API key not found"**
   - Check .env file exists and has correct keys
   - Run `ian config --show` to verify configuration
   - Try `ian config --setup` to reconfigure

3. **"Model not available"**
   - Check API keys are valid
   - Test specific model: `ian models --test openai`
   - Verify network connectivity

4. **Import/Module errors**
   - Ensure Node.js version is 18+
   - Check package.json has `"type": "module"`
   - Clear node_modules and reinstall

### Getting Help

- 📖 Check the [README.md](README.md)
- 🐛 Open an [issue](https://github.com/operatortecnick/trufadecu/issues)
- 💬 Join [discussions](https://github.com/operatortecnick/trufadecu/discussions)
- 📧 Contact the maintainers

## Performance Optimization

### For Production

1. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name ian-agent
   pm2 startup
   pm2 save
   ```

2. **Configure logging:**
   ```bash
   export LOG_LEVEL=warn  # Reduce log verbosity
   ```

3. **Use local models for better performance:**
   ```bash
   # Setup Ollama locally instead of remote APIs
   ```

4. **Optimize memory usage:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=2048"
   ```

## Security Considerations

1. **API Key Management:**
   - Store keys in .env files (never in code)
   - Use different keys for different environments
   - Rotate keys regularly

2. **Network Security:**
   - Use HTTPS for all API calls
   - Consider VPN for sensitive deployments
   - Firewall configuration for cloud deployments

3. **File Permissions:**
   ```bash
   chmod 600 .env  # Restrict access to env file
   ```

4. **Autonomous Mode:**
   - Review commands before enabling autonomous mode
   - Use dry-run for testing
   - Monitor logs for unexpected behavior