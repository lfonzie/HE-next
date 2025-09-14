#!/bin/bash

# Render Build Script for HubEdu.ai + ENEM API
echo "🔨 Building HubEdu.ai and ENEM API for Render deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set environment variables for production
export NODE_ENV=production

# Log environment variables for debugging
echo -e "${BLUE}🔍 Build Environment:${NC}"
echo "   NODE_ENV: $NODE_ENV"
echo "   DATABASE_URL: ${DATABASE_URL:+SET}"
echo "   NEXTAUTH_URL: ${NEXTAUTH_URL:+SET}"
echo "   ENEM_API_URL: ${ENEM_API_URL:+SET}"

# Install dependencies for main project
echo -e "${GREEN}📦 Installing HubEdu.ai dependencies...${NC}"
npm install --prefer-offline --no-audit

# Build HubEdu.ai
echo -e "${GREEN}🏗️ Building HubEdu.ai...${NC}"
npm run build:hubedu

# Check if HubEdu.ai build was successful
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ HubEdu.ai build failed - .next directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ HubEdu.ai build successful${NC}"

# Build ENEM API
echo -e "${GREEN}🏗️ Building ENEM API...${NC}"
npm run build:enem

# Check if ENEM API build was successful
if [ ! -d "enem-api-main/.next" ]; then
    echo -e "${RED}❌ ENEM API build failed - .next directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ ENEM API build successful${NC}"

echo -e "${GREEN}🎉 All builds completed successfully!${NC}"
echo -e "${BLUE}📁 Build artifacts:${NC}"
echo "   HubEdu.ai: .next/"
echo "   ENEM API: enem-api-main/.next/"