// Sistema de Pricing HubEdu.ia
// B2B (Escolas) e B2C (Alunos/Pais)

export interface PricingPlan {
  id: string
  name: string
  type: 'B2B' | 'B2C'
  description: string
  price: number
  currency: 'BRL'
  billing: 'monthly' | 'yearly'
  features: string[]
  limitations?: {
    students?: number
    modules?: string[]
    support?: string
  }
  popular?: boolean
}

export interface SchoolPricing {
  basePrice: number
  studentPrice: number
  minStudents: number
  maxStudents: number
  discounts: {
    students: number
    percentage: number
  }[]
}

// Planos B2B - Escolas
export const B2B_PLANS: PricingPlan[] = [
  {
    id: 'b2b-starter',
    name: 'Escola Iniciante',
    type: 'B2B',
    description: 'Ideal para escolas pequenas começando com HubEdu.ia',
    price: 10,
    currency: 'BRL',
    billing: 'monthly',
    features: [
      'Até 150 alunos',
      'Módulos acadêmicos completos',
      'Módulos de comunicação básicos',
      'Suporte por email',
      'Sistema de prompts institucionais',
      'Relatórios básicos'
    ],
    limitations: {
      students: 150,
      modules: ['aulas', 'enem', 'redacao', 'secretaria', 'financeiro'],
      support: 'email'
    }
  },
  {
    id: 'b2b-standard',
    name: 'Escola Padrão',
    type: 'B2B',
    description: 'Para escolas em crescimento com necessidades expandidas',
    price: 8,
    currency: 'BRL',
    billing: 'monthly',
    features: [
      'Até 500 alunos',
      'Todos os módulos acadêmicos',
      'Todos os módulos de comunicação',
      'Suporte prioritário',
      'Prompts institucionais personalizados',
      'Relatórios avançados',
      'Integração com ERP'
    ],
    limitations: {
      students: 500,
      support: 'priority'
    },
    popular: true
  },
  {
    id: 'b2b-premium',
    name: 'Escola Premium',
    type: 'B2B',
    description: 'Solução completa para grandes instituições',
    price: 6,
    currency: 'BRL',
    billing: 'monthly',
    features: [
      'Alunos ilimitados',
      'Todos os módulos disponíveis',
      'Suporte dedicado',
      'Prompts totalmente personalizados',
      'Analytics avançados',
      'Integração completa com sistemas',
      'Treinamento da equipe',
      'SLA garantido'
    ],
    limitations: {
      students: -1, // Ilimitado
      support: 'dedicated'
    }
  }
]

// Planos B2C - Alunos/Pais
export const B2C_PLANS: PricingPlan[] = [
  {
    id: 'b2c-student',
    name: 'Estudante Individual',
    type: 'B2C',
    description: 'Professor particular digital para alunos independentes',
    price: 39.90,
    currency: 'BRL',
    billing: 'monthly',
    features: [
      'Aulas interativas ilimitadas',
      'Banco completo de questões ENEM',
      'Correção de redações',
      'Chat estudante',
      'Relatórios de progresso',
      'Gamificação e conquistas',
      'Suporte por chat'
    ],
    limitations: {
      modules: ['aulas', 'enem', 'redacao', 'chat-estudante']
    },
    popular: true
  },
  {
    id: 'b2c-family',
    name: 'Família',
    type: 'B2C',
    description: 'Plano familiar com desconto para múltiplos filhos',
    price: 69.90,
    currency: 'BRL',
    billing: 'monthly',
    features: [
      'Até 3 filhos',
      'Todos os recursos do plano estudante',
      'Relatórios familiares',
      'Acompanhamento conjunto',
      'Suporte prioritário',
      'Desconto de 40% no segundo filho'
    ],
    limitations: {
      students: 3
    }
  }
]

// Sistema de desconto por volume para B2B
export const SCHOOL_PRICING: SchoolPricing = {
  basePrice: 10,
  studentPrice: 10,
  minStudents: 1,
  maxStudents: -1, // Ilimitado
  discounts: [
    { students: 50, percentage: 0 },
    { students: 100, percentage: 10 },
    { students: 200, percentage: 15 },
    { students: 500, percentage: 20 },
    { students: 1000, percentage: 25 }
  ]
}

// Função para calcular preço baseado no número de alunos
export function calculateSchoolPrice(studentCount: number): number {
  const { basePrice, discounts } = SCHOOL_PRICING
  
  // Encontra o desconto aplicável
  let applicableDiscount = 0
  for (const discount of discounts) {
    if (studentCount >= discount.students) {
      applicableDiscount = discount.percentage
    }
  }
  
  const pricePerStudent = basePrice * (1 - applicableDiscount / 100)
  return Math.round(pricePerStudent * 100) / 100 // Arredonda para 2 casas decimais
}

// Função para calcular desconto anual
export function calculateAnnualDiscount(monthlyPrice: number): number {
  return monthlyPrice * 12 * 0.85 // 15% de desconto no pagamento anual
}

// Configurações de mercado
export const MARKET_CONFIG = {
  targetRegions: ['Brasil', 'Portugal', 'Angola', 'Moçambique'],
  currency: 'BRL',
  paymentMethods: ['PIX', 'Cartão de Crédito', 'Boleto', 'Débito Automático'],
  trialPeriod: 14, // dias
  moneyBackGuarantee: 30 // dias
}

// Comparação de preços com concorrentes
export const COMPETITOR_ANALYSIS = {
  'Khan Academy': { price: 0, features: ['Básico'], limitations: ['Limitado'] },
  'Coursera': { price: 39.99, features: ['Cursos'], limitations: ['Não específico para ENEM'] },
  'Descomplica': { price: 29.90, features: ['ENEM'], limitations: ['Sem comunicação institucional'] },
  'Stoodi': { price: 19.90, features: ['ENEM'], limitations: ['Sem IA avançada'] }
}

// Função para gerar proposta comercial
export function generateCommercialProposal(schoolInfo: {
  name: string
  studentCount: number
  currentSystem?: string
  needs: string[]
}) {
  const monthlyPrice = calculateSchoolPrice(schoolInfo.studentCount)
  const annualPrice = calculateAnnualDiscount(monthlyPrice)
  const totalAnnual = monthlyPrice * schoolInfo.studentCount * 12
  const totalAnnualWithDiscount = annualPrice * schoolInfo.studentCount
  
  return {
    school: schoolInfo.name,
    students: schoolInfo.studentCount,
    monthlyPricePerStudent: monthlyPrice,
    monthlyTotal: monthlyPrice * schoolInfo.studentCount,
    annualPricePerStudent: annualPrice,
    annualTotal: totalAnnualWithDiscount,
    savings: totalAnnual - totalAnnualWithDiscount,
    roi: {
      timeToValue: '30 dias',
      expectedImprovement: '40% redução em atendimentos manuais',
      costSavings: 'R$ 2.000/mês em redução de equipe'
    }
  }
}
