#!/bin/bash

# Setup script for OpenTelemetry with internal status dashboard
# This script sets up the complete telemetry architecture

set -e

echo "🚀 Setting up OpenTelemetry with internal status dashboard..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# 1. Install dependencies
print_status "Installing OpenTelemetry dependencies..."
npm install @opentelemetry/sdk-node @opentelemetry/sdk-trace-web @opentelemetry/api @opentelemetry/semantic-conventions

# 2. Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# 3. Apply database migrations
print_status "Applying database migrations for telemetry tables..."
npx prisma migrate deploy

# 4. Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local from template..."
    cp env.example .env.local
    print_warning "Please update .env.local with your actual values"
else
    print_status ".env.local already exists, skipping..."
fi

# 5. Create collector directory if it doesn't exist
if [ ! -d "collector" ]; then
    print_status "Creating collector directory..."
    mkdir -p collector
fi

# 6. Set up Docker Compose for local development
print_status "Setting up Docker Compose for local development..."
if [ ! -f "docker-compose.otel.yml" ]; then
    print_error "docker-compose.otel.yml not found!"
    exit 1
fi

# 7. Create startup script
print_status "Creating startup script..."
cat > start-telemetry.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting OpenTelemetry stack..."

# Start the collector and monitoring stack
docker-compose -f docker-compose.otel.yml up -d

echo "✅ OpenTelemetry stack started!"
echo ""
echo "📊 Services available:"
echo "  - OTel Collector: http://localhost:4318"
echo "  - Jaeger UI: http://localhost:16686"
echo "  - Prometheus: http://localhost:9090"
echo "  - Status Dashboard: http://localhost:3000/status"
echo ""
echo "🔧 To stop: docker-compose -f docker-compose.otel.yml down"
EOF

chmod +x start-telemetry.sh

# 8. Create stop script
print_status "Creating stop script..."
cat > stop-telemetry.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping OpenTelemetry stack..."
docker-compose -f docker-compose.otel.yml down
echo "✅ OpenTelemetry stack stopped!"
EOF

chmod +x stop-telemetry.sh

# 9. Create test script
print_status "Creating test script..."
cat > test-telemetry.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing OpenTelemetry setup..."

# Test if collector is running
if curl -s http://localhost:4318/v1/traces > /dev/null; then
    echo "✅ OTel Collector is running"
else
    echo "❌ OTel Collector is not responding"
fi

# Test if Next.js app is running
if curl -s http://localhost:3000/api/status/summary > /dev/null; then
    echo "✅ Next.js app is running"
else
    echo "❌ Next.js app is not responding"
fi

# Test if status page is accessible
if curl -s http://localhost:3000/status > /dev/null; then
    echo "✅ Status dashboard is accessible"
else
    echo "❌ Status dashboard is not accessible"
fi

echo ""
echo "🔗 URLs to check:"
echo "  - Status Dashboard: http://localhost:3000/status"
echo "  - Jaeger UI: http://localhost:16686"
echo "  - Prometheus: http://localhost:9090"
EOF

chmod +x test-telemetry.sh

print_success "OpenTelemetry setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Start the telemetry stack: ./start-telemetry.sh"
echo "3. Start your Next.js app: npm run dev"
echo "4. Test the setup: ./test-telemetry.sh"
echo "5. Access the status dashboard: http://localhost:3000/status"
echo ""
echo "📚 Documentation:"
echo "  - Setup guide: OPENTELEMETRY_SETUP.md"
echo "  - Environment variables: env.example"
echo "  - Render deployment: render-telemetry.yaml"
echo ""
print_warning "Remember to configure your database URL and other environment variables!"
