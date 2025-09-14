#!/bin/bash

# Render Start Script for HubEdu.ai + ENEM API
echo "🚀 Iniciando HubEdu.ai + ENEM API no Render..."

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

# Function to start ENEM API
start_enem_api() {
    echo -e "${GREEN}📚 Iniciando ENEM API na porta 3001...${NC}"
    cd enem-api-main
    
    # Set ENEM API port
    export PORT=3001
    
    # Start ENEM API
    npm start > ../enem-api.log 2>&1 &
    ENEM_PID=$!
    echo "ENEM API PID: $ENEM_PID" > ../enem-api.pid
    
    # Wait a bit for ENEM API to start
    sleep 3
    
    # Check if ENEM API is running
    if check_port 3001; then
        echo -e "${GREEN}✅ ENEM API rodando na porta 3001${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar ENEM API${NC}"
        return 1
    fi
    
    cd ..
}

# Function to start HubEdu.ai
start_hubedu() {
    echo -e "${GREEN}🎓 Iniciando HubEdu.ai na porta $PORT...${NC}"
    
    # Start HubEdu.ai
    npm start > hubedu.log 2>&1 &
    HUBEDU_PID=$!
    echo "HubEdu.ai PID: $HUBEDU_PID" > hubedu.pid
    
    # Wait a bit for HubEdu.ai to start
    sleep 3
    
    # Check if HubEdu.ai is running
    if check_port $PORT; then
        echo -e "${GREEN}✅ HubEdu.ai rodando na porta $PORT${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar HubEdu.ai${NC}"
        return 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Parando servidores...${NC}"
    
    if [ -f "hubedu.pid" ]; then
        HUBEDU_PID=$(cat hubedu.pid)
        kill $HUBEDU_PID 2>/dev/null
        rm hubedu.pid
    fi
    
    if [ -f "enem-api.pid" ]; then
        ENEM_PID=$(cat enem-api.pid)
        kill $ENEM_PID 2>/dev/null
        rm enem-api.pid
    fi
    
    echo -e "${GREEN}✅ Servidores parados${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start ENEM API first
start_enem_api
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao iniciar ENEM API. Abortando...${NC}"
    exit 1
fi

# Start HubEdu.ai
start_hubedu
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao iniciar HubEdu.ai. Abortando...${NC}"
    cleanup
    exit 1
fi

echo -e "\n${BLUE}🎉 Ambos os servidores estão rodando!${NC}"
echo -e "${GREEN}📊 Status:${NC}"
echo -e "   - HubEdu.ai: http://localhost:$PORT"
echo -e "   - ENEM API: http://localhost:3001"
echo -e "\n${YELLOW}📊 Para ver logs:${NC}"
echo -e "   HubEdu.ai: tail -f hubedu.log"
echo -e "   ENEM API: tail -f enem-api.log"

# Keep script running
wait
