"use client"

import React from 'react';
import Image from 'next/image';
import './WeatherCard.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  WeatherCardData, 
  getWeatherIcon, 
  getWeatherDescription, 
  formatTemperature, 
  formatWindSpeed 
} from '@/utils/weatherApi';

interface WeatherCardProps {
  data: WeatherCardData;
  className?: string;
}

export function WeatherCard({ data, className = '' }: WeatherCardProps) {
  const { location, current, forecast, units } = data;
  
  const currentIcon = getWeatherIcon(current.weather_code, true);
  const currentDescription = getWeatherDescription(current.weather_code);
  
  return (
    <Card className={`weather-card max-w-md mx-auto ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            {location}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Image 
              src={currentIcon} 
              alt={currentDescription}
              width={64}
              height={64}
              className="w-16 h-16"
              onError={(e) => {
                // Fallback to a default icon if the image fails to load
                e.currentTarget.src = 'https://openweathermap.org/img/wn/01d@2x.png';
              }}
            />
            <div className="text-left">
              <div className="text-3xl font-bold text-gray-900">
                {formatTemperature(current.temperature_2m, units.temperature)}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {currentDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Droplets className="h-4 w-4 text-blue-500 mb-1" />
            <div className="text-xs text-gray-600">Humidity</div>
            <div className="text-sm font-semibold text-gray-900">
              {Math.round(current.relative_humidity_2m)}%
            </div>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Wind className="h-4 w-4 text-green-500 mb-1" />
            <div className="text-xs text-gray-600">Wind</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatWindSpeed(current.wind_speed_10m, units.wind)}
            </div>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Eye className="h-4 w-4 text-purple-500 mb-1" />
            <div className="text-xs text-gray-600">Direction</div>
            <div className="text-sm font-semibold text-gray-900">
              {current.wind_direction_10m}°
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-900">5-Day Forecast</h4>
          </div>
          
          <div className="space-y-2">
            {forecast.map((day, index) => {
              const dayIcon = getWeatherIcon(day.weather_code, true);
              const dayDescription = getWeatherDescription(day.weather_code);
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image 
                      src={dayIcon} 
                      alt={dayDescription}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                      onError={(e) => {
                        e.currentTarget.src = 'https://openweathermap.org/img/wn/01d@2x.png';
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dayName}</div>
                      <div className="text-xs text-gray-600 capitalize">{dayDescription}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatTemperature(day.max_temp, units.temperature)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTemperature(day.min_temp, units.temperature)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Source */}
        <div className="text-center pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            Data by Open-Meteo
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeatherCard;
