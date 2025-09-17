# ENEM API Fixes - Deployment Guide

## Overview
This document outlines the deployment of fixes for the HubEdu.ai ENEM API integration, addressing parsing issues and fallback model configuration.

## Changes Applied

### 1. Debug Logging Enhancement
- **File**: `lib/enem-api.ts`
- **Changes**: Added debug logging to inspect `examsData` structure before processing
- **Purpose**: Helps diagnose API response format issues
- **Code**: `console.log("DEBUG examsData:", JSON.stringify(examsData).slice(0, 300))`

### 2. Normalized Parsing
- **File**: `lib/enem-api.ts`
- **Changes**: Updated parsing to handle various response structures
- **Purpose**: Prevents "No exams found in local server" errors when data exists in different formats
- **Code**: `const examsList = Array.isArray(examsData) ? examsData : examsData.data || examsData.exams || []`

### 3. Fallback Model Configuration
- **File**: `lib/openai.ts`
- **Changes**: Replaced hardcoded `gpt-5-chat-latest` with environment variable
- **Purpose**: Allows configurable fallback model for cost efficiency and speed
- **Code**: `COMPLEX: process.env.ENEM_FALLBACK_MODEL || 'gpt-4o-mini'`

## Environment Variables

### Required Environment Variable
Add the following environment variable to your deployment:

```bash
ENEM_FALLBACK_MODEL=gpt-4o-mini
```

### Local Development Setup
Create or update `.env.local`:

```bash
# ENEM API Configuration
ENEM_FALLBACK_MODEL=gpt-4o-mini
ENEM_API_URL=http://localhost:11000/v1
```

### Render Deployment
1. Go to your Render dashboard
2. Navigate to your service settings
3. Add environment variable:
   - **Key**: `ENEM_FALLBACK_MODEL`
   - **Value**: `gpt-4o-mini`

## Testing Instructions

### Local Testing
1. **Start ENEM API Server**:
   ```bash
   cd enem-api-main
   PORT=11000 npm start
   ```

2. **Start HubEdu.ai**:
   ```bash
   PORT=10000 npm start
   ```

3. **Test API Response Structure**:
   ```bash
   curl http://localhost:11000/v1/exams
   ```

4. **Test HubEdu.ai Integration**:
   ```bash
   curl "http://localhost:10000/api/enem/questions?area=linguagens&limit=5"
   ```

5. **Check Console Logs**:
   - Look for "DEBUG examsData:" logs to verify response structure
   - Verify no "No exams found" errors when data exists
   - Confirm questions are loaded successfully

### Production Testing
1. **Monitor Logs**: Check Render logs for debug output
2. **Test Endpoints**: Verify API responses work correctly
3. **Performance**: Confirm fallback model is cost-efficient

## Deployment Steps

### 1. Commit Changes
```bash
git add lib/enem-api.ts lib/openai.ts
git commit -m "Fix ENEM API parsing and fallback model configuration

- Add debug logging to inspect API response structure
- Implement normalized parsing for various response formats
- Replace hardcoded model with ENEM_FALLBACK_MODEL environment variable
- Default to gpt-4o-mini for cost efficiency"
git push origin main
```

### 2. Deploy to Render
- Changes will auto-deploy if auto-deploy is enabled
- Or manually trigger deployment from Render dashboard

### 3. Set Environment Variables
- Add `ENEM_FALLBACK_MODEL=gpt-4o-mini` to Render environment variables
- Verify the variable is set correctly

### 4. Post-Deployment Verification
- Check logs for debug output
- Test API endpoints
- Verify no parsing errors
- Confirm fallback model is working

## Troubleshooting

### Common Issues

1. **Still Getting "No exams found" Error**:
   - Check debug logs to see actual response structure
   - Update parsing logic if response format differs

2. **Fallback Model Not Working**:
   - Verify `ENEM_FALLBACK_MODEL` environment variable is set
   - Check that the variable is available at runtime

3. **Debug Logs Not Appearing**:
   - Ensure you're looking at the correct log output
   - Check that the API is being called

### Debug Commands

```bash
# Check environment variables
echo $ENEM_FALLBACK_MODEL

# Test API response structure
curl -s http://localhost:11000/v1/exams | jq '.'

# Check HubEdu.ai logs
tail -f logs/app.log
```

## Benefits

1. **Improved Reliability**: Normalized parsing prevents crashes on different response formats
2. **Better Debugging**: Debug logs help identify API response structure issues
3. **Cost Optimization**: Configurable fallback model allows cost-efficient AI generation
4. **Maintainability**: Environment-based configuration makes deployment easier

## Rollback Plan

If issues occur, you can quickly rollback by:

1. Reverting the git commit
2. Removing the `ENEM_FALLBACK_MODEL` environment variable
3. Redeploying

The changes are backward-compatible and won't break existing functionality.
