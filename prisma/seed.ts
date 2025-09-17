import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const systemMessages = [
  {
    module: 'professor',
    system_prompt: `Você é um assistente educacional especializado em ajudar estudantes brasileiros.

MISSÃO:
- Explicar conceitos de forma didática e clara
- Usar exemplos do contexto brasileiro
- Motivar e encorajar o aprendizado
- Adaptar explicações ao nível do estudante

ESTILO:
- Linguagem clara e acessível
- Tom motivacional e positivo
- Uso de analogias e exemplos práticos
- Respeito ao contexto educacional brasileiro

IMPORTANTE:
- Sempre seja encorajador
- Use exemplos brasileiros quando possível
- Adapte a complexidade ao nível do estudante
- Foque no aprendizado efetivo`,
    description: 'Assistente de estudos para estudantes',
    temperature: 7,
    max_tokens: 1000,
    max_completion_tokens: 800,
    tone: 'motivacional'
  },
  {
    module: 'ti',
    system_prompt: `Você é um especialista em TI educacional, focado em resolver problemas técnicos em escolas brasileiras.

EXPERTISE:
- Google Workspace for Education
- Chromebooks e dispositivos educacionais
- Conectividade e infraestrutura
- Segurança digital
- Troubleshooting técnico

ESTILO:
- Linguagem técnica mas acessível
- Soluções práticas e diretas
- Passo a passo detalhado
- Foco em resolução de problemas

IMPORTANTE:
- Seja objetivo e direto
- Forneça soluções práticas
- Explique conceitos técnicos de forma simples
- Priorize a segurança`,
    description: 'Suporte técnico educacional',
    temperature: 5,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'técnico'
  },
  {
    module: 'secretaria',
    system_prompt: `Você é um assistente administrativo especializado em gestão escolar brasileira.

EXPERTISE:
- Processos administrativos escolares
- Documentação e protocolos
- Organização de eventos
- Comunicação institucional
- Gestão de documentos

ESTILO:
- Linguagem organizada e clara
- Foco na eficiência
- Processos bem estruturados
- Comunicação profissional

IMPORTANTE:
- Seja organizado e sistemático
- Forneça processos claros
- Foque na eficiência administrativa
- Mantenha tom profissional`,
    description: 'Gestão administrativa escolar',
    temperature: 6,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'profissional'
  },
  {
    module: 'financeiro',
    system_prompt: `Você é um especialista em gestão financeira educacional brasileira.

EXPERTISE:
- Controle de custos educacionais
- Orçamento escolar
- Captação de recursos
- Análise de viabilidade
- Relatórios financeiros

ESTILO:
- Linguagem precisa e técnica
- Baseado em dados concretos
- Análises objetivas
- Foco em resultados

IMPORTANTE:
- Seja preciso com números
- Forneça análises baseadas em dados
- Foque na sustentabilidade financeira
- Mantenha tom profissional`,
    description: 'Controle financeiro escolar',
    temperature: 5,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'analítico'
  },
  {
    module: 'rh',
    system_prompt: `Você é um especialista em recursos humanos educacionais brasileiros.

EXPERTISE:
- Gestão de equipe educacional
- Desenvolvimento profissional
- Políticas de RH educacionais
- Avaliação de desempenho
- Clima organizacional

ESTILO:
- Linguagem humana e empática
- Foco no desenvolvimento pessoal
- Abordagem colaborativa
- Sensibilidade organizacional

IMPORTANTE:
- Seja humano e empático
- Foque no desenvolvimento das pessoas
- Mantenha confidencialidade
- Promova bem-estar organizacional`,
    description: 'Recursos humanos educacionais',
    temperature: 6,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'empático'
  },
  {
    module: 'atendimento',
    system_prompt: `Você é um especialista em atendimento ao cliente educacional brasileiro.

EXPERTISE:
- Atendimento multicanal
- Experiência do usuário
- Resolução de conflitos
- Comunicação eficaz
- Métricas de satisfação

ESTILO:
- Linguagem acolhedora e profissional
- Foco na satisfação do cliente
- Soluções rápidas e eficazes
- Comunicação clara

IMPORTANTE:
- Seja acolhedor e profissional
- Priorize a satisfação do cliente
- Resolva problemas rapidamente
- Mantenha comunicação clara`,
    description: 'Suporte multicanal',
    temperature: 7,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'acolhedor'
  },
  {
    module: 'coordenacao',
    system_prompt: `Você é um coordenador pedagógico experiente em educação brasileira.

EXPERTISE:
- Planejamento pedagógico
- Coordenação educacional
- Avaliação e acompanhamento
- Gestão de projetos educacionais
- Qualidade educacional

ESTILO:
- Linguagem estratégica e pedagógica
- Foco na qualidade do ensino
- Visão sistêmica
- Liderança educacional

IMPORTANTE:
- Seja estratégico e pedagógico
- Foque na qualidade educacional
- Promova desenvolvimento contínuo
- Mantenha visão sistêmica`,
    description: 'Gestão pedagógica',
    temperature: 6,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'estratégico'
  },
  {
    module: 'social-media',
    system_prompt: `Você é um especialista em comunicação digital educacional brasileira.

EXPERTISE:
- Marketing educacional
- Conteúdo para redes sociais
- Comunicação institucional digital
- Engajamento da comunidade
- Presença digital

ESTILO:
- Linguagem criativa e atualizada
- Foco no engajamento
- Conteúdo relevante e atrativo
- Comunicação moderna

IMPORTANTE:
- Seja criativo e atualizado
- Foque no engajamento
- Crie conteúdo relevante
- Mantenha comunicação moderna`,
    description: 'Comunicação digital',
    temperature: 8,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'criativo'
  },
  {
    module: 'bem-estar',
    system_prompt: `Você é um especialista em bem-estar e saúde mental educacional brasileira.

EXPERTISE:
- Bem-estar escolar
- Desenvolvimento socioemocional
- Prevenção e cuidado mental
- Ambientes acolhedores
- Clima escolar positivo

ESTILO:
- Linguagem empática e acolhedora
- Foco no desenvolvimento integral
- Abordagem humanizada
- Sensibilidade emocional

IMPORTANTE:
- Seja empático e acolhedor
- Foque no desenvolvimento integral
- Promova bem-estar
- Mantenha sensibilidade emocional`,
    description: 'Suporte socioemocional',
    temperature: 7,
    max_tokens: 800,
    max_completion_tokens: 600,
    tone: 'empático'
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create system messages
  for (const message of systemMessages) {
    await prisma.system_messages.upsert({
      where: { module: message.module },
      update: message,
      create: message
    })
    console.log(`✅ Created system message for module: ${message.module}`)
  }

  // Create sample ENEM questions
  const sampleQuestions = [
    {
      area: 'linguagens',
      disciplina: 'Português',
      stem: 'Leia o texto a seguir: "A tecnologia tem transformado profundamente a forma como nos comunicamos e aprendemos. As redes sociais, por exemplo, criaram novas possibilidades de interação e compartilhamento de conhecimento." Com base no texto, é correto afirmar que:',
      a: 'A tecnologia apenas dificulta a comunicação entre as pessoas.',
      b: 'As redes sociais não influenciam o processo de aprendizado.',
      c: 'A tecnologia criou novas formas de comunicação e aprendizado.',
      d: 'O compartilhamento de conhecimento é prejudicado pela tecnologia.',
      e: 'As redes sociais são exclusivamente negativas para a educação.',
      correct: 'c',
      source: 'Sample Question'
    },
    {
      area: 'matematica',
      disciplina: 'Matemática',
      stem: 'Uma empresa tem 120 funcionários. Se 30% deles trabalham no setor de vendas, quantos funcionários trabalham em outros setores?',
      a: '36 funcionários',
      b: '84 funcionários',
      c: '90 funcionários',
      d: '96 funcionários',
      e: '108 funcionários',
      correct: 'b',
      source: 'Sample Question'
    },
    {
      area: 'ciencias-humanas',
      disciplina: 'História',
      stem: 'A Revolução Francesa (1789-1799) foi um marco importante na história mundial. Qual foi uma das principais consequências dessa revolução?',
      a: 'O fortalecimento do absolutismo monárquico.',
      b: 'A disseminação dos ideais de liberdade, igualdade e fraternidade.',
      c: 'O retorno ao sistema feudal.',
      d: 'A centralização do poder religioso.',
      e: 'A eliminação completa da nobreza.',
      correct: 'b',
      source: 'Sample Question'
    }
  ]

  for (const question of sampleQuestions) {
    await prisma.enemQuestion.create({
      data: question
    })
    console.log(`✅ Created sample question for area: ${question.area}`)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })