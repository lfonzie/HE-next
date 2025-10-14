// Serviço para integração com Brasil API
// Documentação: https://brasilapi.com.br/docs

export interface City {
  id: number
  nome: string
  estado: {
    id: number
    sigla: string
    nome: string
  }
}

export interface State {
  id: number
  sigla: string
  nome: string
}

// Cache para evitar múltiplas requisições
const citiesCache = new Map<string, City[]>()
const statesCache = new Map<string, State[]>()

export class BrasilApiService {
  private static baseUrl = 'https://brasilapi.com.br/api'

  // Buscar todos os estados
  static async getStates(): Promise<State[]> {
    const cacheKey = 'all-states'
    
    if (statesCache.has(cacheKey)) {
      return statesCache.get(cacheKey)!
    }

    try {
      const response = await fetch(`${this.baseUrl}/ibge/uf/v1`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar estados: ${response.status}`)
      }

      const states = await response.json()
      statesCache.set(cacheKey, states)
      return states
    } catch (error) {
      console.error('Erro ao buscar estados:', error)
      // Fallback para estados básicos em caso de erro
      return [
        { id: 1, sigla: 'AC', nome: 'Acre' },
        { id: 2, sigla: 'AL', nome: 'Alagoas' },
        { id: 3, sigla: 'AP', nome: 'Amapá' },
        { id: 4, sigla: 'AM', nome: 'Amazonas' },
        { id: 5, sigla: 'BA', nome: 'Bahia' },
        { id: 6, sigla: 'CE', nome: 'Ceará' },
        { id: 7, sigla: 'DF', nome: 'Distrito Federal' },
        { id: 8, sigla: 'ES', nome: 'Espírito Santo' },
        { id: 9, sigla: 'GO', nome: 'Goiás' },
        { id: 10, sigla: 'MA', nome: 'Maranhão' },
        { id: 11, sigla: 'MT', nome: 'Mato Grosso' },
        { id: 12, sigla: 'MS', nome: 'Mato Grosso do Sul' },
        { id: 13, sigla: 'MG', nome: 'Minas Gerais' },
        { id: 14, sigla: 'PA', nome: 'Pará' },
        { id: 15, sigla: 'PB', nome: 'Paraíba' },
        { id: 16, sigla: 'PR', nome: 'Paraná' },
        { id: 17, sigla: 'PE', nome: 'Pernambuco' },
        { id: 18, sigla: 'PI', nome: 'Piauí' },
        { id: 19, sigla: 'RJ', nome: 'Rio de Janeiro' },
        { id: 20, sigla: 'RN', nome: 'Rio Grande do Norte' },
        { id: 21, sigla: 'RS', nome: 'Rio Grande do Sul' },
        { id: 22, sigla: 'RO', nome: 'Rondônia' },
        { id: 23, sigla: 'RR', nome: 'Roraima' },
        { id: 24, sigla: 'SC', nome: 'Santa Catarina' },
        { id: 25, sigla: 'SP', nome: 'São Paulo' },
        { id: 26, sigla: 'SE', nome: 'Sergipe' },
        { id: 27, sigla: 'TO', nome: 'Tocantins' }
      ]
    }
  }

  // Buscar cidades por estado
  static async getCitiesByState(stateSigla: string): Promise<City[]> {
    if (citiesCache.has(stateSigla)) {
      return citiesCache.get(stateSigla)!
    }

    try {
      const response = await fetch(`${this.baseUrl}/ibge/municipios/v1/${stateSigla}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar cidades: ${response.status}`)
      }

      const cities = await response.json()
      citiesCache.set(stateSigla, cities)
      return cities
    } catch (error) {
      console.error(`Erro ao buscar cidades do estado ${stateSigla}:`, error)
      // Retornar array vazio em caso de erro
      return []
    }
  }

  // Buscar cidade específica por nome e estado
  static async searchCity(cityName: string, stateSigla: string): Promise<City | null> {
    try {
      const cities = await this.getCitiesByState(stateSigla)
      const city = cities.find(c => 
        c.nome.toLowerCase().includes(cityName.toLowerCase())
      )
      return city || null
    } catch (error) {
      console.error('Erro ao buscar cidade:', error)
      return null
    }
  }

  // Limpar cache (útil para testes ou atualizações)
  static clearCache(): void {
    citiesCache.clear()
    statesCache.clear()
  }
}
