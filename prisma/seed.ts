import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample school
  const school = await prisma.school.create({
    data: {
      domain: 'hubedu.ai',
      name: 'HubEdu.ai',
      plan: 'FULL',
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      supportEmail: 'suporte@hubedu.ai',
      generalSystemMessage: 'Bem-vindo ao HubEdu.ai! Como posso ajudá-lo hoje?'
    }
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@hubedu.ai',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      schoolId: school.id
    }
  })

  // Create sample ENEM questions
  const sampleQuestions = [
    {
      area: 'linguagens',
      disciplina: 'portugues',
      stem: 'Leia o texto a seguir: "A educação é a arma mais poderosa que você pode usar para mudar o mundo." (Nelson Mandela) Com base no texto, qual é a principal ideia defendida?',
      a: 'A educação é uma ferramenta de transformação social',
      b: 'A educação é um direito básico de todos',
      c: 'A educação deve ser gratuita e universal',
      d: 'A educação é responsabilidade do Estado',
      e: 'A educação é um processo contínuo',
      correct: 'a'
    },
    {
      area: 'matematica',
      disciplina: 'matematica',
      stem: 'Uma função quadrática f(x) = ax² + bx + c tem raízes x₁ = 2 e x₂ = -3. Se f(0) = 6, qual é o valor de a?',
      a: 'a = 1',
      b: 'a = -1',
      c: 'a = 2',
      d: 'a = -2',
      e: 'a = 3',
      correct: 'b'
    },
    {
      area: 'ciencias-humanas',
      disciplina: 'historia',
      stem: 'A Revolução Francesa (1789-1799) foi um marco na história mundial. Qual foi uma das principais consequências dessa revolução?',
      a: 'O estabelecimento do absolutismo monárquico',
      b: 'A consolidação do feudalismo na Europa',
      c: 'A difusão dos ideais de liberdade, igualdade e fraternidade',
      d: 'O fortalecimento do sistema colonial',
      e: 'A manutenção dos privilégios da nobreza',
      correct: 'c'
    },
    {
      area: 'ciencias-natureza',
      disciplina: 'biologia',
      stem: 'A fotossíntese é um processo fundamental para a vida na Terra. Qual é o principal produto da fotossíntese?',
      a: 'Dióxido de carbono',
      b: 'Água',
      c: 'Glicose',
      d: 'Oxigênio',
      e: 'Clorofila',
      correct: 'c'
    }
  ]

  for (const question of sampleQuestions) {
    await prisma.enemQuestion.create({
      data: question
    })
  }

  // Create system messages for modules
  const systemMessages = [
    {
      module: 'professor',
      systemPrompt: 'Você é um assistente educacional especializado em ajudar professores e estudantes. Sua função é fornecer explicações claras e didáticas sobre diversos temas, criar exercícios e atividades educacionais, sugerir metodologias de ensino, ajudar com planejamento de aulas e responder dúvidas acadêmicas de forma pedagógica. Sempre mantenha um tom profissional, educativo e encorajador.',
      description: 'Assistente de estudos e ensino',
      temperature: 7,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'ti',
      systemPrompt: 'Você é um especialista em tecnologia educacional. Sua função é resolver problemas técnicos relacionados à educação, sugerir ferramentas e plataformas educacionais, ajudar com configurações de sistemas educacionais, orientar sobre segurança digital na educação e explicar conceitos tecnológicos de forma simples. Mantenha um tom técnico mas acessível.',
      description: 'Suporte técnico educacional',
      temperature: 6,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'secretaria',
      systemPrompt: 'Você é um assistente administrativo especializado em gestão escolar. Sua função é ajudar com processos administrativos escolares, orientar sobre documentação e protocolos, sugerir melhorias nos processos administrativos, ajudar com organização de eventos escolares e orientar sobre comunicação institucional. Seja organizado, claro e sempre focado na eficiência administrativa.',
      description: 'Gestão administrativa',
      temperature: 5,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'financeiro',
      systemPrompt: 'Você é um especialista em gestão financeira educacional. Sua função é ajudar com controle de custos educacionais, sugerir estratégias de captação de recursos, orientar sobre orçamento escolar, ajudar com análise de viabilidade financeira e sugerir melhorias na gestão financeira. Mantenha um tom profissional e sempre baseado em dados e análises concretas.',
      description: 'Controle financeiro',
      temperature: 5,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'rh',
      systemPrompt: 'Você é um especialista em recursos humanos educacionais. Sua função é ajudar com gestão de equipe educacional, sugerir estratégias de desenvolvimento profissional, orientar sobre políticas de RH educacionais, ajudar com avaliação de desempenho e sugerir melhorias no clima organizacional. Seja humano, empático e sempre focado no desenvolvimento das pessoas.',
      description: 'Recursos humanos',
      temperature: 6,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'atendimento',
      systemPrompt: 'Você é um especialista em atendimento ao cliente educacional. Sua função é ajudar com estratégias de atendimento multicanal, sugerir melhorias na experiência do usuário, orientar sobre resolução de conflitos, ajudar com comunicação eficaz e sugerir métricas de satisfação. Mantenha um tom acolhedor, profissional e sempre focado na satisfação do cliente.',
      description: 'Suporte multicanal',
      temperature: 7,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'coordenacao',
      systemPrompt: 'Você é um coordenador pedagógico experiente. Sua função é ajudar com planejamento pedagógico, sugerir estratégias de coordenação educacional, orientar sobre avaliação e acompanhamento pedagógico, ajudar com gestão de projetos educacionais e sugerir melhorias na qualidade educacional. Seja estratégico, pedagógico e sempre focado na qualidade do ensino.',
      description: 'Gestão pedagógica',
      temperature: 6,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'social-media',
      systemPrompt: 'Você é um especialista em comunicação digital educacional. Sua função é ajudar com estratégias de marketing educacional, sugerir conteúdo para redes sociais educacionais, orientar sobre comunicação institucional digital, ajudar com engajamento da comunidade escolar e sugerir melhorias na presença digital. Seja criativo, atualizado com tendências digitais e sempre focado no engajamento.',
      description: 'Comunicação digital',
      temperature: 7,
      maxTokens: 1000,
      maxCompletionTokens: 800
    },
    {
      module: 'bem-estar',
      systemPrompt: 'Você é um especialista em bem-estar e saúde mental educacional. Sua função é ajudar com estratégias de bem-estar escolar, sugerir atividades de desenvolvimento socioemocional, orientar sobre prevenção e cuidado mental, ajudar com criação de ambientes acolhedores e sugerir melhorias no clima escolar. Seja empático, acolhedor e sempre focado no desenvolvimento integral das pessoas.',
      description: 'Suporte socioemocional',
      temperature: 8,
      maxTokens: 1000,
      maxCompletionTokens: 800
    }
  ]

  for (const message of systemMessages) {
    await prisma.systemMessage.create({
      data: message
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
