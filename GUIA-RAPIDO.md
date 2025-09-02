# 🚀 Guia Rápido de Uso - TruFadeCU

## Instalação em 2 Cliques

### Windows
1. **Duplo clique** em `start.bat`
2. Aguarde a instalação automática das dependências (primeira vez)
3. O aplicativo abrirá automaticamente

### Linux/Mac
1. **Duplo clique** em `start.sh` (ou execute `./start.sh` no terminal)
2. Aguarde a instalação automática das dependências (primeira vez)
3. O aplicativo abrirá automaticamente

## Primeiro Uso

### 1. Configurar Google Cloud (uma vez apenas)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Habilite a "Cloud Text-to-Speech API"
4. Crie uma "Service Account" com permissão "Cloud Text-to-Speech User"
5. Baixe a chave JSON da service account

### 2. Carregar Credenciais no App
1. No aplicativo, clique em "📁 Load Service Account Key"
2. Selecione o arquivo JSON baixado
3. Aguarde a confirmação "Credentials loaded successfully!"

### 3. Usar o Text-to-Speech
1. **Digite o texto** na área de texto (máximo 5000 caracteres)
2. **Selecione o idioma** (Português, Inglês, Espanhol, etc.)
3. **Escolha a voz** (masculina/feminina, diferentes tipos)
4. **Ajuste configurações** (velocidade, pitch, formato)
5. **Clique em "🔊 Generate Speech"**
6. **Use os controles**: ▶️ Play, ⏹️ Stop, 💾 Save

## Recursos Disponíveis

### Idiomas Suportados
- 🇧🇷 **Português** (Brasil)
- 🇺🇸 **Inglês** (EUA, Reino Unido)
- 🇪🇸 **Espanhol** (Espanha, EUA)
- 🇫🇷 **Francês** (França)
- 🇩🇪 **Alemão** (Alemanha)
- 🇮🇹 **Italiano** (Itália)
- 🇯🇵 **Japonês** (Japão)
- 🇰🇷 **Coreano** (Coreia do Sul)
- 🇨🇳 **Chinês** (Simplificado, Tradicional)

### Tipos de Voz
- **Neural2**: Última geração, mais natural
- **Wavenet**: Alta qualidade, muito natural
- **Standard**: Qualidade boa, menor custo

### Controles
- **Velocidade**: 0.25x até 4.0x
- **Pitch**: -20 a +20 semitons
- **Formato**: MP3, WAV, OGG

## Dicas Importantes

### ✅ Faça
- Use pontuação correta para melhor entonação
- Teste diferentes vozes para encontrar a ideal
- Salve configurações que funcionam bem
- Use vozes Neural2 para textos importantes

### ❌ Evite
- Textos muito longos (divida em partes menores)
- Caracteres especiais desnecessários
- Velocidades extremas (muito lento/rápido)

### 💰 Custos
- Google oferece cota gratuita mensal
- Vozes Neural2 custam mais que Wavenet
- Verifique o billing no Google Cloud Console

## Solução de Problemas

### Erro de Credenciais
- Verifique se o arquivo JSON está correto
- Confirme se a API está habilitada
- Verifique permissões da service account

### Erro de Billing
- Configure billing no Google Cloud
- Verifique se há saldo/cartão válido

### App Não Abre
- Instale Node.js: https://nodejs.org/
- Execute `npm install` no diretório do app
- Use o terminal para ver erros detalhados

---

**🎵 Divirta-se criando áudios incríveis com TruFadeCU!**