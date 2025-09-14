#!/bin/bash

# Render Start Script for HubEdu.ai with Git Operations
# 
# Usage:
#   ./scripts/render-start.sh                    # Normal execution with git operations
#   SKIP_GIT=true ./scripts/render-start.sh      # Skip git operations
#
# This script will:
# 1. Execute git operations (add, commit, push) if there are changes
# 2. Set production environment variables
# 3. Verify build artifacts exist
# 4. Start the Next.js application
# 5. Perform health checks
# 6. Follow application logs

echo "🚀 Iniciando HubEdu.ai no Render..."

# Check for skip git flag
SKIP_GIT=${SKIP_GIT:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Git operations function
git_operations() {
    echo -e "${PURPLE}📝 Executando operações Git...${NC}"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}⚠️  Não é um repositório Git, pulando operações Git${NC}"
        return 0
    fi
    
    # Check git status
    echo -e "${BLUE}🔍 Verificando status do Git...${NC}"
    git status --porcelain
    
    # Check if there are changes to commit
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✅ Nenhuma alteração para commitar${NC}"
        return 0
    fi
    
    # Add all changes
    echo -e "${BLUE}📦 Adicionando alterações...${NC}"
    git add .
    
    # Generate commit message with timestamp
    COMMIT_MSG="🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S') - Render deployment"
    
    # Commit changes
    echo -e "${BLUE}💾 Fazendo commit: $COMMIT_MSG${NC}"
    git commit -m "$COMMIT_MSG"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Commit realizado com sucesso${NC}"
        
        # Push to remote
        echo -e "${BLUE}🚀 Fazendo push para o repositório remoto...${NC}"
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Push realizado com sucesso${NC}"
        else
            echo -e "${RED}❌ Erro ao fazer push${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Erro ao fazer commit${NC}"
        return 1
    fi
    
    return 0
}

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-10000}

# Execute git operations first (unless skipped)
if [ "$SKIP_GIT" = "false" ]; then
    git_operations
else
    echo -e "${YELLOW}⏭️  Pulando operações Git (SKIP_GIT=true)${NC}"
fi

# Log environment variables for debugging
echo -e "${BLUE}🔍 Environment Variables:${NC}"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   DATABASE_URL: ${DATABASE_URL:+SET}"
echo "   NEXTAUTH_URL: ${NEXTAUTH_URL:+SET}"
echo "   OPENAI_API_KEY: ${OPENAI_API_KEY:+SET}"
echo "   ENEM_FALLBACK_MODEL: ${ENEM_FALLBACK_MODEL:+SET}"

# Verify build artifacts exist
echo -e "${BLUE}🔍 Verifying build...${NC}"
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ HubEdu.ai build not found - .next directory missing${NC}"
    echo -e "${YELLOW}💡 Run 'npm run build' first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build artifacts verified${NC}"

# Start HubEdu.ai service in background
echo -e "${GREEN}🎓 Starting HubEdu.ai on port $PORT...${NC}"
echo -e "${BLUE}📝 Iniciando servidor Next.js...${NC}"

# Start the application and capture PID
npm start > hubedu.log 2>&1 &
APP_PID=$!

# Wait for the application to start
echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
sleep 10

# Health check function
check_health() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${BLUE}🔍 Health check attempt $attempt/$max_attempts...${NC}"
        
        if curl -f -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Health check passed!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Health check failed, retrying in 2 seconds...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ Health check failed after $max_attempts attempts${NC}"
    return 1
}

# Perform health check
if check_health; then
    echo -e "${GREEN}🎉 HubEdu.ai is running successfully!${NC}"
    echo -e "${BLUE}📊 Health endpoints:${NC}"
    echo "   - /api/health (comprehensive health check)"
    echo "   - /api/healthz (basic health check)"
    echo "   - /api/enem/health (ENEM API health check)"
    
    # Keep the script running and show logs
    echo -e "${BLUE}📝 Following application logs...${NC}"
    tail -f hubedu.log
else
    echo -e "${RED}❌ Application failed to start properly${NC}"
    echo -e "${YELLOW}📝 Last 50 lines of logs:${NC}"
    tail -50 hubedu.log
    kill $APP_PID 2>/dev/null
    exit 1
fi
