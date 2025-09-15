"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { WeatherCard } from './WeatherCard';
import { 
  getWeatherForCity, 
  WeatherCardData, 
  extractCityFromQuery,
  isWeatherQuery 
} from '@/utils/weatherApi';

interface WeatherAnswerProps {
  question: string;
  answer?: string;
}

export function WeatherAnswer({ question, answer }: WeatherAnswerProps) {
  const [weatherData, setWeatherData] = useState<WeatherCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);

  useEffect(() => {
    // Extract city name from the question
    const extractedCity = extractCityFromQuery(question);
    if (extractedCity && isWeatherQuery(question)) {
      // Validate city name before making API call
      const validCityPattern = /^[A-Za-z\s]+$/;
      if (validCityPattern.test(extractedCity) && extractedCity.length > 1 && extractedCity.length < 50) {
        setCityName(extractedCity);
        fetchWeatherData(extractedCity);
      } else {
        setError(`Invalid city name: "${extractedCity}". Please provide a valid city name.`);
      }
    }
  }, [question]);

  const fetchWeatherData = async (city: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWeatherForCity(city);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (cityName) {
      fetchWeatherData(cityName);
    }
  };

  const handleCityChange = (newCity: string) => {
    setCityName(newCity);
    fetchWeatherData(newCity);
  };

  if (loading) {
    return (
      <Card className="weather-loading-card max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading weather data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="weather-error-card max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (weatherData) {
    return (
      <div className="weather-answer">
        <WeatherCard data={weatherData} />
        
        {/* Additional city search */}
        <div className="mt-4 text-center">
          <Button 
            onClick={() => handleCityChange('New York')}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            New York
          </Button>
          <Button 
            onClick={() => handleCityChange('London')}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            London
          </Button>
          <Button 
            onClick={() => handleCityChange('Tokyo')}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            Tokyo
          </Button>
          <Button 
            onClick={() => handleCityChange('São Paulo')}
            variant="outline"
            size="sm"
          >
            São Paulo
          </Button>
        </div>
      </div>
    );
  }

  // If no weather query detected, show the original answer
  if (answer) {
    return (
      <div className="prose prose-sm max-w-none">
        <p>{answer}</p>
      </div>
    );
  }

  return (
    <Card className="weather-no-data-card max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          I can help you with weather information! Try asking about the weather in a specific city.
        </p>
        <div className="mt-4 space-x-2">
          <Button 
            onClick={() => handleCityChange('New York')}
            variant="outline"
            size="sm"
          >
            New York Weather
          </Button>
          <Button 
            onClick={() => handleCityChange('London')}
            variant="outline"
            size="sm"
          >
            London Weather
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeatherAnswer;
