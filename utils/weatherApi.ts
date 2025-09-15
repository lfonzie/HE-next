/**
 * Weather API utilities for Open-Meteo integration
 * Provides geocoding and weather data fetching functionality
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    weather_code: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    time: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
  daily_units: {
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum: string;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
  };
}

export interface WeatherCardData {
  location: string;
  current: WeatherData['current'];
  forecast: Array<{
    date: string;
    weather_code: number;
    max_temp: number;
    min_temp: number;
    precipitation: number;
  }>;
  units: {
    temperature: string;
    humidity: string;
    wind: string;
    precipitation: string;
  };
}

/**
 * Get coordinates from city name using Open-Meteo Geocoding API
 */
export async function getCoordinates(cityName: string): Promise<Coordinates> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country,
        admin1: result.admin1
      };
    } else {
      throw new Error(`City "${cityName}" not found.`);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Fetch weather data from Open-Meteo API
 */
export async function fetchWeatherData(lat: number, lon: number, temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5&temperature_unit=${temperatureUnit}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
}

/**
 * Get weather data for a city by name
 */
export async function getWeatherForCity(cityName: string, temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<WeatherCardData> {
  const coords = await getCoordinates(cityName);
  const weatherData = await fetchWeatherData(coords.latitude, coords.longitude, temperatureUnit);
  
  // Format location name
  const location = coords.admin1 && coords.country 
    ? `${coords.name}, ${coords.admin1}, ${coords.country}`
    : coords.country 
    ? `${coords.name}, ${coords.country}`
    : coords.name;

  // Format forecast data
  const forecast = weatherData.daily.time.slice(1, 6).map((date, index) => ({
    date,
    weather_code: weatherData.daily.weather_code[index + 1],
    max_temp: weatherData.daily.temperature_2m_max[index + 1],
    min_temp: weatherData.daily.temperature_2m_min[index + 1],
    precipitation: weatherData.daily.precipitation_sum[index + 1]
  }));

  return {
    location,
    current: weatherData.current,
    forecast,
    units: {
      temperature: weatherData.current_units.temperature_2m,
      humidity: weatherData.current_units.relative_humidity_2m,
      wind: weatherData.current_units.wind_speed_10m,
      precipitation: weatherData.daily_units.precipitation_sum
    }
  };
}

/**
 * Weather icon mapping for WMO codes
 * Maps WMO weather codes to OpenWeatherMap icons
 */
export const weatherIconMap: Record<number, string> = {
  0: '01d', // Clear sky
  1: '01d', // Mainly clear
  2: '02d', // Partly cloudy
  3: '04d', // Overcast
  45: '50d', // Fog
  48: '50d', // Depositing rime fog
  51: '09d', // Light drizzle
  53: '09d', // Moderate drizzle
  55: '09d', // Dense drizzle
  56: '09d', // Light freezing drizzle
  57: '09d', // Dense freezing drizzle
  61: '10d', // Slight rain
  63: '10d', // Moderate rain
  65: '10d', // Heavy rain
  66: '09d', // Light freezing rain
  67: '09d', // Heavy freezing rain
  71: '13d', // Slight snow fall
  73: '13d', // Moderate snow fall
  75: '13d', // Heavy snow fall
  77: '13d', // Snow grains
  80: '09d', // Slight rain showers
  81: '09d', // Moderate rain showers
  82: '09d', // Violent rain showers
  85: '13d', // Slight snow showers
  86: '13d', // Heavy snow showers
  95: '11d', // Thunderstorm
  96: '11d', // Thunderstorm with slight hail
  99: '11d'  // Thunderstorm with heavy hail
};

/**
 * Get weather icon URL for a given WMO code
 */
export function getWeatherIcon(code: number, isDay: boolean = true): string {
  const iconCode = weatherIconMap[code] || '01d';
  const dayNight = isDay ? 'd' : 'n';
  return `https://openweathermap.org/img/wn/${iconCode.replace('d', dayNight)}@2x.png`;
}

/**
 * Get weather description for a given WMO code
 */
export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return descriptions[code] || 'Unknown';
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temp: number, unit: string): string {
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${Math.round(temp)}${symbol}`;
}

/**
 * Format wind speed with unit
 */
export function formatWindSpeed(speed: number, unit: string): string {
  if (unit === 'kmh') {
    return `${Math.round(speed)} km/h`;
  } else if (unit === 'mph') {
    return `${Math.round(speed)} mph`;
  } else {
    return `${Math.round(speed)} ${unit}`;
  }
}

/**
 * Check if a message contains weather-related keywords
 */
export function isWeatherQuery(message: string): boolean {
  const weatherKeywords = [
    'weather', 'clima', 'tempo', 'temperatura', 'chuva', 'rain', 'sun', 'sol',
    'nublado', 'cloudy', 'vento', 'wind', 'neve', 'snow', 'storm', 'tempestade'
  ];
  
  const lowerMessage = message.toLowerCase();
  return weatherKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Extract city name from weather query
 */
export function extractCityFromQuery(message: string): string | null {
  // Common patterns for weather queries
  const patterns = [
    /(?:weather|clima|tempo)\s+(?:in|em|na|no)\s+([^,.\?!]+)/i,
    /(?:what's|what is|como está|qual é)\s+(?:the\s+)?(?:weather|clima|tempo)\s+(?:in|em|na|no)\s+([^,.\?!]+)/i,
    /(?:weather|clima|tempo)\s+(?:for|para)\s+([^,.\?!]+)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:weather|clima|tempo)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}
