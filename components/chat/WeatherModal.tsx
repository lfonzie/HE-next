'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, Cloud, CloudRain, CloudSnow, Zap, Clock } from 'lucide-react';
import { WeatherData, WeatherService } from '@/lib/weather-service';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  className?: string;
}

export function WeatherModal({ isOpen, onClose, city, className = '' }: WeatherModalProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && city) {
      fetchWeatherData();
    }
  }, [isOpen, city]);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await WeatherService.getWeatherByCity(city);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados do clima');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('limpo') || lowerCondition.includes('céu')) {
      return <Sun className="w-8 h-8 text-yellow-500" />;
    } else if (lowerCondition.includes('nublado') || lowerCondition.includes('nuvens')) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    } else if (lowerCondition.includes('chuva')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    } else if (lowerCondition.includes('neve')) {
      return <CloudSnow className="w-8 h-8 text-blue-300" />;
    } else if (lowerCondition.includes('tempestade')) {
      return <Zap className="w-8 h-8 text-purple-500" />;
    } else {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 30) return 'text-red-600';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 10) return 'text-yellow-500';
    if (temp >= 0) return 'text-blue-500';
    return 'text-blue-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-md w-full shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5" />
            <div className="flex flex-col">
              <h2 className="text-xl font-bold">
                {weatherData ? weatherData.city : city}
                {weatherData?.state && (
                  <span className="text-lg font-normal ml-2">
                    {WeatherService.formatStateAbbreviation(weatherData.state)}
                  </span>
                )}
              </h2>
              {weatherData?.country && (
                <span className="text-sm opacity-90">{weatherData.country}</span>
              )}
            </div>
          </div>
          
          {weatherData?.timezone && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 opacity-80" />
              <span className="text-sm opacity-90">
                {WeatherService.formatLocalTime(weatherData.timezone)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Cloud className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao buscar dados</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchWeatherData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {weatherData && !isLoading && (
            <>
              {/* Main Weather Info */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  {getWeatherIcon(weatherData.condition)}
                  <div>
                    <div className={`text-4xl font-bold ${getTemperatureColor(weatherData.temperature)}`}>
                      {weatherData.temperature}°C
                    </div>
                    <div className="text-gray-600 text-lg">{weatherData.condition}</div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">{weatherData.description}</p>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Umidade</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{weatherData.humidity}%</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-600">Vento</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {weatherData.windSpeed} km/h
                  </div>
                  <div className="text-xs text-gray-500">
                    {getWindDirection(weatherData.windDirection)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600">Pressão</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{weatherData.pressure} hPa</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-600">Visibilidade</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{weatherData.visibility} km</div>
                </div>
              </div>

              {/* UV Index */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Índice UV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-gray-900">{weatherData.uvIndex}</div>
                  <div className="text-xs text-gray-600">
                    {weatherData.uvIndex <= 2 ? 'Baixo' : 
                     weatherData.uvIndex <= 5 ? 'Moderado' : 
                     weatherData.uvIndex <= 7 ? 'Alto' : 
                     weatherData.uvIndex <= 10 ? 'Muito Alto' : 'Extremo'}
                  </div>
                </div>
              </div>

              {/* Last Update */}
              <div className="text-center text-xs text-gray-500">
                Última atualização: {new Date(weatherData.timestamp).toLocaleString('pt-BR')}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
