#!/bin/bash

# ENEM API Startup Script for Render
echo "🚀 Iniciando ENEM API no Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-3001}

# Log environment variables for debugging
echo -e "${BLUE}🔍 Environment Variables:${NC}"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   DATABASE_URL: ${DATABASE_URL:+SET}"

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo -e "${YELLOW}⚠️  Gerando cliente Prisma...${NC}"
    npx prisma generate
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha ao gerar cliente Prisma${NC}"
        exit 1
    fi
fi

# Start the Next.js server
echo -e "${GREEN}📚 Iniciando ENEM API na porta $PORT...${NC}"
npm start 2>&1 | tee enem-api.log &
API_PID=$!

# Wait a bit for the API to start
sleep 5

# Check if the API is running
if kill -0 $API_PID 2>/dev/null; then
    echo -e "${GREEN}✅ ENEM API rodando na porta $PORT${NC}"
    echo -e "${BLUE}🌐 API disponível em: http://localhost:$PORT${NC}"
    echo -e "${YELLOW}📊 Para ver logs: tail -f enem-api.log${NC}"
    
    # Keep the script running
    wait $API_PID
else
    echo -e "${RED}❌ Falha ao iniciar ENEM API${NC}"
    echo -e "${RED}📝 Verifique os logs em enem-api.log${NC}"
    exit 1
fi
