#!/bin/bash

# Render Start Script for HubEdu.ai
echo "🚀 Iniciando HubEdu.ai no Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-10000}

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
