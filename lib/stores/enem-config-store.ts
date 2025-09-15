import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SimulationConfig {
  area: 'matematica' | 'linguagens' | 'ciencias_natureza' | 'ciencias_humanas';
  mode: 'REAL' | 'AI' | 'MIXED';
  total_questions: number;
  duration_sec: number;
  years: number[];
  difficulty: ('EASY' | 'MEDIUM' | 'HARD')[];
  skill_tags: string[];
  fallback_threshold: number;
}

export interface AreaInfo {
  name: string;
  description: string;
  disciplines: string[];
  competencies: string[];
  skills: string[];
}

export interface SimulationModeInfo {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  recommended_for: string;
}

interface EnemConfigState {
  // Configuration
  config: SimulationConfig;
  
  // UI State
  isConfiguring: boolean;
  showAdvancedFilters: boolean;
  
  // Area Information
  areas: Record<string, AreaInfo>;
  modes: Record<string, SimulationModeInfo>;
  
  // Actions
  setConfig: (config: Partial<SimulationConfig>) => void;
  resetConfig: () => void;
  setConfiguring: (configuring: boolean) => void;
  toggleAdvancedFilters: () => void;
  
  // Validation
  validateConfig: () => { isValid: boolean; errors: string[] };
  
  // Presets
  loadPreset: (preset: 'quick' | 'standard' | 'comprehensive') => void;
  savePreset: (name: string) => void;
  getPresets: () => Record<string, SimulationConfig>;
}

const defaultConfig: SimulationConfig = {
  area: 'matematica',
  mode: 'MIXED',
  total_questions: 20,
  duration_sec: 3600, // 1 hour
  years: [2023, 2022, 2021],
  difficulty: ['EASY', 'MEDIUM', 'HARD'],
  skill_tags: [],
  fallback_threshold: 0.7
};

const areas: Record<string, AreaInfo> = {
  matematica: {
    name: 'Matemática e suas Tecnologias',
    description: 'Questões de Matemática, Física e Química com foco em aplicações práticas',
    disciplines: ['Matemática', 'Física', 'Química'],
    competencies: [
      'Compreender e utilizar conceitos matemáticos',
      'Aplicar conhecimentos matemáticos em situações práticas',
      'Resolver problemas utilizando raciocínio lógico'
    ],
    skills: [
      'Álgebra', 'Geometria', 'Trigonometria', 'Estatística', 'Probabilidade',
      'Funções', 'Logaritmos', 'Progressões', 'Análise Combinatória'
    ]
  },
  linguagens: {
    name: 'Linguagens, Códigos e suas Tecnologias',
    description: 'Questões de Língua Portuguesa, Literatura, Língua Estrangeira, Artes e Educação Física',
    disciplines: ['Língua Portuguesa', 'Literatura', 'Língua Estrangeira', 'Artes', 'Educação Física'],
    competencies: [
      'Compreender e interpretar textos',
      'Produzir textos adequados ao contexto',
      'Reconhecer diferentes linguagens e códigos'
    ],
    skills: [
      'Leitura e interpretação', 'Produção textual', 'Gramática', 'Literatura',
      'Língua estrangeira', 'Artes visuais', 'Educação física'
    ]
  },
  ciencias_natureza: {
    name: 'Ciências da Natureza e suas Tecnologias',
    description: 'Questões de Biologia, Física e Química com enfoque em fenômenos naturais',
    disciplines: ['Biologia', 'Física', 'Química'],
    competencies: [
      'Compreender fenômenos naturais',
      'Aplicar conhecimentos científicos',
      'Relacionar ciência, tecnologia e sociedade'
    ],
    skills: [
      'Biologia celular', 'Genética', 'Evolução', 'Ecologia', 'Física mecânica',
      'Termodinâmica', 'Química orgânica', 'Química inorgânica'
    ]
  },
  ciencias_humanas: {
    name: 'Ciências Humanas e suas Tecnologias',
    description: 'Questões de História, Geografia, Filosofia e Sociologia',
    disciplines: ['História', 'Geografia', 'Filosofia', 'Sociologia'],
    competencies: [
      'Compreender processos históricos e geográficos',
      'Analisar questões sociais e políticas',
      'Relacionar diferentes áreas do conhecimento'
    ],
    skills: [
      'História do Brasil', 'História mundial', 'Geografia física', 'Geografia humana',
      'Filosofia', 'Sociologia', 'Política', 'Economia'
    ]
  }
};

const modes: Record<string, SimulationModeInfo> = {
  REAL: {
    name: 'Questões Reais',
    description: 'Apenas questões de provas anteriores do ENEM',
    pros: [
      'Autenticidade garantida',
      'Qualidade comprovada',
      'Estilo oficial do ENEM'
    ],
    cons: [
      'Quantidade limitada',
      'Pode não cobrir todos os tópicos',
      'Dependência da disponibilidade'
    ],
    recommended_for: 'Estudantes que querem praticar com questões oficiais'
  },
  AI: {
    name: 'Questões Geradas por IA',
    description: 'Questões criadas artificialmente baseadas no padrão ENEM',
    pros: [
      'Quantidade ilimitada',
      'Cobertura completa de tópicos',
      'Personalização avançada'
    ],
    cons: [
      'Qualidade pode variar',
      'Não são questões oficiais',
      'Dependência da IA'
    ],
    recommended_for: 'Estudantes que querem praticar com muitos exercícios'
  },
  MIXED: {
    name: 'Modo Misto',
    description: 'Combina questões reais com questões geradas por IA',
    pros: [
      'Melhor dos dois mundos',
      'Cobertura completa',
      'Qualidade equilibrada'
    ],
    cons: [
      'Complexidade maior',
      'Dependência de múltiplas fontes'
    ],
    recommended_for: 'Estudantes que querem a melhor experiência de estudo'
  }
};

export const useEnemConfigStore = create<EnemConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      config: defaultConfig,
      isConfiguring: false,
      showAdvancedFilters: false,
      areas,
      modes,

      // Actions
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig }
        })),

      resetConfig: () =>
        set({ config: defaultConfig }),

      setConfiguring: (configuring) =>
        set({ isConfiguring: configuring }),

      toggleAdvancedFilters: () =>
        set((state) => ({
          showAdvancedFilters: !state.showAdvancedFilters
        })),

      validateConfig: () => {
        const config = get().config;
        const errors: string[] = [];

        if (config.total_questions < 1 || config.total_questions > 100) {
          errors.push('Número de questões deve estar entre 1 e 100');
        }

        if (config.duration_sec < 60 || config.duration_sec > 14400) {
          errors.push('Duração deve estar entre 1 minuto e 4 horas');
        }

        if (config.years.length === 0) {
          errors.push('Selecione pelo menos um ano');
        }

        if (config.difficulty.length === 0) {
          errors.push('Selecione pelo menos um nível de dificuldade');
        }

        if (config.fallback_threshold < 0 || config.fallback_threshold > 1) {
          errors.push('Threshold de fallback deve estar entre 0 e 1');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      },

      loadPreset: (preset) => {
        const presets = {
          quick: {
            ...defaultConfig,
            total_questions: 10,
            duration_sec: 1800, // 30 minutes
            years: [2023],
            difficulty: ['MEDIUM']
          },
          standard: {
            ...defaultConfig,
            total_questions: 20,
            duration_sec: 3600, // 1 hour
            years: [2023, 2022],
            difficulty: ['EASY', 'MEDIUM', 'HARD']
          },
          comprehensive: {
            ...defaultConfig,
            total_questions: 45,
            duration_sec: 7200, // 2 hours
            years: [2023, 2022, 2021, 2020],
            difficulty: ['EASY', 'MEDIUM', 'HARD']
          }
        };

        set({ config: presets[preset] });
      },

      savePreset: (name) => {
        const config = get().config;
        const presets = get().getPresets();
        presets[name] = config;
        
        // Save to localStorage
        localStorage.setItem('enem-presets', JSON.stringify(presets));
      },

      getPresets: () => {
        const stored = localStorage.getItem('enem-presets');
        return stored ? JSON.parse(stored) : {};
      }
    }),
    {
      name: 'enem-config-store',
      partialize: (state) => ({ config: state.config })
    }
  )
);
