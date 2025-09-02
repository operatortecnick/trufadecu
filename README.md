# TrufadecuTTS - Google Cloud Text-to-Speech Interface

**Um aplicativo fácil de usar em 2 cliques para Google Cloud Text-to-Speech com interface seletiva para desenvolvedores.**

![TrufadecuTTS](https://img.shields.io/badge/TTS-Google%20Cloud-4285F4?logo=google-cloud)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![Blazor](https://img.shields.io/badge/Blazor-WebAssembly-512BD4?logo=blazor)

## 🚀 Início Rápido (2 Cliques)

### Windows
1. **Clique duplo** em `start.bat`
2. **Abra o navegador** na URL exibida

### Linux/macOS
1. **Execute** `./start.sh` no terminal
2. **Abra o navegador** na URL exibida

## ✨ Características

- **🎯 Interface Seletiva**: Acesso a todos os parâmetros do Google Cloud TTS
- **🗣️ 380+ Vozes**: Suporte para 50+ idiomas incluindo Português (Brasil)
- **🎚️ Controles Avançados**: Velocidade, tom, volume e formato de áudio
- **⚡ Predefinições Rápidas**: Configurações pré-definidas para diferentes necessidades
- **🔧 Configuração Fácil**: Guia passo a passo para configurar as credenciais da API
- **🌐 Cross-Platform**: Funciona em qualquer navegador moderno

## 🎨 Interface

### Página Principal
- **Entrada de Texto**: Campo para inserir o texto a ser sintetizado (até 5.000 caracteres)
- **Controles de Áudio**: Ajustes de velocidade, tom e volume com feedback em tempo real
- **Seleção de Voz**: Filtro por idioma, voz específica e gênero preferido
- **Formatos de Áudio**: MP3, WAV, OGG Opus, μ-law, A-law
- **Predefinições**: Normal, Lento & Claro, Rápido, Voz Grave, Voz Aguda

### Página de Configuração
- **Credenciais da API**: Campo para inserir o JSON da conta de serviço
- **Guia de Implementação**: Instruções detalhadas para implementação no servidor
- **Links Úteis**: Acesso direto ao Console do Google Cloud e documentação

### Página Sobre
- **Visão Geral**: Informações sobre recursos e capacidades
- **Estatísticas**: Quantidade de vozes, idiomas e formatos suportados
- **Stack Tecnológico**: Detalhes das tecnologias utilizadas

## 🛠️ Recursos Disponíveis

### Vozes e Idiomas
- **Português (Brasil)**: pt-BR-Wavenet-A/B, pt-BR-Neural2-A/B
- **Inglês (EUA)**: en-US-Wavenet-A/B/C/D, en-US-Neural2-A/C/D/E/F/G/H/I/J
- **Espanhol**: es-ES-Wavenet-A/B
- **Francês**: fr-FR-Wavenet-A/B
- **Alemão**: de-DE-Wavenet-A/B
- **Japonês**: ja-JP-Wavenet-A/B
- **Coreano**: ko-KR-Wavenet-A/B
- **E mais 40+ idiomas**

### Parâmetros de Síntese
- **Taxa de Fala**: 0.25x a 4.0x
- **Tom**: -20.0 Hz a +20.0 Hz
- **Ganho de Volume**: -96 dB a +16 dB
- **Formatos de Áudio**: MP3, WAV, OGG Opus, μ-law, A-law

## 🔧 Configuração e Implementação

### Pré-requisitos
- .NET 8.0 SDK
- Conta do Google Cloud Platform
- Projeto com Cloud Text-to-Speech API habilitada

### Configuração da API do Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a API Cloud Text-to-Speech
4. Crie uma conta de serviço e baixe o arquivo JSON de credenciais
5. Configure as credenciais na página de configuração do aplicativo

### Implementação Completa
Para funcionalidade completa, você precisa implementar um backend que:

#### Opção 1: ASP.NET Core Web API
```bash
# Criar um novo projeto Web API
dotnet new webapi -n TrufadecuTTSServer

# Adicionar o pacote Google Cloud TTS
dotnet add package Google.Cloud.TextToSpeech.V1

# Implementar endpoint /api/tts/synthesize
```

#### Opção 2: Google Cloud Functions
```bash
# Deploy de função serverless
gcloud functions deploy tts-synthesize \
  --runtime dotnet6 \
  --trigger-http \
  --allow-unauthenticated
```

#### Opção 3: Azure Functions ou AWS Lambda
- Deploy de função serverless usando os SDKs específicos da plataforma

### Exemplo de Endpoint da API
```http
POST /api/tts/synthesize
Content-Type: application/json

{
  "text": "Olá mundo!",
  "languageCode": "pt-BR",
  "voiceName": "pt-BR-Neural2-A",
  "audioEncoding": "MP3",
  "speakingRate": 1.0,
  "pitch": 0.0,
  "volumeGainDb": 0.0
}
```

## 💰 Preços do Google Cloud TTS

- **Vozes Padrão**: $4.00 por 1M de caracteres
- **Vozes WaveNet**: $16.00 por 1M de caracteres  
- **Vozes Neural2**: $16.00 por 1M de caracteres
- **Grátis**: 1M de caracteres por mês

## 🏗️ Estrutura do Projeto

```
TrufadecuTTS/
├── Pages/
│   ├── Home.razor          # Interface principal de TTS
│   ├── Config.razor        # Configuração da API
│   └── About.razor         # Informações sobre o aplicativo
├── Services/
│   ├── ITtsService.cs      # Interface do serviço TTS
│   └── MockTtsService.cs   # Implementação mock para demonstração
├── Layout/
│   ├── MainLayout.razor    # Layout principal
│   └── NavMenu.razor       # Menu de navegação
└── wwwroot/
    └── index.html          # Página HTML principal
```

## 🔗 Links Úteis

- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)
- [Documentação da API](https://cloud.google.com/text-to-speech/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Preços](https://cloud.google.com/text-to-speech/pricing)

## 🛡️ Segurança

⚠️ **Importante**: Nunca exponha suas credenciais de API no código do cliente. Este aplicativo é uma interface frontend que requer implementação de backend para segurança adequada.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou envie um pull request.

## 📄 Licença

Este projeto é de código aberto. Veja o arquivo LICENSE para detalhes.

---

**Desenvolvido para facilitar o acesso a todos os recursos do Google Cloud Text-to-Speech em uma interface amigável e profissional.**