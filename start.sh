#!/bin/bash

echo "Iniciando TruFadeCU..."
echo ""
echo "===================================="
echo "   TruFadeCU - Text-to-Speech"
echo "   Google Cloud Integration"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não está instalado!"
    echo ""
    echo "Por favor, instale Node.js de: https://nodejs.org/"
    echo ""
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao instalar dependências!"
        exit 1
    fi
fi

# Start the application
echo "Abrindo aplicação..."
npm start