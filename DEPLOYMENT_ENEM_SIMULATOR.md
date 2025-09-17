# ENEM Simulator - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the enhanced ENEM Simulator application to production environments.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Render account (or similar cloud platform)
- Domain name (optional)

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Application
NODE_ENV="production"
PORT=10000

# Optional: Neon Database (for cloud persistence)
NEON_DATABASE_URL="postgresql://username:password@host:port/database"

# Optional: Redis (for caching)
REDIS_URL="redis://username:password@host:port"

# Optional: Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
```

## Database Setup

### 1. Create Production Database

```sql
-- Create database
CREATE DATABASE enem_simulator_prod;

-- Create user
CREATE USER enem_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE enem_simulator_prod TO enem_user;
```

### 2. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 3. Create Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_enem_questions_area_year ON enemQuestion(area, year);
CREATE INDEX CONCURRENTLY idx_enem_questions_difficulty ON enemQuestion(difficulty);
CREATE INDEX CONCURRENTLY idx_enem_questions_skill_tag ON enemQuestion USING GIN(skill_tag);
CREATE INDEX CONCURRENTLY idx_enem_exams_user_created ON enemExam(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_enem_exam_items_exam_index ON enemExamItem(exam_id, index);
```

## Build Configuration

### 1. Update package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p ${PORT:-10000}",
    "build:analyze": "ANALYZE=true next build",
    "build:production": "NODE_ENV=production next build",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "health:check": "curl -f http://localhost:${PORT:-10000}/api/health || exit 1"
  }
}
```

### 2. Next.js Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['images.unsplash.com', 'your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ]
  }
}

module.exports = nextConfig
```

## Render Deployment

### 1. Create render.yaml

```yaml
services:
  - type: web
    name: enem-simulator
    env: node
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: enem-db
          property: connectionString
      - key: OPENAI_API_KEY
        sync: false
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXTAUTH_URL
        value: https://enem-simulator.onrender.com

databases:
  - name: enem-db
    plan: starter
    databaseName: enem_simulator
    user: enem_user
```

### 2. Deploy to Render

```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Deploy
render deploy
```

## Performance Optimization

### 1. Enable Caching

```javascript
// lib/cache-config.js
export const cacheConfig = {
  redis: {
    url: process.env.REDIS_URL,
    ttl: 3600 // 1 hour
  },
  memory: {
    maxSize: 1000,
    ttl: 300 // 5 minutes
  }
}
```

### 2. Database Connection Pooling

```javascript
// lib/database.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3. Image Optimization

```javascript
// next.config.js
const nextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
}
```

## Monitoring and Logging

### 1. Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check OpenAI API
    const openaiHealthy = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        openai: openaiHealthy ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### 2. Error Tracking

```javascript
// lib/error-tracking.js
export function trackError(error, context) {
  console.error('Error:', error, 'Context:', context);
  
  // Send to external service (e.g., Sentry)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}
```

## Security Considerations

### 1. Rate Limiting

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(identifier: string, limit: number = 10, window: number = 60000) {
  const now = Date.now();
  const windowStart = now - window;
  
  const requests = rateLimitMap.get(identifier) || [];
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  
  return true;
}
```

### 2. Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const questionRequestSchema = z.object({
  area: z.enum(['matematica', 'linguagens', 'ciencias_natureza', 'ciencias_humanas']),
  count: z.number().min(1).max(50),
  mode: z.enum(['REAL', 'AI', 'MIXED']),
  years: z.array(z.number().min(2009).max(2023)).optional(),
  difficulty: z.array(z.enum(['EASY', 'MEDIUM', 'HARD'])).optional()
});
```

## Backup Strategy

### 1. Database Backups

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="enem_simulator_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to cloud storage
aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/
```

### 2. Automated Backups

```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Backup Database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup.sql
          gzip backup.sql
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
```

## Testing in Production

### 1. Smoke Tests

```bash
#!/bin/bash
# smoke-tests.sh

BASE_URL="https://your-domain.com"

# Test health endpoint
curl -f "$BASE_URL/api/health" || exit 1

# Test main pages
curl -f "$BASE_URL/" || exit 1
curl -f "$BASE_URL/enem" || exit 1

# Test API endpoints
curl -f "$BASE_URL/api/enem/exams" -H "Authorization: Bearer test-token" || exit 1

echo "All smoke tests passed!"
```

### 2. Load Testing

```javascript
// tests/load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
};

export default function() {
  let response = http.get('https://your-domain.com/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall settings

2. **OpenAI API Errors**
   - Verify API key is correct
   - Check rate limits
   - Monitor API usage

3. **Memory Issues**
   - Monitor memory usage
   - Implement connection pooling
   - Use streaming for large responses

4. **Performance Issues**
   - Enable caching
   - Optimize database queries
   - Use CDN for static assets

### Debug Commands

```bash
# Check application logs
render logs enem-simulator

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# Test OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Monitor performance
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com/api/health"
```

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check application logs
   - Monitor performance metrics
   - Review error rates

2. **Monthly**
   - Update dependencies
   - Review security patches
   - Analyze usage patterns

3. **Quarterly**
   - Database optimization
   - Performance tuning
   - Security audit

This deployment guide ensures a robust, scalable, and maintainable ENEM Simulator application in production.
