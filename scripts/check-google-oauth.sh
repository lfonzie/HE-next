#!/bin/bash

# Script para verificar configurações do Google OAuth
echo "🔍 Verificando configurações do Google OAuth..."

# Verificar variáveis de ambiente
echo "📋 Variáveis de ambiente:"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:10}..."

# Verificar se NEXTAUTH_URL está correto
if [ "$NEXTAUTH_URL" = "https://hubedu.ia.br" ]; then
    echo "✅ NEXTAUTH_URL está correto"
else
    echo "❌ NEXTAUTH_URL incorreto: $NEXTAUTH_URL"
    echo "✅ Deve ser: https://hubedu.ia.br"
fi

# Verificar se Google OAuth está configurado
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "✅ Google OAuth configurado"
else
    echo "❌ Google OAuth não configurado"
    echo "✅ Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET"
fi

echo ""
echo "🌐 URLs que DEVEM estar no Google OAuth Console:"
echo ""
echo "Authorized redirect URIs:"
echo "https://hubedu.ia.br/api/auth/callback/google"
echo "https://www.hubedu.ia.br/api/auth/callback/google"
echo ""
echo "Authorized JavaScript origins:"
echo "https://hubedu.ia.br"
echo "https://www.hubedu.ia.br"
echo ""
echo "🔧 Passos para corrigir:"
echo "1. Acesse Google Cloud Console"
echo "2. Vá para APIs & Services → Credentials"
echo "3. Edite seu OAuth 2.0 Client ID"
echo "4. Adicione as URLs acima"
echo "5. Salve as alterações"
echo "6. Teste o login novamente"
