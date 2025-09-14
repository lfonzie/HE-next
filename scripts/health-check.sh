#!/bin/bash

# Comprehensive Health Check Script for HubEdu.ai
echo "🏥 HubEdu.ai Health Check Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=${PORT:-10000}
BASE_URL="http://localhost:$PORT"
MAX_RETRIES=5
RETRY_DELAY=2

# Health check endpoints
ENDPOINTS=(
    "/api/health"
    "/api/healthz"
    "/api/enem/health"
    "/api/enem/questions?area=linguagens&limit=1"
    "/api/enem/exams"
)

# Function to check if application is running
check_app_running() {
    echo -e "${BLUE}🔍 Checking if application is running on port $PORT...${NC}"
    
    if curl -f -s "$BASE_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Application is not running or not responding${NC}"
        return 1
    fi
}

# Function to test an endpoint
test_endpoint() {
    local endpoint=$1
    local url="$BASE_URL$endpoint"
    local attempt=1
    
    echo -e "${BLUE}🔍 Testing endpoint: $endpoint${NC}"
    
    while [ $attempt -le $MAX_RETRIES ]; do
        echo -e "   Attempt $attempt/$MAX_RETRIES..."
        
        if response=$(curl -f -s -w "HTTPSTATUS:%{http_code}" "$url" 2>/dev/null); then
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
            
            if [ "$http_code" -eq 200 ]; then
                echo -e "${GREEN}   ✅ $endpoint - HTTP $http_code${NC}"
                
                # Show response summary for health endpoints
                if [[ "$endpoint" == *"health"* ]]; then
                    status=$(echo "$body" | jq -r '.status' 2>/dev/null || echo "unknown")
                    echo -e "   📊 Status: $status"
                fi
                
                return 0
            else
                echo -e "${YELLOW}   ⚠️ $endpoint - HTTP $http_code${NC}"
            fi
        else
            echo -e "${RED}   ❌ $endpoint - Connection failed${NC}"
        fi
        
        if [ $attempt -lt $MAX_RETRIES ]; then
            echo -e "   ⏳ Retrying in $RETRY_DELAY seconds...${NC}"
            sleep $RETRY_DELAY
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}   ❌ $endpoint - Failed after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to test ENEM API integration
test_enem_integration() {
    echo -e "${BLUE}🎯 Testing ENEM API Integration...${NC}"
    
    # Test ENEM health endpoint
    if test_endpoint "/api/enem/health"; then
        echo -e "${GREEN}✅ ENEM health endpoint is working${NC}"
    else
        echo -e "${RED}❌ ENEM health endpoint failed${NC}"
        return 1
    fi
    
    # Test ENEM questions endpoint
    echo -e "${BLUE}🔍 Testing ENEM questions endpoint...${NC}"
    if response=$(curl -f -s "$BASE_URL/api/enem/questions?area=linguagens&limit=1" 2>/dev/null); then
        questions_count=$(echo "$response" | jq -r '.questions | length' 2>/dev/null || echo "0")
        source=$(echo "$response" | jq -r '.source' 2>/dev/null || echo "unknown")
        
        if [ "$questions_count" -gt 0 ]; then
            echo -e "${GREEN}✅ ENEM questions endpoint working - $questions_count questions from $source${NC}"
        else
            echo -e "${YELLOW}⚠️ ENEM questions endpoint returned no questions${NC}"
        fi
    else
        echo -e "${RED}❌ ENEM questions endpoint failed${NC}"
        return 1
    fi
    
    # Test ENEM exams endpoint
    echo -e "${BLUE}🔍 Testing ENEM exams endpoint...${NC}"
    if response=$(curl -f -s "$BASE_URL/api/enem/exams" 2>/dev/null); then
        exams_count=$(echo "$response" | jq -r '.length' 2>/dev/null || echo "0")
        
        if [ "$exams_count" -gt 0 ]; then
            echo -e "${GREEN}✅ ENEM exams endpoint working - $exams_count exams available${NC}"
        else
            echo -e "${YELLOW}⚠️ ENEM exams endpoint returned no exams${NC}"
        fi
    else
        echo -e "${RED}❌ ENEM exams endpoint failed${NC}"
        return 1
    fi
}

# Function to show environment info
show_environment() {
    echo -e "${BLUE}🌍 Environment Information:${NC}"
    echo "   NODE_ENV: ${NODE_ENV:-development}"
    echo "   PORT: $PORT"
    echo "   DATABASE_URL: ${DATABASE_URL:+SET}"
    echo "   NEXTAUTH_URL: ${NEXTAUTH_URL:+SET}"
    echo "   OPENAI_API_KEY: ${OPENAI_API_KEY:+SET}"
    echo "   ENEM_FALLBACK_MODEL: ${ENEM_FALLBACK_MODEL:-gpt-4o-mini}"
    echo ""
}

# Main execution
main() {
    show_environment
    
    # Check if application is running
    if ! check_app_running; then
        echo -e "${RED}❌ Cannot proceed with health checks - application is not running${NC}"
        echo -e "${YELLOW}💡 Start the application with: npm run dev or npm start${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}🏥 Running comprehensive health checks...${NC}"
    echo ""
    
    local failed_endpoints=0
    
    # Test all endpoints
    for endpoint in "${ENDPOINTS[@]}"; do
        if ! test_endpoint "$endpoint"; then
            failed_endpoints=$((failed_endpoints + 1))
        fi
        echo ""
    done
    
    # Test ENEM integration
    echo -e "${BLUE}🎯 ENEM API Integration Tests${NC}"
    echo "================================="
    if ! test_enem_integration; then
        failed_endpoints=$((failed_endpoints + 1))
    fi
    
    echo ""
    echo -e "${BLUE}📊 Health Check Summary${NC}"
    echo "=========================="
    
    if [ $failed_endpoints -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
        echo -e "${GREEN}✅ HubEdu.ai is healthy and ready for production${NC}"
        exit 0
    else
        echo -e "${RED}❌ $failed_endpoints endpoint(s) failed${NC}"
        echo -e "${YELLOW}⚠️ Please check the logs and fix the issues${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
