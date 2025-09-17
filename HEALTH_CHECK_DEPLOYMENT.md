# HubEdu.ai Health Check & Deployment Guide

## Overview
This guide provides a comprehensive health check system for HubEdu.ai deployed on Render, ensuring the application correctly integrates with the ENEM.dev API and maintains stable operation.

## Health Endpoints

### 1. `/api/health` - Comprehensive Health Check
- **Purpose**: Main health endpoint for Render monitoring
- **Checks**: Database, ENEM API, OpenAI API key, memory usage
- **Response**: Detailed health status with individual service checks
- **Status Codes**: 200 (healthy), 503 (degraded), 500 (error)

### 2. `/api/healthz` - Basic Health Check
- **Purpose**: Lightweight health check for load balancers
- **Checks**: Basic application status, ENEM API availability
- **Response**: Simple health status with uptime and memory info

### 3. `/api/enem/health` - ENEM API Health Check
- **Purpose**: Specific health check for ENEM.dev API integration
- **Checks**: ENEM API availability, endpoint accessibility
- **Response**: ENEM API status and available endpoints

## Environment Variables

### Required for Production
```env
NODE_ENV=production
PORT=10000
ENEM_FALLBACK_MODEL=gpt-4o-mini
NEXTAUTH_URL=https://your-hubedu-app.onrender.com
NEXTAUTH_SECRET=<strong-secret>
DATABASE_URL=<your-database-url>
OPENAI_API_KEY=<your-openai-key>
```

### Optional
```env
NEXTAUTH_URL=http://localhost:3000  # For development
```

## Health Check Scripts

### Quick Health Checks
```bash
# Basic health check
npm run health

# All health endpoints
npm run test:health

# Comprehensive health check
npm run health:full
```

### Manual Testing
```bash
# Test main health endpoint
curl -f http://localhost:10000/api/health

# Test ENEM integration
curl -f http://localhost:10000/api/enem/questions?area=linguagens&limit=1

# Test ENEM exams
curl -f http://localhost:10000/api/enem/exams
```

## ENEM.dev API Integration

### API Endpoints Used
- `https://api.enem.dev/v1/exams` - List available exams
- `https://api.enem.dev/v1/exams/{year}/questions` - Get questions by year
- `https://api.enem.dev/v1/questions` - Get questions with filters

### Fallback Behavior
1. **Primary**: ENEM.dev API for real questions
2. **Secondary**: Database stored questions
3. **Tertiary**: AI-generated questions using OpenAI
4. **Final**: Mock questions for testing

### Area Mapping
```typescript
const areaMapping = {
  'linguagens': ['linguagens', 'linguagens-codigos'],
  'matematica': ['matematica', 'matemática'],
  'natureza': ['ciencias-natureza', 'natureza'],
  'humanas': ['ciencias-humanas', 'humanas']
}
```

## Deployment Checklist

### Pre-Deployment
- [ ] Verify `package.json` dependencies are up to date
- [ ] Ensure `@types/node` is installed
- [ ] Check `render.yaml` configuration
- [ ] Verify environment variables are set
- [ ] Test health endpoints locally

### Build Process
- [ ] `npm install --prefer-offline --no-audit`
- [ ] `npm run build`
- [ ] Verify `.next` directory is created
- [ ] Check for build errors

### Post-Deployment
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/enem/health` endpoint
- [ ] Test ENEM questions endpoint
- [ ] Verify ENEM API integration
- [ ] Check application logs for errors

## Troubleshooting

### Common Issues

#### 1. "No exams found in enem.dev API"
**Cause**: API response structure mismatch or API unavailable
**Solution**: 
- Check API response structure in logs
- Verify ENEM API is accessible
- Check fallback to AI generation

#### 2. Health check failures
**Cause**: Database connection or API key issues
**Solution**:
- Verify `DATABASE_URL` is correct
- Check `OPENAI_API_KEY` is set
- Ensure all required environment variables are present

#### 3. Port binding issues
**Cause**: Application not respecting `PORT` environment variable
**Solution**:
- Verify `next.config.js` respects `process.env.PORT`
- Check no hardcoded ports in code
- Ensure Render's port configuration

### Debug Commands
```bash
# Check application status
curl -v http://localhost:10000/api/health

# Test ENEM API directly
curl https://api.enem.dev/v1/exams

# Check environment variables
env | grep -E "(NODE_ENV|PORT|DATABASE_URL|OPENAI_API_KEY)"

# View application logs
tail -f hubedu.log
```

## Monitoring

### Render Dashboard
- Monitor service health status
- Check deployment logs
- Verify environment variables
- Monitor resource usage

### Application Logs
Look for these key indicators:
- `✅ Loaded X questions from enem.dev API`
- `✅ Generated X fallback questions using gpt-4o-mini`
- `📵 ENEM API is currently unavailable`
- `❌ Database health check failed`

### Health Check Automation
```bash
# Add to cron for regular health checks
*/5 * * * * curl -f https://your-hubedu-app.onrender.com/api/health || echo "Health check failed"
```

## Performance Optimization

### Caching
- Question cache: 5 minutes
- API availability cache: 5 minutes
- Rate limiting: 1 request per second

### Fallback Strategy
1. Try ENEM.dev API (with timeout)
2. Fall back to database
3. Generate with AI (with retry logic)
4. Use mock questions as last resort

### Error Handling
- Graceful degradation
- Detailed error logging
- Automatic retry mechanisms
- User-friendly error messages

## Security Considerations

### API Keys
- Store securely in Render environment variables
- Never commit to repository
- Use different keys for development/production

### Rate Limiting
- Respect ENEM.dev API rate limits
- Implement client-side rate limiting
- Monitor for abuse

### Health Endpoints
- Health endpoints are public (no authentication required)
- Sensitive information is not exposed
- Only basic status information is returned

## Support

### Logs Location
- Application logs: `hubedu.log`
- Render logs: Available in Render dashboard
- Health check logs: Console output

### Contact
For issues with this health check system or deployment:
1. Check the troubleshooting section
2. Review application logs
3. Test health endpoints manually
4. Verify environment configuration

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Environment**: Production (Render)
