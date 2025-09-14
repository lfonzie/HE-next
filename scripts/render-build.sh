#!/bin/bash

# Render Build Script for HubEdu.ai + ENEM API
echo "🚀 Iniciando build para Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo -e "${BLUE}🔍 Verificando Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi

# Check npm version
echo -e "${BLUE}🔍 Verificando npm...${NC}"
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi

# Install dependencies for main app
echo -e "${BLUE}📦 Instalando dependências do HubEdu.ai...${NC}"
npm ci --prefer-offline --no-audit

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao instalar dependências do HubEdu.ai${NC}"
    exit 1
fi

# Install dependencies for ENEM API
echo -e "${BLUE}📦 Instalando dependências do ENEM API...${NC}"
cd enem-api-main
npm ci --prefer-offline --no-audit

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao instalar dependências do ENEM API${NC}"
    exit 1
fi

# Generate Prisma client for ENEM API
echo -e "${BLUE}🗄️  Gerando cliente Prisma para ENEM API...${NC}"
npx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao gerar cliente Prisma${NC}"
    exit 1
fi

# Run Prisma migrations for ENEM API
echo -e "${BLUE}🗄️  Executando migrações do ENEM API...${NC}"
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao executar migrações${NC}"
    exit 1
fi

# Build ENEM API
echo -e "${BLUE}🔨 Construindo ENEM API...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao construir ENEM API${NC}"
    exit 1
fi

# Go back to main directory
cd ..

# Generate Prisma client for main app
echo -e "${BLUE}🗄️  Gerando cliente Prisma para HubEdu.ai...${NC}"
npx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao gerar cliente Prisma${NC}"
    exit 1
fi

# Build main app
echo -e "${BLUE}🔨 Construindo HubEdu.ai...${NC}"
npm run build:hubedu

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao construir HubEdu.ai${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${BLUE}📊 Resumo do build:${NC}"
echo -e "   - HubEdu.ai: ✅ Construído"
echo -e "   - ENEM API: ✅ Construído"
echo -e "   - Prisma: ✅ Clientes gerados"
echo -e "   - Migrações: ✅ Executadas"
