# Example configurations for various AI providers

## Environment Variables (.env)

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Gemini Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Local Model Configuration
LOCAL_MODEL_ENDPOINT=http://localhost:11434
LOCAL_MODEL_NAME=llama2
```

## OpenAI with Custom Endpoint

For using with OpenAI-compatible APIs like LocalAI or text-generation-webui:

```json
{
  "models": {
    "openai": {
      "enabled": true,
      "model": "gpt-4",
      "baseURL": "http://localhost:8080/v1"
    }
  }
}
```

## Local Models with Ollama

```json
{
  "models": {
    "local": {
      "enabled": true,
      "endpoint": "http://localhost:11434",
      "defaultModel": "llama2",
      "models": [
        {
          "name": "llama2",
          "description": "Llama 2 7B model"
        },
        {
          "name": "codellama",
          "description": "Code Llama for programming tasks"
        },
        {
          "name": "mistral",
          "description": "Mistral 7B model"
        }
      ]
    }
  }
}
```

## Multi-Model Configuration

```json
{
  "defaultModel": "anthropic",
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
    "gemini": {
      "enabled": true,
      "model": "gemini-pro"
    },
    "local": {
      "enabled": true,
      "endpoint": "http://localhost:11434",
      "defaultModel": "llama2"
    }
  }
}
```