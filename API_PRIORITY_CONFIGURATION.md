# API Priority Configuration System

## Overview

The system now supports configurable API priorities, allowing you to set APIs as the primary source for all operations. This ensures maximum performance and reliability by prioritizing external APIs over local fallbacks.

## Configuration Options

### API Priority Modes

1. **`api-first`** (Default) - APIs are the primary source
2. **`hybrid`** - Balanced approach using APIs with smart fallbacks
3. **`database-first`** - Local database as primary source

### Supported APIs

- **ENEM API** (`enem.dev`) - Real ENEM questions
- **OpenAI API** - AI-powered content generation
- **Unsplash API** - High-quality images

## Environment Configuration

Add these variables to your `.env.local` file:

```bash
# API Priority Configuration
API_PRIORITY_MODE=api-first

# ENEM API Configuration
ENEM_API_PRIORITY=api
ENEM_ENABLE_REAL_QUESTIONS=true
ENEM_ENABLE_DATABASE_FALLBACK=true
ENEM_ENABLE_AI_FALLBACK=true

# OpenAI API Configuration
OPENAI_API_PRIORITY=api
OPENAI_MODEL_SELECTION=auto

# Unsplash API Configuration
UNSPLASH_API_PRIORITY=api
UNSPLASH_ENABLE_IMAGE_SEARCH=true
UNSPLASH_ENABLE_AUTO_IMAGES=true

# General API Settings
API_CACHE_TIMEOUT=300000
API_ENABLE_RETRIES=true
API_MAX_RETRIES=3
API_ENABLE_LOGGING=true
```

## API Configuration Endpoint

### Get Current Configuration
```bash
GET /api/config
```

Response:
```json
{
  "success": true,
  "config": {
    "enem": {
      "priority": "api",
      "enableRealQuestions": true,
      "enableDatabaseFallback": true,
      "enableAiFallback": true,
      "maxRetries": 3,
      "timeoutMs": 10000
    },
    "openai": {
      "priority": "api",
      "enableStreaming": true,
      "maxTokens": 4000,
      "temperature": 0.7,
      "modelSelection": "auto"
    },
    "unsplash": {
      "priority": "api",
      "enableImageSearch": true,
      "enableAutoImages": true,
      "maxImagesPerRequest": 20
    },
    "general": {
      "enableCaching": true,
      "cacheTimeoutMs": 300000,
      "enableRetries": true,
      "maxRetries": 3,
      "enableLogging": true
    }
  },
  "message": "API configuration retrieved successfully"
}
```

### Update Configuration
```bash
POST /api/config
Content-Type: application/json

{
  "enem": {
    "priority": "api",
    "enableRealQuestions": true
  },
  "openai": {
    "priority": "api",
    "modelSelection": "auto"
  }
}
```

## How It Works

### ENEM Questions Flow (API Priority Mode)

1. **API Check** - Verifies ENEM API availability with intelligent caching
2. **API Request** - Attempts to fetch real questions from `enem.dev`
3. **Database Fallback** - Uses local questions if API fails
4. **AI Generation** - Generates questions with OpenAI if needed
5. **Response** - Returns questions with source information

### Intelligent Caching

- **5-minute cache** for API availability checks
- **Reduced redundant calls** when API is known unavailable
- **Automatic retry** after cache expires
- **Performance optimization** with minimal network overhead

### Error Handling

- **Graceful degradation** when APIs are unavailable
- **Smart fallbacks** maintain functionality
- **Detailed logging** for monitoring and debugging
- **User transparency** about data sources

## Benefits of API Priority Mode

### Performance
- ✅ **Faster response times** with cached API checks
- ✅ **Reduced server load** with external API usage
- ✅ **Optimized resource usage** with intelligent caching

### Reliability
- ✅ **Multiple fallback layers** ensure system availability
- ✅ **Automatic failover** when APIs are down
- ✅ **Consistent user experience** regardless of API status

### Quality
- ✅ **Real ENEM questions** from official sources
- ✅ **High-quality images** from Unsplash
- ✅ **Advanced AI models** for content generation

## Monitoring and Logs

### Console Logs
```
✅ Loaded 20 real ENEM questions from API (API Priority Mode)
📵 ENEM API not available (cached), falling back to database/AI generation
✅ Loaded 15 questions from database (API Priority Mode)
🤖 Generating 5 questions with AI for area: matematica (API Priority Mode)
```

### API Status Indicators
- `enem.dev` - Real ENEM questions
- `database` - Local questions
- `ai` - AI-generated content
- `hybrid` - Mixed sources

## Troubleshooting

### API Not Available
If external APIs are down:
1. System automatically falls back to local sources
2. Check API status with `/api/config`
3. Monitor logs for error patterns
4. Verify API keys in environment variables

### Performance Issues
If experiencing slow responses:
1. Check cache configuration (`API_CACHE_TIMEOUT`)
2. Verify retry settings (`API_MAX_RETRIES`)
3. Monitor API response times
4. Consider adjusting timeout values

### Configuration Issues
If configuration isn't applying:
1. Restart the development server
2. Verify environment variables
3. Check API configuration endpoint
4. Review console logs for errors

## Best Practices

### Development
- Use `api-first` mode for testing API integrations
- Enable all fallbacks for reliability
- Monitor logs for API performance
- Test with different API priority modes

### Production
- Use `hybrid` mode for balanced performance
- Enable caching for better performance
- Set appropriate timeout values
- Monitor API usage and costs

### Monitoring
- Track API success rates
- Monitor response times
- Log API errors and fallbacks
- Set up alerts for API failures

## Migration from Previous System

The new API priority system is backward compatible:

1. **Existing configurations** continue to work
2. **Default behavior** prioritizes APIs
3. **Fallback mechanisms** remain intact
4. **No breaking changes** to existing functionality

## Status

✅ **IMPLEMENTED**: API Priority Configuration System
✅ **CONFIGURED**: ENEM API with intelligent caching
✅ **ENHANCED**: Error handling and fallback mechanisms
✅ **DOCUMENTED**: Complete configuration guide
✅ **TESTED**: Backward compatibility verified

The system now prioritizes APIs as the primary source while maintaining robust fallback mechanisms for maximum reliability.
