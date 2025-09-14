#!/bin/bash

# Render Start Script for HubEdu.ai Main Application
echo "🚀 Iniciando HubEdu.ai no Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start HubEdu.ai
start_hubedu() {
    echo -e "${GREEN}🎓 Iniciando HubEdu.ai na porta $PORT...${NC}"
    
    # Log environment variables for debugging
    echo -e "${BLUE}🔍 Environment Variables:${NC}"
    echo "   NODE_ENV: $NODE_ENV"
    echo "   PORT: $PORT"
    echo "   DATABASE_URL: ${DATABASE_URL:+SET}"
    echo "   NEXTAUTH_URL: ${NEXTAUTH_URL:+SET}"
    echo "   ENEM_API_URL: ${ENEM_API_URL:+SET}"
    
    # Start HubEdu.ai
    echo -e "${BLUE}📝 Iniciando servidor Next.js...${NC}"
    npm start 2>&1 | tee hubedu.log &
    HUBEDU_PID=$!
    echo "HubEdu.ai PID: $HUBEDU_PID" > hubedu.pid
    
    # Wait a bit for HubEdu.ai to start
    sleep 5
    
    # Check if HubEdu.ai is running
    if check_port $PORT; then
        echo -e "${GREEN}✅ HubEdu.ai rodando na porta $PORT${NC}"
        echo -e "${BLUE}🌐 Acesse: http://localhost:$PORT${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar HubEdu.ai${NC}"
        echo -e "${RED}📝 Verifique os logs em hubedu.log${NC}"
        return 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Parando servidor...${NC}"
    
    if [ -f "hubedu.pid" ]; then
        HUBEDU_PID=$(cat hubedu.pid)
        kill $HUBEDU_PID 2>/dev/null
        rm hubedu.pid
    fi
    
    echo -e "${GREEN}✅ Servidor parado${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start HubEdu.ai
start_hubedu
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao iniciar HubEdu.ai. Abortando...${NC}"
    echo -e "${RED}📝 Logs disponíveis em hubedu.log${NC}"
    exit 1
fi

echo -e "\n${BLUE}🎉 HubEdu.ai está rodando!${NC}"
echo -e "${GREEN}📊 Status:${NC}"
echo -e "   - HubEdu.ai: http://localhost:$PORT"
echo -e "   - ENEM API: ${ENEM_API_URL:-'Serviço separado no Render'}"
echo -e "\n${YELLOW}📊 Para ver logs:${NC}"
echo -e "   HubEdu.ai: tail -f hubedu.log"

# Keep script running
wait
