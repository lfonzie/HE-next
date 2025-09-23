export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  description: string;
  icon: string;
  city: string;
  country: string;
  state?: string;
  timezone?: string;
  timestamp: string;
}

export interface WeatherError {
  message: string;
  code: string;
}

export class WeatherService {
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1';
  private static readonly GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1';
  
  /**
   * Busca dados do clima para uma cidade específica
   */
  static async getWeatherByCity(cityName: string): Promise<WeatherData> {
    try {
      // Primeiro, buscar coordenadas da cidade usando geocoding
      const coordinates = await this.getCityCoordinates(cityName);
      
      if (!coordinates) {
        throw new Error(`Cidade "${cityName}" não encontrada`);
      }

      // Buscar dados do clima usando as coordenadas
      const weatherData = await this.getWeatherByCoordinates(
        coordinates.latitude, 
        coordinates.longitude
      );

      return {
        ...weatherData,
        city: coordinates.name,
        country: coordinates.country,
        state: coordinates.state,
        timezone: coordinates.timezone
      };
    } catch (error) {
      console.error('Erro ao buscar dados do clima:', error);
      throw error;
    }
  }

  /**
   * Busca coordenadas de uma cidade usando geocoding
   */
  private static async getCityCoordinates(cityName: string): Promise<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
    state?: string;
    timezone?: string;
  } | null> {
    try {
      const response = await fetch(
        `${this.GEOCODING_URL}/search?name=${encodeURIComponent(cityName)}&count=1&language=pt`
      );

      if (!response.ok) {
        throw new Error(`Erro na API de geocoding: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country,
        state: result.admin1,
        timezone: result.timezone
      };
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      throw error;
    }
  }

  /**
   * Busca dados do clima usando coordenadas
   */
  private static async getWeatherByCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<Omit<WeatherData, 'city' | 'country'>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
      );

      if (!response.ok) {
        throw new Error(`Erro na API do clima: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.current) {
        throw new Error('Dados do clima não disponíveis');
      }

      const current = data.current;
      
      return {
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 3.6), // Convert m/s to km/h
        windDirection: current.wind_direction_10m,
        pressure: Math.round(current.surface_pressure),
        visibility: Math.round(current.visibility / 1000), // Convert m to km
        uvIndex: current.uv_index,
        condition: this.getWeatherCondition(current.weather_code),
        description: this.getWeatherDescription(current.weather_code),
        icon: this.getWeatherIcon(current.weather_code),
        timestamp: current.time
      };
    } catch (error) {
      console.error('Erro ao buscar dados do clima:', error);
      throw error;
    }
  }

  /**
   * Converte código do clima para condição legível
   */
  private static getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Céu limpo',
      1: 'Principalmente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Neblina',
      48: 'Neblina com geada',
      51: 'Chuva leve',
      53: 'Chuva moderada',
      55: 'Chuva forte',
      56: 'Chuva congelante leve',
      57: 'Chuva congelante forte',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      66: 'Chuva congelante leve',
      67: 'Chuva congelante forte',
      71: 'Neve leve',
      73: 'Neve moderada',
      75: 'Neve forte',
      77: 'Grãos de neve',
      80: 'Chuva leve',
      81: 'Chuva moderada',
      82: 'Chuva forte',
      85: 'Neve leve',
      86: 'Neve forte',
      95: 'Tempestade',
      96: 'Tempestade com granizo leve',
      99: 'Tempestade com granizo forte'
    };

    return conditions[code] || 'Condição desconhecida';
  }

  /**
   * Converte código do clima para descrição detalhada
   */
  private static getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Céu completamente limpo',
      1: 'Céu principalmente limpo com poucas nuvens',
      2: 'Parcialmente nublado com algumas nuvens',
      3: 'Céu completamente nublado',
      45: 'Neblina reduzindo a visibilidade',
      48: 'Neblina com geada depositada',
      51: 'Chuva leve intermitente',
      53: 'Chuva moderada intermitente',
      55: 'Chuva forte intermitente',
      56: 'Chuva congelante leve',
      57: 'Chuva congelante forte',
      61: 'Chuva leve contínua',
      63: 'Chuva moderada contínua',
      65: 'Chuva forte contínua',
      66: 'Chuva congelante leve contínua',
      67: 'Chuva congelante forte contínua',
      71: 'Neve leve',
      73: 'Neve moderada',
      75: 'Neve forte',
      77: 'Grãos de neve',
      80: 'Chuva leve com trovões',
      81: 'Chuva moderada com trovões',
      82: 'Chuva forte com trovões',
      85: 'Neve leve com trovões',
      86: 'Neve forte com trovões',
      95: 'Tempestade com trovões',
      96: 'Tempestade com granizo leve',
      99: 'Tempestade com granizo forte'
    };

    return descriptions[code] || 'Condição meteorológica não identificada';
  }

  /**
   * Converte código do clima para ícone
   */
  private static getWeatherIcon(code: number): string {
    const icons: Record<number, string> = {
      0: '☀️',
      1: '🌤️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      48: '🌫️',
      51: '🌦️',
      53: '🌦️',
      55: '🌧️',
      56: '🌨️',
      57: '🌨️',
      61: '🌦️',
      63: '🌧️',
      65: '🌧️',
      66: '🌨️',
      67: '🌨️',
      71: '🌨️',
      73: '🌨️',
      75: '🌨️',
      77: '🌨️',
      80: '⛈️',
      81: '⛈️',
      82: '⛈️',
      85: '⛈️',
      86: '⛈️',
      95: '⛈️',
      96: '⛈️',
      99: '⛈️'
    };

    return icons[code] || '❓';
  }

  /**
   * Valida se uma cidade é válida
   */
  static async validateCity(cityName: string): Promise<boolean> {
    try {
      const coordinates = await this.getCityCoordinates(cityName);
      return coordinates !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Formata o nome do estado de forma abreviada
   */
  static formatStateAbbreviation(state: string): string {
    const stateAbbreviations: Record<string, string> = {
      'São Paulo': 'SP',
      'Rio de Janeiro': 'RJ',
      'Minas Gerais': 'MG',
      'Bahia': 'BA',
      'Paraná': 'PR',
      'Rio Grande do Sul': 'RS',
      'Pernambuco': 'PE',
      'Ceará': 'CE',
      'Pará': 'PA',
      'Santa Catarina': 'SC',
      'Goiás': 'GO',
      'Maranhão': 'MA',
      'Paraíba': 'PB',
      'Espírito Santo': 'ES',
      'Piauí': 'PI',
      'Alagoas': 'AL',
      'Tocantins': 'TO',
      'Rio Grande do Norte': 'RN',
      'Acre': 'AC',
      'Amapá': 'AP',
      'Amazonas': 'AM',
      'Mato Grosso': 'MT',
      'Mato Grosso do Sul': 'MS',
      'Rondônia': 'RO',
      'Roraima': 'RR',
      'Sergipe': 'SE',
      'Distrito Federal': 'DF'
    };

    return stateAbbreviations[state] || state;
  }

  /**
   * Formata o horário local baseado no timezone
   */
  static formatLocalTime(timezone?: string): string {
    if (!timezone) return '';
    
    try {
      const now = new Date();
      
      // Usar Intl.DateTimeFormat para obter o offset correto
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'longOffset'
      });
      
      const parts = formatter.formatToParts(now);
      const time = parts.find(part => part.type === 'hour')?.value + ':' + 
                   parts.find(part => part.type === 'minute')?.value;
      const offset = parts.find(part => part.type === 'timeZoneName')?.value || '';
      
      return `${time} ${offset}`;
    } catch (error) {
      // Fallback para método mais simples
      try {
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        const offset = Math.round((localTime.getTime() - now.getTime()) / (1000 * 60 * 60));
        const offsetString = offset >= 0 ? `GMT+${offset}` : `GMT${offset}`;
        
        return `${localTime.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: timezone 
        })} ${offsetString}`;
      } catch (fallbackError) {
        return '';
      }
    }
  }
}
