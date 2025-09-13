#!/bin/bash

echo "🚀 Configurando HubEdu.ai para desenvolvimento..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🗄️ Gerando cliente Prisma..."
npx prisma generate

# Verificar se existe arquivo .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️ Arquivo .env.local não encontrado!"
    echo "📝 Crie um arquivo .env.local baseado no exemplo abaixo:"
    echo ""
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/hubedu_db\""
    echo "NEXTAUTH_SECRET=\"your-secret-key-here-minimum-32-characters\""
    echo "NEXTAUTH_URL=\"http://localhost:3000\""
    echo "OPENAI_API_KEY=\"sk-your-openai-api-key-here\""
    echo ""
    echo "Depois execute:"
    echo "npx prisma db push"
    echo "npx prisma db seed"
    echo "npm run dev"
else
    echo "✅ Arquivo .env.local encontrado"
    
    # Perguntar se quer configurar o banco
    read -p "🗄️ Configurar banco de dados? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📊 Executando migrations..."
        npx prisma db push
        
        echo "🌱 Populando banco com dados iniciais..."
        npx prisma db seed
        
        echo "✅ Banco configurado com sucesso!"
    fi
    
    # Perguntar se quer iniciar o servidor
    read -p "🚀 Iniciar servidor de desenvolvimento? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🎉 Iniciando HubEdu.ai..."
        npm run dev
    else
        echo "✅ Setup concluído! Execute 'npm run dev' para iniciar."
    fi
fi

echo "🎉 HubEdu.ai configurado com sucesso!"

