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

# Start HubEdu.ai service
echo -e "${GREEN}🎓 Starting HubEdu.ai on port $PORT...${NC}"
echo -e "${BLUE}📝 Iniciando servidor Next.js...${NC}"

npm start 2>&1 | tee hubedu.log
