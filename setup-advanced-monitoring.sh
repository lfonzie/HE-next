#!/bin/bash

# Advanced Monitoring Setup Script
# This script sets up the complete advanced monitoring system

set -e

echo "🚀 Setting up Advanced Monitoring System..."
echo "=============================================="

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

# 1. Install additional dependencies
print_status "Installing advanced monitoring dependencies..."
npm install nodemailer @types/nodemailer recharts

# 2. Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# 3. Apply database migrations
print_status "Applying database migrations..."
npx prisma migrate deploy

# 4. Create necessary directories
print_status "Creating monitoring directories..."
mkdir -p dashboards
mkdir -p lib/alerts
mkdir -p lib/metrics
mkdir -p lib/retention
mkdir -p lib/analytics

# 5. Create startup script for advanced monitoring
print_status "Creating advanced monitoring startup script..."
cat > start-advanced-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Advanced Monitoring Stack..."

# Start the basic telemetry stack
docker-compose -f docker-compose.otel.yml up -d

echo "✅ Advanced Monitoring stack started!"
echo ""
echo "📊 Services available:"
echo "  - OTel Collector: http://localhost:4318"
echo "  - Jaeger UI: http://localhost:16686"
echo "  - Prometheus: http://localhost:9090"
echo "  - Status Dashboard: http://localhost:3000/status"
echo "  - Analytics Dashboard: http://localhost:3000/analytics"
echo "  - SQL Insights: http://localhost:3000/insights"
echo ""
echo "🔧 To stop: docker-compose -f docker-compose.otel.yml down"
EOF

chmod +x start-advanced-monitoring.sh

# 6. Create test script for advanced monitoring
print_status "Creating advanced monitoring test script..."
cat > test-advanced-monitoring.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Advanced Monitoring setup..."

# Test basic telemetry
if curl -s http://localhost:4318/v1/traces > /dev/null; then
    echo "✅ OTel Collector is running"
else
    echo "❌ OTel Collector is not responding"
fi

# Test Next.js app
if curl -s http://localhost:3000/api/status/summary > /dev/null; then
    echo "✅ Next.js app is running"
else
    echo "❌ Next.js app is not responding"
fi

# Test status dashboard
if curl -s http://localhost:3000/status > /dev/null; then
    echo "✅ Status dashboard is accessible"
else
    echo "❌ Status dashboard is not accessible"
fi

# Test analytics dashboard
if curl -s http://localhost:3000/analytics > /dev/null; then
    echo "✅ Analytics dashboard is accessible"
else
    echo "❌ Analytics dashboard is not accessible"
fi

# Test insights
if curl -s http://localhost:3000/insights > /dev/null; then
    echo "✅ SQL Insights is accessible"
else
    echo "❌ SQL Insights is not accessible"
fi

# Test APIs
echo ""
echo "🔗 Testing APIs..."

# Test business metrics API
if curl -s http://localhost:3000/api/metrics/business > /dev/null; then
    echo "✅ Business metrics API is working"
else
    echo "❌ Business metrics API is not working"
fi

# Test insights API
if curl -s http://localhost:3000/api/insights > /dev/null; then
    echo "✅ Insights API is working"
else
    echo "❌ Insights API is not working"
fi

# Test alerts API
if curl -s http://localhost:3000/api/alerts/check > /dev/null; then
    echo "✅ Alerts API is working"
else
    echo "❌ Alerts API is not working"
fi

echo ""
echo "🎉 Advanced Monitoring test completed!"
EOF

chmod +x test-advanced-monitoring.sh

# 7. Create cron job setup script
print_status "Creating cron job setup script..."
cat > setup-cron-jobs.sh << 'EOF'
#!/bin/bash

echo "⏰ Setting up cron jobs for advanced monitoring..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_SECRET=$(openssl rand -hex 32)

echo "Generated CRON_SECRET: $CRON_SECRET"
echo "Add this to your .env file: CRON_SECRET=$CRON_SECRET"

# Create cron jobs
echo "Setting up cron jobs..."

# Alert checking (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * curl -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:3000/api/cron/alerts > /dev/null 2>&1") | crontab -

# Data retention (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * curl -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:3000/api/cron/retention > /dev/null 2>&1") | crontab -

# SQL insights (hourly)
(crontab -l 2>/dev/null; echo "0 * * * * curl -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:3000/api/cron/insights > /dev/null 2>&1") | crontab -

echo "✅ Cron jobs set up successfully!"
echo ""
echo "📋 Cron jobs created:"
echo "  - Alert checking: Every 5 minutes"
echo "  - Data retention: Daily at 2 AM"
echo "  - SQL insights: Hourly"
echo ""
echo "🔧 To view cron jobs: crontab -l"
echo "🔧 To remove cron jobs: crontab -r"
EOF

chmod +x setup-cron-jobs.sh

# 8. Create documentation
print_status "Creating advanced monitoring documentation..."
cat > ADVANCED_MONITORING_GUIDE.md << 'EOF'
# Advanced Monitoring System Guide

## Overview
This system provides comprehensive monitoring, alerting, and analytics for the HE-Next application.

## Features

### 1. Alert System
- **Slack Integration**: Real-time alerts via Slack webhooks
- **Email Alerts**: Email notifications for critical issues
- **Smart Thresholds**: P95 latency, error rates, RPS monitoring
- **AI Provider Monitoring**: Success rates and failure detection

### 2. Business Metrics
- **Lesson Generation**: Time, success rate, token usage
- **AI Provider Performance**: Cost analysis, reliability metrics
- **User Engagement**: Active users, session duration, retention
- **System Health**: Request rates, error rates, latency

### 3. Data Retention
- **Automatic Cleanup**: Configurable retention policies
- **Archiving**: Old data moved to archive tables
- **Optimization**: Database maintenance and optimization
- **Cost Control**: Prevents unlimited data growth

### 4. Advanced Dashboards
- **Grafana Integration**: Professional monitoring dashboards
- **Custom Analytics**: React-based analytics dashboard
- **Real-time Updates**: Live data refresh
- **Interactive Charts**: Recharts integration

### 5. SQL Insights
- **Custom Queries**: Pre-built business intelligence queries
- **Performance Analysis**: Route optimization insights
- **Cost Analysis**: AI spending optimization
- **User Behavior**: Engagement pattern analysis

## Setup

### 1. Environment Variables
```bash
# Alert System
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ALERT_EMAIL_TO=alerts@yourcompany.com
ALERT_EMAIL_FROM=noreply@yourcompany.com

# Cron Jobs
CRON_SECRET=your-secure-cron-secret-here

# Data Retention
RETENTION_ENABLED=true
RETENTION_DAYS_TRACES=30
RETENTION_DAYS_METRICS=90
RETENTION_DAYS_LOGS=14
```

### 2. Start Services
```bash
# Start monitoring stack
./start-advanced-monitoring.sh

# Start Next.js app
npm run dev
```

### 3. Setup Cron Jobs
```bash
# Setup automated tasks
./setup-cron-jobs.sh
```

## Usage

### Dashboards
- **Status**: http://localhost:3000/status
- **Analytics**: http://localhost:3000/analytics
- **Insights**: http://localhost:3000/insights

### APIs
- **Business Metrics**: GET /api/metrics/business
- **SQL Insights**: GET /api/insights
- **Alerts**: GET /api/alerts/check
- **Retention**: GET /api/retention/cleanup

### Cron Jobs
- **Alerts**: Every 5 minutes
- **Retention**: Daily at 2 AM
- **Insights**: Hourly

## Monitoring

### Key Metrics
1. **P95 Latency**: Should be < 1000ms
2. **Error Rate**: Should be < 5%
3. **AI Success Rate**: Should be > 90%
4. **User Retention**: Track weekly retention
5. **Cost Efficiency**: Monitor cost per request

### Alerts
- **Critical**: P95 > 2000ms, Error rate > 10%
- **High**: P95 > 1000ms, Error rate > 5%
- **Medium**: P95 > 500ms, Error rate > 2%
- **Low**: General monitoring

## Troubleshooting

### Common Issues
1. **Collector not receiving data**: Check OTel configuration
2. **Alerts not firing**: Verify Slack/Email configuration
3. **High database usage**: Check retention policies
4. **Slow queries**: Review SQL insights performance

### Logs
- **Application**: Check Next.js logs
- **Collector**: Check Docker logs
- **Database**: Check Neon logs
- **Cron Jobs**: Check system logs

## Maintenance

### Daily
- Check alert status
- Review error rates
- Monitor cost trends

### Weekly
- Review retention policies
- Analyze user engagement
- Check AI provider performance

### Monthly
- Optimize database
- Review alert thresholds
- Update dashboards

## Security

### Best Practices
- Use strong CRON_SECRET
- Secure webhook URLs
- Regular secret rotation
- Monitor access logs

### Data Privacy
- Anonymize user data
- Secure sensitive metrics
- Regular data cleanup
- Compliance with regulations
EOF

print_success "Advanced Monitoring setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your configuration (Slack, Email, etc.)"
echo "2. Start the monitoring stack: ./start-advanced-monitoring.sh"
echo "3. Start your Next.js app: npm run dev"
echo "4. Setup cron jobs: ./setup-cron-jobs.sh"
echo "5. Test the setup: ./test-advanced-monitoring.sh"
echo ""
echo "📚 Documentation:"
echo "  - Advanced Monitoring Guide: ADVANCED_MONITORING_GUIDE.md"
echo "  - OpenTelemetry Setup: OPENTELEMETRY_SETUP.md"
echo ""
echo "🔗 URLs to check:"
echo "  - Status Dashboard: http://localhost:3000/status"
echo "  - Analytics Dashboard: http://localhost:3000/analytics"
echo "  - SQL Insights: http://localhost:3000/insights"
echo "  - Jaeger UI: http://localhost:16686"
echo "  - Prometheus: http://localhost:9090"
echo ""
print_warning "Remember to configure your Slack webhook and email settings!"
