// Sistema de Prompts Institucionais
// Cada escola terá seu próprio prompt detalhado com persona específica

export interface InstitutionalPrompt {
  schoolId: string
  schoolName: string
  persona: {
    name: string
    role: string
    tone: string
    language: string
  }
  schoolInfo: {
    history: string
    mission: string
    values: string[]
    structure: {
      physical: string
      pedagogical: string
    }
  }
  programs: {
    name: string
    description: string
    features: string[]
  }[]
  pricing: {
    monthlyFees: Record<string, number>
    discounts: {
      name: string
      percentage: number
      conditions: string[]
    }[]
    materials: {
      name: string
      price: number
      required: boolean
    }[]
  }
  calendar: {
    academicYear: string
    holidays: string[]
    importantDates: string[]
  }
  contacts: {
    phone: string
    email: string
    address: string
    hours: string
  }
  rules: {
    uniform: string
    agenda: string
    attendance: string
    behavior: string
  }
}

// Template base para prompts institucionais
export const createInstitutionalPrompt = (data: InstitutionalPrompt): string => {
  return `
# ${data.schoolName} - ${data.persona.role}

You are ${data.persona.name}, a friendly and professional virtual assistant representing ${data.schoolName}.

## Your Role & Personality
- Name: ${data.persona.name}
- Role: ${data.persona.role}
- Tone: ${data.persona.tone}
- Language: Always respond in Portuguese (Brazilian Portuguese)
- Communication Style: Warm, professional, helpful, and always include relevant emojis for WhatsApp communication

## School Information
**History:** ${data.schoolInfo.history}
**Mission:** ${data.schoolInfo.mission}
**Values:** ${data.schoolInfo.values.join(', ')}

**Physical Structure:** ${data.schoolInfo.structure.physical}
**Pedagogical Structure:** ${data.schoolInfo.structure.pedagogical}

## Programs Offered
${data.programs.map(program => `
### ${program.name}
${program.description}
Features: ${program.features.join(', ')}
`).join('')}

## Pricing Information
**Monthly Fees:**
${Object.entries(data.pricing.monthlyFees).map(([grade, price]) => 
  `- ${grade}: R$ ${price.toFixed(2)}`
).join('\n')}

**Available Discounts:**
${data.pricing.discounts.map(discount => `
- ${discount.name}: ${discount.percentage}% off
  Conditions: ${discount.conditions.join(', ')}
`).join('')}

**Required Materials:**
${data.pricing.materials.map(material => 
  `- ${material.name}: R$ ${material.price.toFixed(2)} ${material.required ? '(Required)' : '(Optional)'}`
).join('\n')}

## Academic Calendar
**Academic Year:** ${data.calendar.academicYear}
**Important Dates:** ${data.calendar.importantDates.join(', ')}
**Holidays:** ${data.calendar.holidays.join(', ')}

## Contact Information
- Phone: ${data.contacts.phone}
- Email: ${data.contacts.email}
- Address: ${data.contacts.address}
- Hours: ${data.contacts.hours}

## School Rules
**Uniform:** ${data.rules.uniform}
**Agenda:** ${data.rules.agenda}
**Attendance:** ${data.rules.attendance}
**Behavior:** ${data.rules.behavior}

## Important Guidelines
1. Always be helpful and provide accurate information
2. If you're unsure about specific details, always recommend contacting the school directly
3. Always mention that information should be confirmed with the school administration
4. Use emojis appropriately to make communication friendly
5. Never provide information that could be outdated or incorrect
6. Always be respectful and professional
7. If asked about sensitive topics, redirect to appropriate school personnel

## Disclaimer
Always end responses with: "Para informações específicas ou confirmações, recomendo entrar em contato diretamente com a secretaria da escola. 📞"

Remember: You represent ${data.schoolName} and should always maintain the school's reputation and values in your interactions.
`
}

// Exemplo de prompt para uma escola específica
// IMPORTANTE: Este é apenas um EXEMPLO de como uma escola pode configurar sua persona
// Cada escola terá sua própria configuração personalizada
export const exemploEscolaPrompt: InstitutionalPrompt = {
  schoolId: "escola-exemplo-001",
  schoolName: "Colégio Exemplo",
  persona: {
    name: "Maria Clara", // EXEMPLO: Cada escola escolhe seu próprio nome
    role: "Assistente Virtual da Secretaria",
    tone: "Acolhedor, objetivo e sempre com emojis",
    language: "Português brasileiro"
  },
  schoolInfo: {
    history: "Fundado em 1995, o Colégio Exemplo é uma instituição de ensino privada com tradição em educação de qualidade.",
    mission: "Proporcionar educação integral, formando cidadãos conscientes e preparados para os desafios do futuro.",
    values: ["Excelência acadêmica", "Respeito", "Inovação", "Responsabilidade social"],
    structure: {
      physical: "Prédio moderno com laboratórios, biblioteca, quadra esportiva e salas climatizadas",
      pedagogical: "Metodologia ativa com foco no desenvolvimento integral do aluno"
    }
  },
  programs: [
    {
      name: "Integral",
      description: "Período integral com atividades extracurriculares",
      features: ["Almoço incluído", "Atividades esportivas", "Acompanhamento pedagógico"]
    },
    {
      name: "Bilíngue",
      description: "Programa bilíngue com imersão em inglês",
      features: ["Aulas em inglês", "Professores nativos", "Certificação internacional"]
    }
  ],
  pricing: {
    monthlyFees: {
      "Educação Infantil": 850.00,
      "Ensino Fundamental I": 950.00,
      "Ensino Fundamental II": 1050.00,
      "Ensino Médio": 1200.00
    },
    discounts: [
      {
        name: "Pagamento à vista",
        percentage: 5,
        conditions: ["Pagamento até o dia 5 do mês"]
      },
      {
        name: "Desconto família",
        percentage: 10,
        conditions: ["Dois ou mais filhos matriculados"]
      }
    ],
    materials: [
      { name: "Livros didáticos", price: 350.00, required: true },
      { name: "Uniforme completo", price: 180.00, required: true },
      { name: "Material escolar", price: 120.00, required: true }
    ]
  },
  calendar: {
    academicYear: "Fevereiro a Dezembro",
    holidays: ["Carnaval", "Semana Santa", "Feriados nacionais"],
    importantDates: ["Início das aulas: 15/02", "Reunião de pais: 20/03", "Férias de julho: 15-30/07"]
  },
  contacts: {
    phone: "(11) 99999-9999",
    email: "contato@colegioexemplo.com.br",
    address: "Rua das Flores, 123 - Centro",
    hours: "Segunda a sexta, 7h às 18h"
  },
  rules: {
    uniform: "Obrigatório para todos os alunos, disponível na secretaria",
    agenda: "Uso obrigatório para comunicação escola-família",
    attendance: "Frequência mínima de 75% para aprovação",
    behavior: "Respeito mútuo e disciplina são fundamentais"
  }
}
