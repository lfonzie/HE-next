#!/bin/bash

# Script para configurar a API do Freepik
# Execute este script para adicionar a chave da API do Freepik ao seu arquivo .env.local

echo "🔧 Configurando API do Freepik..."

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "📝 Criando arquivo .env.local..."
    cp env.local.example .env.local
    echo "✅ Arquivo .env.local criado a partir do exemplo"
fi

# Adicionar a chave da API do Freepik
echo "🔑 Adicionando chave da API do Freepik..."

# Verificar se a chave já existe
if grep -q "FREEPIK_API_KEY" .env.local; then
    echo "⚠️  FREEPIK_API_KEY já existe no arquivo .env.local"
    echo "📝 Atualizando chave existente..."
    sed -i.bak 's/FREEPIK_API_KEY=.*/FREEPIK_API_KEY="FPSXadeac0afae95aa5f843f43e6682fd15f"/' .env.local
else
    echo "➕ Adicionando nova chave FREEPIK_API_KEY..."
    echo "" >> .env.local
    echo "# Freepik API Configuration" >> .env.local
    echo 'FREEPIK_API_KEY="FPSXadeac0afae95aa5f843f43e6682fd15f"' >> .env.local
fi

echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Reinicie o servidor de desenvolvimento: npm run dev"
echo "2. Teste a busca Freepik em: http://localhost:3000/freepik-search"
echo "3. Verifique os logs para confirmar que a API está funcionando"
echo ""
echo "🔍 Para testar a integração, execute:"
echo "node test-freepik-integration.js"
