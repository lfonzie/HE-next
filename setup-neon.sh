#!/bin/bash

# Script para configurar banco Neon
echo "🔧 Configurando banco Neon..."

# Verificar se o usuário tem as credenciais do Neon
if [ -z "$NEON_DATABASE_URL" ]; then
    echo "❌ Variável NEON_DATABASE_URL não encontrada"
    echo ""
    echo "📝 Para configurar o banco Neon:"
    echo "1. Acesse: https://console.neon.tech/"
    echo "2. Crie um novo projeto"
    echo "3. Copie a connection string"
    echo "4. Execute: export NEON_DATABASE_URL='sua_connection_string'"
    echo "5. Execute este script novamente"
    echo ""
    echo "💡 Ou configure manualmente no .env.local:"
    echo "DATABASE_URL=\"postgresql://user:password@host/database?sslmode=require\""
    exit 1
fi

# Atualizar .env.local com a URL do Neon
echo "✅ Configurando DATABASE_URL com Neon..."
sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$NEON_DATABASE_URL\"|" .env.local
sed -i '' "s|DIRECT_URL=.*|DIRECT_URL=\"$NEON_DATABASE_URL\"|" .env.local

echo "✅ Banco Neon configurado!"
echo "🚀 Execute 'npm run db:push' para sincronizar o schema"
