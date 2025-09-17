# Render Deployment Fixes - HubEdu.ai + ENEM API

## Issues Fixed

### 1. Missing .next Directory Error ✅
**Problem**: ENEM API failed to start because it couldn't find the production build in the `.next` directory.

**Solution**: 
- Updated build commands to ensure both HubEdu.ai and ENEM API are built
- Added build verification in `render-start.sh` script
- Created `scripts/render-build.sh` for comprehensive build process

### 2. TypeScript Error with @types/node ✅
**Problem**: Missing `@types/node` dependency causing TypeScript compilation errors.

**Solution**: 
- Verified `@types/node@^22.7.5` is properly installed in ENEM API
- Ensured compatibility with Node.js 22.16.0

### 3. Multiple Lockfiles Warning ✅
**Problem**: Next.js detected both `package-lock.json` and `pnpm-lock.yaml` causing workspace detection issues.

**Solution**: 
- Removed `pnpm-lock.yaml` from `enem-api-main/` directory
- Ensured consistent use of npm package manager

### 4. ENEM API Port Configuration ✅
**Problem**: Need to ensure ENEM API runs on port 11000 as requested.

**Solution**: 
- Updated ENEM API start script to respect PORT environment variable
- Modified `render-start.sh` to set `PORT=11000` for ENEM API
- Updated `package.json` start script: `"start": "next start -p ${PORT:-3000}"`

## Updated Files

### 1. `scripts/render-build.sh` (NEW)
```bash
#!/bin/bash
# Comprehensive build script for Render deployment
# Builds both HubEdu.ai and ENEM API with verification
```

### 2. `scripts/render-start.sh` (UPDATED)
- Added build artifact verification
- Enhanced logging with separate log files
- Improved error handling and diagnostics

### 3. `enem-api-main/package.json` (UPDATED)
- Updated start script to respect PORT environment variable
- Ensured @types/node dependency is properly configured

### 4. `enem-api-main/next.config.mjs` (UPDATED)
- Removed unsupported `outputFileTracingRoot` option for Next.js 14.2.4
- Maintained CORS headers for API endpoints

### 5. `next.config.js` (UPDATED)
- Added `outputFileTracingRoot` for proper workspace detection
- Maintained existing configuration for HubEdu.ai

## Render Configuration

### Build Command
```bash
npm install --prefer-offline --no-audit && npm run build:hubedu && npm run build:enem
```

### Start Command
```bash
./scripts/render-start.sh
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Public URL of the application
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `ENEM_API_URL`: URL of the ENEM API (if using separate service)

## Port Configuration
- **HubEdu.ai**: Uses Render's assigned PORT (default 10000)
- **ENEM API**: Fixed to port 11000

## Testing Locally

### Build Both Applications
```bash
# Build HubEdu.ai
npm run build:hubedu

# Build ENEM API
npm run build:enem

# Or build both
npm run build
```

### Start Both Applications
```bash
# Using the render start script
./scripts/render-start.sh

# Or using npm scripts
npm start
```

### Verify Build Artifacts
```bash
# Check HubEdu.ai build
ls -la .next/

# Check ENEM API build
ls -la enem-api-main/.next/
```

## Alternative: Separate Services

If you prefer to deploy HubEdu.ai and ENEM API as separate Render services:

### HubEdu.ai Service
- **Build Command**: `npm install --prefer-offline --no-audit && npm run build:hubedu`
- **Start Command**: `npm start`
- **Port**: Render assigned PORT (default 10000)

### ENEM API Service
- **Root Directory**: `enem-api-main`
- **Build Command**: `npm install --prefer-offline --no-audit && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- **Port**: 11000
- **Environment Variables**: `PORT=11000`

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix Render deployment issues: .next directory, lockfiles, and port configuration"
   git push origin main
   ```

2. **Update Render Service**:
   - Go to Render dashboard
   - Update build command: `npm install --prefer-offline --no-audit && npm run build:hubedu && npm run build:enem`
   - Update start command: `./scripts/render-start.sh`
   - Ensure all environment variables are set

3. **Deploy**:
   - Trigger manual deploy or wait for automatic deploy
   - Monitor logs for successful builds and startup

4. **Verify Deployment**:
   - Test HubEdu.ai at your Render URL
   - Test ENEM API at `http://your-app.onrender.com:11000/v1/exams/2023`

## Troubleshooting

### Build Failures
- Check that all dependencies are installed
- Verify Prisma schema is valid
- Ensure environment variables are set

### Startup Failures
- Verify `.next` directories exist after build
- Check port configuration
- Review logs for specific error messages

### Port Issues
- Ensure ENEM API is configured for port 11000
- Check Render's port assignment for HubEdu.ai
- Verify firewall/network configuration

## Success Indicators

✅ Both applications build successfully  
✅ `.next` directories are created  
✅ No lockfile warnings  
✅ ENEM API starts on port 11000  
✅ HubEdu.ai starts on assigned port  
✅ Both services respond to requests  
✅ Logs show successful startup messages  

## Next Steps

1. Deploy to Render using the updated configuration
2. Monitor deployment logs for any remaining issues
3. Test both applications thoroughly
4. Set up monitoring and alerting
5. Consider implementing CI/CD pipeline for automated deployments
