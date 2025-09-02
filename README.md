# TruFadeCU - Google Cloud Text-to-Speech Application

Uma aplicação desktop moderna e intuitiva para utilizar facilmente todos os recursos do Google Cloud Text-to-Speech API.

## 🚀 Características

- **Interface Seletiva**: Interface limpa e fácil de usar com acesso a todos os recursos do TTS
- **2 Cliques**: Executável simples que abre em apenas 2 cliques
- **Múltiplas Vozes**: Suporte a mais de 40 vozes em 12+ idiomas
- **Controles Avançados**: Ajuste de velocidade, pitch e formato de áudio
- **Preview em Tempo Real**: Reproduza o áudio gerado instantaneamente
- **Salvar Arquivos**: Exporte o áudio em MP3, WAV ou OGG

## 🛠️ Funcionalidades

### Vozes Suportadas
- **Inglês**: US, UK (Wavenet, Neural2)
- **Espanhol**: Espanha, EUA
- **Francês**: França
- **Alemão**: Alemanha
- **Italiano**: Itália
- **Português**: Brasil
- **Japonês**: Japão
- **Coreano**: Coreia do Sul
- **Chinês**: Simplificado, Tradicional

### Controles de Áudio
- **Velocidade**: 0.25x até 4.0x
- **Pitch**: -20 a +20 semitons
- **Formatos**: MP3, WAV, OGG Opus

## 📋 Requisitos

1. **Google Cloud Account**: Conta no Google Cloud Platform
2. **Text-to-Speech API**: API habilitada no seu projeto
3. **Service Account**: Chave de conta de serviço (arquivo JSON)

## 🔧 Configuração do Google Cloud

### 1. Criar Projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a API Text-to-Speech

### 2. Criar Service Account
1. Vá para "IAM & Admin" > "Service Accounts"
2. Clique em "Create Service Account"
3. Dê um nome e descrição
4. Adicione a role "Cloud Text-to-Speech User"
5. Clique em "Create Key" e escolha "JSON"
6. Baixe o arquivo JSON (guarde-o em local seguro)

### 3. Configurar Billing
- Certifique-se de que o billing está habilitado no projeto
- Text-to-Speech oferece cota gratuita mensal

## 🚀 Como Usar

### 1. Primeiro Uso
1. Execute o aplicativo (duplo clique no executável)
2. Clique em "Load Service Account Key"
3. Selecione o arquivo JSON baixado do Google Cloud
4. Agora você pode usar todas as funcionalidades

### 2. Gerando Áudio
1. Digite ou cole o texto na área de texto
2. Selecione o idioma desejado
3. Escolha a voz (gênero e tipo)
4. Ajuste velocidade e pitch se necessário
5. Clique em "Generate Speech"
6. Use os controles para reproduzir ou salvar

### 3. Formatos de Saída
- **MP3**: Boa compressão, ideal para compartilhamento
- **WAV**: Alta qualidade, sem compressão
- **OGG**: Boa compressão, open source

## 🔒 Segurança

- Suas credenciais são usadas apenas localmente
- Nenhuma informação é enviada para servidores terceiros
- O arquivo de credenciais deve ser mantido seguro
- Não compartilhe suas chaves de API

## 💡 Dicas de Uso

### Texto
- Limite: 5000 caracteres por requisição
- Use pontuação para melhor entonação
- SSML (Speech Synthesis Markup Language) é suportado

### Vozes
- **Wavenet**: Vozes mais naturais, maior custo
- **Neural2**: Última geração, extremamente natural
- **Standard**: Vozes básicas, menor custo

### Performance
- Textos mais longos demoram mais para processar
- Vozes Neural2 são mais lentas que Wavenet
- Use cache local para textos repetidos

## 🏗️ Desenvolvimento

### Executar em Modo Desenvolvimento
```bash
npm install
npm start
```

### Construir Aplicação
```bash
npm run build
```

### Estrutura do Projeto
```
trufadecu/
├── main.js          # Processo principal do Electron
├── index.html       # Interface principal
├── styles.css       # Estilos da aplicação
├── renderer.js      # Lógica da interface
├── package.json     # Configurações e dependências
└── assets/          # Ícones e recursos
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se suas credenciais estão corretas
2. Confirme se a API está habilitada no Google Cloud
3. Verifique se há billing configurado
4. Consulte os logs de erro na aplicação

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ para facilitar o uso do Google Cloud Text-to-Speech**