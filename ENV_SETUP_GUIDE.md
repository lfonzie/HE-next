# Environment Variables Setup Guide

## Overview
This guide helps you fix the formatting and configuration issues identified in the lesson generation logs.

## Critical Issues from Logs
Based on the log analysis, these are the main issues to fix:

1. **Pixabay API Error**: `PIXABAY_API_KEY não configurada`
2. **Image Search Failures**: Bing, Pexels, Wikimedia failing
3. **NextAuth JWT Error**: `JWT_SESSION_ERROR`
4. **Empty SchoolId Warning**: `SchoolId is empty for sync mode`
5. **Image Selection Timeout**: `Image selection timeout`

## Quick Setup

### Option 1: Use the Setup Script
```bash
./setup-env.sh
```

### Option 2: Manual Setup
1. Copy `env.local.template` to `.env.local`
2. Replace placeholder values with your actual API keys
3. Restart your development server

## Required API Keys

### Image Search APIs (Critical for fixing log errors)

#### Unsplash API
- **Status**: ✅ Working in logs
- **Get Key**: https://unsplash.com/developers
- **Variable**: `UNSPLASH_ACCESS_KEY`

#### Pixabay API
- **Status**: ❌ Failing - "API key não configurada"
- **Get Key**: https://pixabay.com/api/docs/
- **Variable**: `PIXABAY_API_KEY`

#### Bing Image Search API
- **Status**: ❌ Failing in logs
- **Get Key**: https://azure.microsoft.com/en-us/services/cognitive-services/bing-image-search-api/
- **Variable**: `BING_SEARCH_API_KEY`

#### Pexels API
- **Status**: ❌ Failing in logs
- **Get Key**: https://www.pexels.com/api/
- **Variable**: `PEXELS_API_KEY`

### AI APIs

#### Google Gemini API
- **Status**: ✅ Working (44s generation time)
- **Get Key**: https://ai.google.dev/
- **Variables**: `GOOGLE_GEMINI_API_KEY` or `GEMINI_API_KEY`

#### OpenAI API
- **Status**: ✅ Configured
- **Get Key**: https://platform.openai.com/api-keys
- **Variable**: `OPENAI_API_KEY`

### Authentication

#### NextAuth Secret
- **Status**: ❌ Causing JWT_SESSION_ERROR
- **Generate**: `openssl rand -base64 32`
- **Variable**: `NEXTAUTH_SECRET`

## Environment File Structure

### .env.local (Local Development)
```bash
# Database
DATABASE_URL="postgresql://localhost:5432/hubedu_dev"
DIRECT_URL="postgresql://localhost:5432/hubedu_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# AI APIs
OPENAI_API_KEY="sk-your-openai-key"
GOOGLE_GEMINI_API_KEY="your-gemini-key"

# Image APIs (Critical for fixing log errors)
UNSPLASH_ACCESS_KEY="your-unsplash-key"
PIXABAY_API_KEY="your-pixabay-key"
BING_SEARCH_API_KEY="your-bing-key"
PEXELS_API_KEY="your-pexels-key"

# School Configuration (Fixes empty schoolId warning)
DEFAULT_SCHOOL_ID="default-school-profile"
SYNC_MODE_SCHOOL_ID_REQUIRED=false

# Image Selection (Fixes timeout issues)
IMAGE_SELECTION_TIMEOUT=30000
IMAGE_SELECTION_MAX_RETRIES=3
IMAGE_SELECTION_FALLBACK_ENABLED=true
```

## Performance Optimizations

### Gemini Generation Speed
The logs show Gemini generation taking 44 seconds. Add these variables to optimize:

```bash
GEMINI_GENERATION_TIMEOUT=60000
GEMINI_MAX_RETRIES=3
GEMINI_ENABLE_CACHING=true
GEMINI_CACHE_TTL=3600000
```

### Image Selection Timeout
To fix the "Image selection timeout" error:

```bash
IMAGE_SELECTION_TIMEOUT=30000
IMAGE_SELECTION_MAX_RETRIES=3
IMAGE_SELECTION_FALLBACK_ENABLED=true
```

## Validation

After setting up your environment variables, restart your development server and check:

1. **No Pixabay errors**: Should see successful Pixabay API calls
2. **No JWT errors**: NextAuth should work without JWT_SESSION_ERROR
3. **No empty schoolId warnings**: Should use default school profile
4. **No image selection timeouts**: Images should be found within timeout
5. **Faster generation**: Gemini generation should be faster with caching

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correct
   - Check if the service has usage limits
   - Ensure the key has proper permissions

2. **Still Getting Timeouts**
   - Increase `IMAGE_SELECTION_TIMEOUT`
   - Enable `IMAGE_SELECTION_FALLBACK_ENABLED`
   - Check network connectivity

3. **JWT Errors Persist**
   - Generate a new `NEXTAUTH_SECRET`
   - Clear browser cookies
   - Restart the development server

### Log Monitoring
Watch for these success indicators in your logs:
- ✅ `unsplash: X imagens encontradas`
- ✅ `pixabay: X imagens encontradas`
- ✅ `Found image via smart search`
- ✅ `Gemini lesson generated successfully`

## Security Notes

- Never commit `.env.local` to version control
- Use different API keys for development and production
- Rotate API keys regularly
- Monitor API usage to avoid unexpected charges
