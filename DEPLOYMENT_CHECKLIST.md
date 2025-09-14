# HubEdu.ai + ENEM API Deployment Checklist

## Overview
This checklist ensures the HubEdu.ai and ENEM API application is fully prepared for robust deployment on Render as separate services.

## ✅ Completed Tasks

### 1. Project Structure
- [x] Monorepo confirmed with HubEdu.ai in root and ENEM API in `enem-api-main`
- [x] Both applications have proper `package-lock.json` files (no pnpm conflicts)
- [x] Directory structure verified

### 2. Dependencies
- [x] Single lockfile approach (package-lock.json only)
- [x] TypeScript dependencies verified (@types/node installed)
- [x] Scripts updated for both applications

### 3. Health Endpoints
- [x] `/api/health` endpoint created for HubEdu.ai
- [x] `/api/health` endpoint created for ENEM API
- [x] Both endpoints return proper JSON with service information

### 4. Package.json Scripts
- [x] HubEdu.ai: `build`, `start`, `health` scripts configured
- [x] ENEM API: `build`, `start`, `health` scripts configured
- [x] Health check scripts use proper port defaults

### 5. Render Configuration
- [x] `render.yaml` created with separate services configuration
- [x] HubEdu.ai service: port 10000, health check `/api/health`
- [x] ENEM API service: port 11000, health check `/api/health`
- [x] Environment variables configured for both services

### 6. Start Scripts
- [x] `render-start.sh` updated for separate services
- [x] Proper logging with separate log files
- [x] Port configuration (10000 for HubEdu, 11000 for ENEM API)

### 7. CI/CD
- [x] GitHub Actions workflow created (`.github/workflows/ci.yml`)
- [x] Builds both applications
- [x] Runs linting for both services
- [x] Generates Prisma client for ENEM API

### 8. ENEM API Fixes
- [x] Fallback functionality implemented (`generateFallbackQuestions`)
- [x] Proper error handling and logging
- [x] Environment variable support for fallback model

## Environment Variables Required

### HubEdu.ai (Render Dashboard)
```env
NODE_ENV=production
PORT=10000
ENEM_API_BASE=https://enem-api.onrender.com/v1
ENEM_FALLBACK_MODEL=gpt-4o-mini
NEXTAUTH_URL=https://your-hubedu-app.onrender.com
NEXTAUTH_SECRET=<strong-secret>
DATABASE_URL=<your-database-url>
OPENAI_API_KEY=<your-openai-key>
```

### ENEM API (Render Dashboard)
```env
NODE_ENV=production
PORT=11000
DATABASE_URL=<your-database-url>
```

## Local Testing Commands

### Build and Start
```bash
# HubEdu.ai
cd /Users/lf/Documents/HE-next
npm install
npm run build
PORT=10000 npm start

# ENEM API
cd enem-api-main
npm install
npx prisma generate
npm run build
PORT=11000 npm start
```

### Test Endpoints
```bash
# Health checks
curl http://localhost:10000/api/health
curl http://localhost:11000/api/health

# ENEM API endpoints
curl http://localhost:11000/v1/exams
curl http://localhost:10000/api/enem/questions?area=linguagens&limit=5
```

## Deployment Steps

1. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add render.yaml and health checks for HubEdu and ENEM API"
   git push origin main
   ```

2. **Deploy to Render**
   - Import `render.yaml` in Render dashboard
   - Provide `NEXTAUTH_SECRET`, `DATABASE_URL`, and `OPENAI_API_KEY` when prompted
   - Monitor build and deploy logs

3. **Verify Deployment**
   - HubEdu.ai: `https://your-hubedu-app.onrender.com/api/health`
   - ENEM API: `https://enem-api.onrender.com/api/health`
   - Test ENEM questions: `https://your-hubedu-app.onrender.com/api/enem/questions?area=linguagens&limit=5`

## Health Check Endpoints

### HubEdu.ai Health Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "HubEdu.ai",
  "version": "1.0.0",
  "environment": "production",
  "port": "10000",
  "endpoints": {
    "health": "/api/health",
    "enemHealth": "/api/enem/health",
    "enemQuestions": "/api/enem/questions",
    "enemExams": "/api/enem/exams",
    "auth": "/api/auth",
    "chat": "/api/chat"
  }
}
```

### ENEM API Health Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "ENEM API",
  "version": "1.0.0",
  "environment": "production",
  "port": "11000",
  "endpoints": {
    "health": "/api/health",
    "exams": "/v1/exams",
    "questions": "/v1/exams/[year]/questions"
  }
}
```

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure no hardcoded ports in code
2. **Build Failures**: Check `package-lock.json` exists and dependencies are correct
3. **Health Check Failures**: Verify endpoints return 200 status
4. **ENEM API Fallback**: Test with ENEM API stopped to verify fallback works

### Logs
- HubEdu.ai logs: `hubedu.log`
- ENEM API logs: `enem-api.log`
- Render dashboard provides real-time logs

## Final Verification Checklist
- [ ] Both services build successfully
- [ ] Health endpoints return 200 OK
- [ ] ENEM API serves questions at `/v1/exams`
- [ ] HubEdu.ai can fetch questions from ENEM API
- [ ] Fallback works when ENEM API is unavailable
- [ ] No port conflicts
- [ ] Environment variables properly set
- [ ] Logs show no errors
