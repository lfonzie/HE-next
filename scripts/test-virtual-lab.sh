#!/bin/bash
# scripts/test-virtual-lab.sh

echo "🧪 Executando testes do módulo Virtual-Lab..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Executar testes unitários
echo "🔬 Executando testes unitários..."
npm test -- --testPathPattern="virtual-lab" --coverage --watchAll=false

# Verificar se os testes passaram
if [ $? -eq 0 ]; then
    echo "✅ Testes unitários passaram com sucesso!"
else
    echo "❌ Alguns testes unitários falharam"
    exit 1
fi

# Executar testes de integração se existirem
if [ -d "tests/integration" ]; then
    echo "🔗 Executando testes de integração..."
    npm run test:integration
fi

# Executar testes E2E se existirem
if [ -d "tests/e2e" ]; then
    echo "🌐 Executando testes E2E..."
    npm run test:e2e
fi

# Verificar cobertura de código
echo "📊 Verificando cobertura de código..."
npm test -- --coverage --testPathPattern="virtual-lab" --watchAll=false --coverageReporters=text

echo "🎉 Todos os testes do módulo Virtual-Lab foram executados!"
