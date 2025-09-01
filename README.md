# API Editor/Modifier Tool

Um editor/modificador de APIs funcional que permite transformar APIs de uma empresa para outra.

## Funcionalidades

- **Transformação de APIs**: Converte especificações OpenAPI/Swagger de uma empresa para formato de outra
- **Interface CLI**: Interface de linha de comando simples e intuitiva
- **Configuração Flexível**: Sistema de regras configuráveis para transformações personalizadas
- **Validação**: Validação de especificações de API
- **Exemplos**: Exemplos práticos incluídos

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/operatortecnick/trufadecu.git
cd trufadecu
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Uso

### Transformar uma API

```bash
python api_editor.py transform input_api.yaml config.yaml output_api.yaml
```

### Validar uma API

```bash
python api_editor.py validate api_spec.yaml
```

### Criar configuração de exemplo

```bash
python api_editor.py create-config sample_config.yaml
```

## Exemplo Prático

### 1. Use a API de exemplo da Empresa X:

```bash
python api_editor.py validate examples/company_x_api.yaml
```

### 2. Transforme para formato da Empresa Y:

```bash
python api_editor.py transform examples/company_x_api.yaml examples/transformation_config.yaml examples/company_y_api.yaml
```

### 3. Verifique o resultado:

```bash
python api_editor.py validate examples/company_y_api.yaml
```

## Configuração de Transformação

A configuração permite definir regras para:

- **Info**: Título, descrição, versão, contato
- **Servers**: URLs dos servidores, ambientes
- **Paths**: Prefixos, substituições de texto, operações
- **Components**: Esquemas de segurança, schemas personalizados

### Exemplo de Configuração

```yaml
transformation_rules:
  info:
    title: 'Nova API da Empresa Y'
    description: 'API transformada do formato da Empresa X'
    version: '1.0.0'
    
  servers:
    - url: 'https://api.empresa-y.com/v1'
      description: 'Servidor de Produção'
      
  paths:
    prefix: '/api/v1'
    replacements:
      - from: 'empresa-x'
        to: 'empresa-y'
```

## Recursos Avançados

### Transformações Automáticas

- **Prefixos de URL**: Adiciona automaticamente prefixos a todos os endpoints
- **Substituição de Texto**: Substitui referencias da empresa original
- **Segurança**: Adiciona esquemas de autenticação da nova empresa
- **Respostas Padrão**: Adiciona respostas de erro padronizadas

### Casos de Uso

1. **Migração de API**: Migrar de um provedor para outro
2. **White-labeling**: Adaptar API para diferentes marcas
3. **Versionamento**: Criar novas versões com estruturas diferentes
4. **Padronização**: Aplicar padrões corporativos

## Estrutura do Projeto

```
trufadecu/
├── api_editor.py              # Script principal
├── requirements.txt           # Dependências Python
├── examples/
│   ├── company_x_api.yaml     # API de exemplo (Empresa X)
│   └── transformation_config.yaml  # Configuração de transformação
└── README.md                  # Documentação
```

## API de Entrada Suportada

- OpenAPI 3.0+
- Swagger 2.0 (compatibilidade básica)
- Formatos YAML e JSON

## Contribuições

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License - veja o arquivo LICENSE para detalhes.