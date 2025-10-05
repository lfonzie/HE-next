#!/bin/bash

# Script para corrigir configurações de ambiente no Render
# Este script deve ser executado após o deploy para garantir que as variáveis estejam corretas

echo "🔧 Corrigindo configurações de ambiente para hubedu.ia.br..."

# Verificar se estamos em produção
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Este script deve ser executado apenas em produção"
    exit 1
fi

# Verificar variáveis críticas
echo "📋 Verificando variáveis de ambiente críticas..."

# NEXTAUTH_URL deve ser hubedu.ia.br
if [ "$NEXTAUTH_URL" != "https://hubedu.ia.br" ]; then
    echo "❌ NEXTAUTH_URL incorreto: $NEXTAUTH_URL"
    echo "✅ Deve ser: https://hubedu.ia.br"
    echo "🔧 Corrigindo NEXTAUTH_URL..."
    export NEXTAUTH_URL="https://hubedu.ia.br"
fi

# Verificar se Google OAuth está configurado
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ Google OAuth não configurado!"
    echo "✅ GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET são obrigatórios para login com Google"
    echo "🔧 Configure essas variáveis no painel do Render"
fi

# Verificar NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET não configurado!"
    echo "✅ Esta variável é obrigatória em produção"
    echo "🔧 Configure NEXTAUTH_SECRET no painel do Render"
fi

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não configurado!"
    echo "✅ Esta variável é obrigatória para conectar ao banco de dados"
    echo "🔧 Configure DATABASE_URL no painel do Render"
fi

echo "✅ Verificação concluída!"
echo ""
echo "📝 Resumo das configurações necessárias:"
echo "   NEXTAUTH_URL=https://hubedu.ia.br"
echo "   GOOGLE_CLIENT_ID=seu-google-client-id"
echo "   GOOGLE_CLIENT_SECRET=seu-google-client-secret"
echo "   NEXTAUTH_SECRET=seu-secret-key"
echo "   DATABASE_URL=sua-database-url"
echo ""
echo "🔧 Para corrigir no Render:"
echo "   1. Acesse o painel do Render"
echo "   2. Vá para Environment Variables"
echo "   3. Configure as variáveis acima"
echo "   4. Reinicie o serviço"
echo ""
echo "🌐 URLs de callback do Google OAuth:"
echo "   Authorized redirect URIs:"
echo "   - https://hubedu.ia.br/api/auth/callback/google"
echo "   - https://hubedu.ia.br/api/auth/signin/google"
