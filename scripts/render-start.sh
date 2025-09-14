#!/bin/bash

# Render Start Script for HubEdu.ai + ENEM API
echo "🚀 Starting HubEdu.ai and ENEM API on Render..."

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
echo "   ENEM_API_BASE: ${ENEM_API_BASE:+SET}"

# Verify build artifacts exist
echo -e "${BLUE}🔍 Verifying builds...${NC}"
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ HubEdu.ai build not found - .next directory missing${NC}"
    echo -e "${YELLOW}💡 Run 'npm run build' first${NC}"
    exit 1
fi

if [ ! -d "enem-api-main/.next" ]; then
    echo -e "${RED}❌ ENEM API build not found - .next directory missing${NC}"
    echo -e "${YELLOW}💡 Run 'npm run build' in enem-api-main first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build artifacts verified${NC}"

# Start both services with concurrently, ensuring ENEM API uses port 11000
echo -e "${GREEN}🎓 Starting HubEdu.ai on port $PORT...${NC}"
echo -e "${GREEN}📚 Starting ENEM API on port 11000...${NC}"
echo -e "${BLUE}📝 Starting Next.js servers...${NC}"

concurrently --kill-others --prefix-colors "blue,green" --names "HubEdu,ENEM-API" \
  "npm start 2>&1 | tee hubedu.log" \
  "cd enem-api-main && PORT=11000 npm start 2>&1 | tee enem-api.log"
