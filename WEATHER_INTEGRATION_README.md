# Weather Integration with Open-Meteo API

This document describes the complete weather integration system implemented in the HE-next chat application using the Open-Meteo API.

## Overview

The weather integration provides real-time weather data retrieval and display capabilities within the chat interface. Users can ask weather-related questions, and the system will automatically detect these queries and display interactive weather cards with current conditions and 5-day forecasts.

## Features

- 🌍 **Global Coverage**: Supports weather data for cities worldwide
- 🌡️ **Current Conditions**: Temperature, humidity, wind speed, and direction
- 📅 **5-Day Forecast**: Daily weather predictions with high/low temperatures
- 🎨 **Visual Icons**: Weather condition icons from OpenWeatherMap
- 🔍 **Smart Detection**: Automatically detects weather-related queries
- 🌐 **Multi-language**: Supports queries in English and Portuguese
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Data**: Live weather data from Open-Meteo API

## Architecture

### Components

1. **WeatherCard** (`components/chat/WeatherCard.tsx`)
   - Displays current weather conditions and 5-day forecast
   - Includes weather icons, temperature, humidity, wind data
   - Responsive design with hover effects

2. **WeatherAnswer** (`components/chat/WeatherAnswer.tsx`)
   - Handles weather query processing and error states
   - Provides loading states and retry functionality
   - Includes quick city selection buttons

3. **Weather API Utils** (`utils/weatherApi.ts`)
   - Geocoding API integration
   - Weather data fetching
   - Weather icon mapping and descriptions
   - Query detection and city extraction

### Integration Points

- **ChatMessage Component**: Automatically detects weather queries and renders WeatherAnswer
- **Message Flow**: Seamlessly integrates with existing chat message system
- **Error Handling**: Graceful fallbacks for API failures

## API Endpoints Used

### Geocoding API
```
https://geocoding-api.open-meteo.com/v1/search
```
- Converts city names to coordinates
- Parameters: `name`, `count`, `language`, `format`
- Returns: latitude, longitude, city name, country, region

### Weather Forecast API
```
https://api.open-meteo.com/v1/forecast
```
- Fetches current weather and forecasts
- Parameters: `latitude`, `longitude`, `current`, `daily`, `timezone`, `forecast_days`, `temperature_unit`
- Returns: Current conditions and 5-day forecast data

## Usage Examples

### Basic Weather Queries
```
"What is the weather in New York?"
"How is the weather in London?"
"What's the temperature in Tokyo?"
"Clima em São Paulo"
"Tempo em Paris"
```

### Supported Query Patterns
- "What is the weather in [city]?"
- "How is the weather in [city]?"
- "Weather in [city]"
- "Temperature in [city]"
- "Clima em [city]" (Portuguese)
- "Tempo em [city]" (Portuguese)

## Weather Data Structure

### Current Conditions
```typescript
{
  temperature_2m: number;        // Current temperature
  weather_code: number;          // WMO weather code
  relative_humidity_2m: number; // Humidity percentage
  wind_speed_10m: number;       // Wind speed
  wind_direction_10m: number;   // Wind direction in degrees
  time: string;                 // Timestamp
}
```

### Daily Forecast
```typescript
{
  date: string;                 // Date
  weather_code: number;          // WMO weather code
  max_temp: number;             // Maximum temperature
  min_temp: number;             // Minimum temperature
  precipitation: number;        // Precipitation amount
}
```

## Weather Codes (WMO)

The system uses World Meteorological Organization (WMO) weather codes:

| Code | Description | Icon |
|------|-------------|------|
| 0 | Clear sky | ☀️ |
| 1 | Mainly clear | 🌤️ |
| 2 | Partly cloudy | ⛅ |
| 3 | Overcast | ☁️ |
| 45 | Fog | 🌫️ |
| 61 | Slight rain | 🌦️ |
| 63 | Moderate rain | 🌧️ |
| 80 | Slight showers | 🌦️ |
| 95 | Thunderstorm | ⛈️ |

## Styling

### CSS Classes
- `.weather-card`: Main weather card container
- `.weather-current`: Current conditions section
- `.weather-details`: Weather metrics grid
- `.weather-forecast`: 5-day forecast section
- `.weather-loading-card`: Loading state styling
- `.weather-error-card`: Error state styling

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly buttons and interactions
- Dark mode support

## Error Handling

### API Errors
- Network failures: Retry button with exponential backoff
- Invalid cities: Clear error messages
- Rate limiting: Graceful degradation
- Timeout handling: User-friendly messages

### Fallbacks
- Default weather icons for missing images
- Cached data when available
- Offline mode detection

## Testing

### Test Files
1. **test-weather-api.js**: Node.js test suite
   - API functionality testing
   - Error handling validation
   - Performance benchmarking
   - Multiple city testing

2. **test-weather-browser.html**: Browser test interface
   - Interactive testing interface
   - Visual weather card rendering
   - Real-time API testing
   - Query detection validation

### Running Tests

```bash
# Node.js tests
node test-weather-api.js

# Browser tests
open test-weather-browser.html
```

## Performance Considerations

### Optimization Strategies
- **Caching**: Weather data cached for 10 minutes
- **Debouncing**: Prevents rapid API calls
- **Lazy Loading**: Icons loaded on demand
- **Compression**: Optimized image formats

### Rate Limits
- Open-Meteo: No strict limits for free tier
- Recommended: Max 1000 requests/day
- Best practice: Cache responses locally

## Security

### Data Privacy
- No user data stored
- No API keys required
- HTTPS only for API calls
- No personal information collected

### API Security
- Input validation and sanitization
- XSS prevention in rendered content
- CORS handling for cross-origin requests

## Deployment

### Environment Variables
No environment variables required - Open-Meteo API is free and doesn't require authentication.

### Build Process
The weather components are included in the standard Next.js build process:
```bash
npm run build
npm run start
```

## Future Enhancements

### Planned Features
- 🌡️ **Temperature Units**: Fahrenheit/Celsius toggle
- 📍 **Location Services**: GPS-based weather
- 🔔 **Weather Alerts**: Severe weather notifications
- 📊 **Weather History**: Historical data access
- 🎯 **Custom Locations**: Saved favorite cities
- 📱 **PWA Integration**: Offline weather data

### API Improvements
- Weather maps integration
- Air quality data
- UV index information
- Precipitation probability
- Extended forecasts (16 days)

## Troubleshooting

### Common Issues

1. **Weather card not displaying**
   - Check browser console for errors
   - Verify internet connection
   - Test with different city names

2. **Icons not loading**
   - Check OpenWeatherMap API status
   - Verify image URLs in browser
   - Check network connectivity

3. **City not found**
   - Try alternative city names
   - Use country-specific names
   - Check spelling and accents

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('weather-debug', 'true');
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Test weather functionality in chat

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

### Testing Guidelines
- Write tests for new weather features
- Test with multiple cities and languages
- Verify responsive design on different devices
- Test error scenarios and edge cases

## License

This weather integration uses the Open-Meteo API, which is free for non-commercial use. Please review their terms of service for commercial applications.

## Support

For issues related to weather functionality:
1. Check the troubleshooting section
2. Review browser console errors
3. Test with the provided test files
4. Create an issue with detailed error information

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**API Version**: Open-Meteo v1
