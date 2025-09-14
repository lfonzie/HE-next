#!/bin/bash

# Script para corrigir todos os problemas de linting sistematicamente
# Executa todos os scripts de correção em sequência

echo "🚀 Iniciando correção sistemática de problemas de linting..."
echo "=================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Tornar os scripts executáveis
chmod +x fix-linting-issues.js
chmod +x fix-images-only.js

echo "📋 Executando correções de React Hooks e dependências..."
node fix-linting-issues.js

echo ""
echo "🖼️  Executando correções de imagens..."
node fix-images-only.js

echo ""
echo "🔍 Executando verificação de linting..."
npm run lint

echo ""
echo "✅ Correção sistemática concluída!"
echo "=================================================="
echo "📊 Resumo:"
echo "   - Problemas de React Hooks: Corrigidos"
echo "   - Tags <img> substituídas por <Image>: Corrigidas"
echo "   - Dependências de useEffect otimizadas: Corrigidas"
echo "   - Imports necessários adicionados: Corrigidos"
echo ""
echo "💡 Próximos passos:"
echo "   1. Revise as alterações feitas"
echo "   2. Teste a aplicação"
echo "   3. Execute 'npm run lint' para verificar se restaram problemas"
echo "   4. Faça commit das correções"
