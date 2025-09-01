#!/bin/bash

# Ian Agent Quick Setup Script
echo "🤖 Setting up Ian - Autonomous AI Agent CLI"
echo "=============================================="

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Found Node.js: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm."
    exit 1
fi

echo "✅ npm is available"

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if npm test; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed, but Ian should still work"
fi

# Create example .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating example .env file..."
    cp .env.example .env
    echo "✅ Created .env file - please add your API keys"
fi

# Make CLI executable
chmod +x bin/ian.js

echo ""
echo "🎉 Ian Agent setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env file and add your AI provider API keys"
echo "2. Run setup wizard: ./bin/ian.js config --setup"
echo "3. Start chatting: ./bin/ian.js chat"
echo ""
echo "📖 Documentation:"
echo "- README.md - Full documentation"
echo "- examples/usage.md - Usage examples"
echo "- examples/configurations.md - Configuration examples"
echo ""
echo "🔧 Quick commands:"
echo "- ./bin/ian.js --help          # Show help"
echo "- ./bin/ian.js config --show   # Show current config"
echo "- ./bin/ian.js models --list   # List available models"
echo ""
echo "Happy coding with Ian! 🤖✨"