export interface WorldBankIndicator {
  id: string;
  name: string;
  source: string;
  sourceNote?: string;
  topics?: Array<{
    id: string;
    value: string;
  }>;
}

export interface WorldBankDataPoint {
  date: string;
  value: number | null;
  country: string;
  countryCode: string;
}

export interface WorldBankSearchResult {
  indicators: WorldBankIndicator[];
  totalResults: number;
  hasMore: boolean;
}

export interface WorldBankDataResult {
  data: WorldBankDataPoint[];
  indicator: WorldBankIndicator;
  country: string;
  countryCode: string;
  totalResults: number;
}

export class WorldBankAPIService {
  private static readonly BASE_URL = 'https://api.worldbank.org/v2';

  static async searchIndicators(query: string, perPage: number = 10): Promise<WorldBankSearchResult> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/indicator?q=${encodeURIComponent(query)}&per_page=${perPage}&format=json`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      // A API retorna um array com metadados no primeiro elemento
      const indicators = data[1] || [];
      
      const formattedIndicators: WorldBankIndicator[] = indicators.map((indicator: any) => ({
        id: indicator.id || '',
        name: indicator.name || 'Indicador sem nome',
        source: indicator.source?.value || 'Fonte não disponível',
        sourceNote: indicator.sourceNote,
        topics: indicator.topics?.map((topic: any) => ({
          id: topic.id,
          value: topic.value
        }))
      }));

      return {
        indicators: formattedIndicators,
        totalResults: data[0]?.total || 0,
        hasMore: formattedIndicators.length === perPage
      };
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
      throw new Error('Erro ao buscar indicadores na World Bank API');
    }
  }

  static async getIndicatorData(
    indicatorId: string, 
    countryCode: string = 'BR', 
    startYear: number = 2010, 
    endYear: number = 2023
  ): Promise<WorldBankDataResult> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/country/${countryCode}/indicator/${indicatorId}?date=${startYear}:${endYear}&format=json`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      // A API retorna um array com metadados no primeiro elemento
      const indicatorData = data[1] || [];
      
      const dataPoints: WorldBankDataPoint[] = indicatorData.map((point: any) => ({
        date: point.date || '',
        value: point.value,
        country: point.country?.value || '',
        countryCode: point.country?.id || countryCode
      }));

      const indicator: WorldBankIndicator = {
        id: indicatorId,
        name: indicatorData[0]?.indicator?.value || 'Indicador não encontrado',
        source: indicatorData[0]?.source?.value || 'Fonte não disponível',
        sourceNote: indicatorData[0]?.sourceNote
      };

      return {
        data: dataPoints,
        indicator,
        country: dataPoints[0]?.country || '',
        countryCode,
        totalResults: dataPoints.length
      };
    } catch (error) {
      console.error('Erro ao buscar dados do indicador:', error);
      throw new Error('Erro ao buscar dados do indicador na World Bank API');
    }
  }

  static async getPopularIndicators(): Promise<WorldBankIndicator[]> {
    const popularIndicatorIds = [
      'NY.GDP.MKTP.CD', // GDP
      'SP.POP.TOTL', // Population
      'SE.ADT.LITR.ZS', // Literacy rate
      'SP.DYN.LE00.IN', // Life expectancy
      'IT.NET.USER.ZS', // Internet users
      'SE.XPD.TOTL.GD.ZS', // Education expenditure
      'SL.UEM.TOTL.ZS', // Unemployment rate
      'FP.CPI.TOTL.ZG' // Inflation rate
    ];

    try {
      const response = await fetch(
        `${this.BASE_URL}/indicator?ids=${popularIndicatorIds.join(';')}&format=json`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const indicators = data[1] || [];
      
      return indicators.map((indicator: any) => ({
        id: indicator.id || '',
        name: indicator.name || 'Indicador sem nome',
        source: indicator.source?.value || 'Fonte não disponível',
        sourceNote: indicator.sourceNote,
        topics: indicator.topics?.map((topic: any) => ({
          id: topic.id,
          value: topic.value
        }))
      }));
    } catch (error) {
      console.error('Erro ao buscar indicadores populares:', error);
      throw new Error('Erro ao buscar indicadores populares na World Bank API');
    }
  }

  static formatValue(value: number | null, decimals: number = 2): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(decimals)}T`;
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(decimals)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(decimals)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(decimals)}K`;
    } else {
      return value.toFixed(decimals);
    }
  }

  static formatYear(year: string): string {
    return year || 'Ano não disponível';
  }

  static getCountryName(countryCode: string): string {
    const countries: { [key: string]: string } = {
      'BR': 'Brasil',
      'US': 'Estados Unidos',
      'CN': 'China',
      'IN': 'Índia',
      'JP': 'Japão',
      'DE': 'Alemanha',
      'GB': 'Reino Unido',
      'FR': 'França',
      'IT': 'Itália',
      'CA': 'Canadá'
    };
    
    return countries[countryCode] || countryCode;
  }

  static getIndicatorCategory(indicatorId: string): string {
    const categories: { [key: string]: string } = {
      'NY.GDP': 'Economia',
      'SP.POP': 'População',
      'SE.ADT': 'Educação',
      'SP.DYN': 'Saúde',
      'IT.NET': 'Tecnologia',
      'SE.XPD': 'Educação',
      'SL.UEM': 'Trabalho',
      'FP.CPI': 'Economia'
    };
    
    for (const [prefix, category] of Object.entries(categories)) {
      if (indicatorId.startsWith(prefix)) {
        return category;
      }
    }
    
    return 'Geral';
  }
}
