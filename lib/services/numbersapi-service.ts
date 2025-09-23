export interface NumberFact {
  number: number;
  text: string;
  type: 'trivia' | 'math' | 'date' | 'year';
  found: boolean;
}

export interface DateFact {
  date: string;
  text: string;
  found: boolean;
}

export interface YearFact {
  year: number;
  text: string;
  found: boolean;
}

export class NumbersAPIService {
  private static readonly BASE_URL = 'http://numbersapi.com';

  static async getTriviaFact(number: number): Promise<NumberFact> {
    try {
      const response = await fetch(`${this.BASE_URL}/${number}/trivia`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const text = await response.text();
      
      return {
        number,
        text: text || 'Fato não encontrado',
        type: 'trivia',
        found: text !== 'Not Found'
      };
    } catch (error) {
      console.error('Erro ao buscar fato trivial:', error);
      throw new Error('Erro ao buscar fato trivial na NumbersAPI');
    }
  }

  static async getMathFact(number: number): Promise<NumberFact> {
    try {
      const response = await fetch(`${this.BASE_URL}/${number}/math`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const text = await response.text();
      
      return {
        number,
        text: text || 'Fato matemático não encontrado',
        type: 'math',
        found: text !== 'Not Found'
      };
    } catch (error) {
      console.error('Erro ao buscar fato matemático:', error);
      throw new Error('Erro ao buscar fato matemático na NumbersAPI');
    }
  }

  static async getDateFact(month: number, day: number): Promise<DateFact> {
    try {
      const response = await fetch(`${this.BASE_URL}/${month}/${day}/date`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const text = await response.text();
      
      return {
        date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`,
        text: text || 'Fato da data não encontrado',
        found: text !== 'Not Found'
      };
    } catch (error) {
      console.error('Erro ao buscar fato da data:', error);
      throw new Error('Erro ao buscar fato da data na NumbersAPI');
    }
  }

  static async getYearFact(year: number): Promise<YearFact> {
    try {
      const response = await fetch(`${this.BASE_URL}/${year}/year`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const text = await response.text();
      
      return {
        year,
        text: text || 'Fato do ano não encontrado',
        found: text !== 'Not Found'
      };
    } catch (error) {
      console.error('Erro ao buscar fato do ano:', error);
      throw new Error('Erro ao buscar fato do ano na NumbersAPI');
    }
  }

  static async getRandomFact(type: 'trivia' | 'math' | 'date' | 'year' = 'trivia'): Promise<NumberFact | DateFact | YearFact> {
    try {
      const response = await fetch(`${this.BASE_URL}/random/${type}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const text = await response.text();
      
      if (type === 'date') {
        return {
          date: 'Data aleatória',
          text: text || 'Fato da data não encontrado',
          found: text !== 'Not Found'
        };
      } else if (type === 'year') {
        return {
          year: Math.floor(Math.random() * (2024 - 1900) + 1900),
          text: text || 'Fato do ano não encontrado',
          found: text !== 'Not Found'
        };
      } else {
        return {
          number: Math.floor(Math.random() * 1000) + 1,
          text: text || 'Fato não encontrado',
          type: type as 'trivia' | 'math',
          found: text !== 'Not Found'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar fato aleatório:', error);
      throw new Error('Erro ao buscar fato aleatório na NumbersAPI');
    }
  }

  static formatFactText(text: string): string {
    if (!text) return 'Fato não disponível';
    
    // Capitaliza a primeira letra
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  static getFactTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'trivia': 'Curiosidade',
      'math': 'Matemática',
      'date': 'Data',
      'year': 'Ano'
    };
    
    return types[type] || type;
  }

  static isValidNumber(number: number): boolean {
    return number >= 0 && number <= 9999;
  }

  static isValidDate(month: number, day: number): boolean {
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
  }

  static isValidYear(year: number): boolean {
    return year >= 1900 && year <= 2024;
  }
}
