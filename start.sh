#!/bin/bash

# Script para matar processo na porta 3000 e iniciar npm run dev
# Uso: ./start.sh

echo "🔄 Parando processos na porta 3000..."

# Mata processos na porta 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Aguarda um momento para garantir que os processos foram finalizados
sleep 2

echo "✅ Processos na porta 3000 finalizados"
echo "🚀 Iniciando npm run dev:turbo..."

# Inicia o servidor de desenvolvimento com turbopack
npm run dev:turbo
