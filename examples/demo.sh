#!/bin/bash

# Exemplo de uso do API Editor/Modifier Tool
# Este script demonstra como transformar uma API da Empresa X para Empresa Y

echo "🚀 Demonstração do API Editor/Modifier Tool"
echo "============================================="
echo

# 1. Validar API original
echo "1. Validando API original da Empresa X..."
python api_editor.py validate examples/company_x_api.yaml
echo

# 2. Mostrar configuração de transformação
echo "2. Configuração de transformação:"
echo "   - Arquivo: examples/transformation_config.yaml"
echo "   - Transformações:"
echo "     • Título: Company X API → Company Y API"
echo "     • Servidores: api.company-x.com → api.company-y.com"
echo "     • Prefixo: Adiciona /api/v1 a todos os endpoints"
echo "     • Segurança: Adiciona autenticação com API Key"
echo "     • Respostas: Adiciona códigos de erro padrão (401, 403, 429)"
echo

# 3. Executar transformação
echo "3. Executando transformação..."
python api_editor.py transform examples/company_x_api.yaml examples/transformation_config.yaml examples/company_y_api.yaml
echo

# 4. Validar API transformada
echo "4. Validando API transformada da Empresa Y..."
python api_editor.py validate examples/company_y_api.yaml
echo

# 5. Mostrar diferenças
echo "5. Comparação dos arquivos:"
echo "   Original (Company X): examples/company_x_api.yaml"
echo "   Transformado (Company Y): examples/company_y_api.yaml"
echo

echo "✅ Demonstração concluída com sucesso!"
echo
echo "📚 Para usar com suas próprias APIs:"
echo "   1. Coloque sua API original em um arquivo YAML/JSON"
echo "   2. Crie um arquivo de configuração personalizada:"
echo "      python api_editor.py create-config minha_config.yaml"
echo "   3. Execute a transformação:"
echo "      python api_editor.py transform minha_api.yaml minha_config.yaml api_transformada.yaml"