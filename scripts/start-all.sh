#!/bin/bash

# HubEdu.ai + ENEM API Startup Script
echo "🚀 Iniciando HubEdu.ai e ENEM API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}🔄 Parando processo na porta $port (PID: $pid)...${NC}"
        kill $pid
        sleep 2
    fi
}

# Check if ports are available
echo -e "${BLUE}🔍 Verificando portas disponíveis...${NC}"

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Porta 3000 já está em uso${NC}"
    read -p "Deseja parar o processo na porta 3000? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 3000
    else
        echo -e "${RED}❌ Não é possível iniciar HubEdu.ai na porta 3000${NC}"
        exit 1
    fi
fi

if check_port 3001; then
    echo -e "${YELLOW}⚠️  Porta 3001 já está em uso${NC}"
    read -p "Deseja parar o processo na porta 3001? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 3001
    else
        echo -e "${RED}❌ Não é possível iniciar ENEM API na porta 3001${NC}"
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Arquivo .env.local não encontrado!${NC}"
    echo -e "${YELLOW}📝 Execute primeiro: ./setup-env.sh${NC}"
    exit 1
fi

# Check if ENEM API .env exists
if [ ! -f "enem-api-main/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado no ENEM API${NC}"
    echo -e "${BLUE}📝 Criando .env para ENEM API...${NC}"
    cat > enem-api-main/.env << 'EOF'
# ENEM API Environment Variables
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="enem-api-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3001"
EOF
fi

# Function to start HubEdu.ai
start_hubedu() {
    echo -e "${GREEN}🎓 Iniciando HubEdu.ai na porta 3000...${NC}"
    cd /Users/lf/Documents/HE-next
    npm run dev > hubedu.log 2>&1 &
    HUBEDU_PID=$!
    echo "HubEdu.ai PID: $HUBEDU_PID" > hubedu.pid
}

# Function to start ENEM API
start_enem_api() {
    echo -e "${GREEN}📚 Iniciando ENEM API na porta 3001...${NC}"
    cd /Users/lf/Documents/HE-next/enem-api-main
    
    # Generate Prisma client and run migrations
    echo -e "${BLUE}🗄️  Configurando banco de dados ENEM API...${NC}"
    npx prisma generate
    npx prisma migrate deploy
    
    npm run dev > ../enem-api.log 2>&1 &
    ENEM_PID=$!
    echo "ENEM API PID: $ENEM_PID" > ../enem-api.pid
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

# Start both servers
start_hubedu
sleep 3
start_enem_api

# Wait a bit for servers to start
sleep 5

# Check if servers are running
if check_port 3000; then
    echo -e "${GREEN}✅ HubEdu.ai rodando em: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Falha ao iniciar HubEdu.ai${NC}"
fi

if check_port 3001; then
    echo -e "${GREEN}✅ ENEM API rodando em: http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Falha ao iniciar ENEM API${NC}"
fi

echo -e "\n${BLUE}🎉 Ambos os servidores estão rodando!${NC}"
echo -e "${YELLOW}📊 Para ver logs:${NC}"
echo -e "   HubEdu.ai: tail -f hubedu.log"
echo -e "   ENEM API: tail -f enem-api.log"
echo -e "\n${YELLOW}🛑 Para parar: Ctrl+C${NC}"

# Keep script running
wait
