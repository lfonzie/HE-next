#!/bin/bash
# Script para configurar a API Pixabay no arquivo .env.local

echo "🔧 Configurando API Pixabay..."

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "📝 Criando arquivo .env.local..."
    touch .env.local
fi

# Adicionar configurações da Pixabay se não existirem
if ! grep -q "PIXABAY_API_KEY" .env.local; then
    echo "➕ Adicionando configurações da Pixabay..."
    cat >> .env.local << EOF

# Pixabay API
PIXABAY_API_KEY="52327225-b29494d470fd930f2a225e9cf"

# Pixabay API Configuration
PIXABAY_API_PRIORITY=api
PIXABAY_ENABLE_IMAGE_SEARCH=true
PIXABAY_ENABLE_AUTO_IMAGES=true
PIXABAY_EDUCATIONAL_FOCUS=true
EOF
    echo "✅ Configurações da Pixabay adicionadas ao .env.local"
else
    echo "⚠️ Configurações da Pixabay já existem no .env.local"
fi

echo "🎉 Configuração concluída!"
echo ""
echo "📋 Para usar a API Pixabay:"
echo "1. Reinicie o servidor de desenvolvimento"
echo "2. Acesse /pixabay-demo para testar"
echo "3. Use os hooks e componentes implementados"
echo ""
echo "🔗 Endpoints disponíveis:"
echo "   POST /api/pixabay - Busca geral"
echo "   GET /api/pixabay/[id] - Busca por ID"
echo "   GET /api/pixabay?action=info - Informações"
