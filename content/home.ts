// Conteúdo centralizado para a página home

export const hero = {
  title: "Muito além de um chat com IA",
  subtitle: "Professor digital, automação administrativa e atendimento inteligente em um só lugar",
  cta: {
    primary: "Teste Grátis - Demo IA",
    secondary: "Fale com um especialista"
  }
};

export const numerosQueFalam = [
  { number: "+300h", label: "Economizadas por mês" },
  { number: "70%", label: "Economia em custos operacionais" },
  { number: "15h+", label: "Semanais liberadas para professores" },
  { number: "100%", label: "Brasileiro" }
];

export const depoimentos = [
  {
    name: "Ana Silva",
    role: "Diretora Pedagógica",
    school: "Colégio Crescer • 450 alunos",
    content: "O HubEdu.ia cortou 70% do tempo com tarefas administrativas. Agora, nossa equipe foca no ensino de qualidade.",
    rating: 5
  },
  {
    name: "Carlos Mendes",
    role: "Coordenador de TI",
    school: "Instituto Esperança • 280 alunos",
    content: "Chamados técnicos caíram drasticamente. O que levava horas, agora se resolve em minutos.",
    rating: 5
  },
  {
    name: "Maria Santos",
    role: "Professora de Matemática",
    school: "Escola Nova Era • 320 alunos",
    content: "Os alunos adoram o tutor. É como um professor particular 24/7, com respostas seguras e adequadas à idade.",
    rating: 5
  }
];

export const planos = [
  {
    name: "Escolas até 150 alunos",
    price: "R$ 2.000/mês",
    description: "Preço fixo para escolas pequenas e médias",
    features: [
      "Professor IA 24/7",
      "9 módulos administrativos",
      "Suporte técnico brasileiro",
      "Treinamento completo"
    ],
    cta: "Contratar",
    popular: true
  },
  {
    name: "Escolas maiores",
    price: "Sob consulta",
    description: "Desconto progressivo para escolas maiores",
    features: [
      "Todos os recursos inclusos",
      "Desconto progressivo",
      "Suporte dedicado",
      "Personalização total"
    ],
    cta: "Contratar",
    popular: false
  }
];

export const visual = {
  gradientHero: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500",
  sectionDark: "bg-gradient-to-b from-neutral-950 to-neutral-900",
  gradientCTA: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500"
};

export const features = [
  {
    icon: "🎓",
    title: "Professor Digital",
    description: "IA que responde dúvidas dos alunos 24/7"
  },
  {
    icon: "📞",
    title: "Atendimento Omni-channel",
    description: "WhatsApp, site, Instagram e Google integrados"
  },
  {
    icon: "📊",
    title: "Analytics Educacional",
    description: "Relatórios detalhados de performance"
  },
  {
    icon: "🎯",
    title: "Gestão de Matrículas",
    description: "Automatização completa do processo"
  }
];

export const stats = [
  { number: "500+", label: "Escolas Atendidas" },
  { number: "50K+", label: "Alunos Beneficiados" },
  { number: "95%", label: "Satisfação" },
  { number: "24h", label: "Suporte" }
];

export const modules = [
  {
    icon: "👩‍🏫",
    title: "Professor IA",
    desc: "Suporte 24h em todas as matérias",
    benefits: ["Respostas imediatas", "Conteúdo BNCC", "Adaptado por idade"],
    status: "ativo",
    badge: "Novo!"
  },
  {
    icon: "⚙️",
    title: "TI",
    desc: "80% menos chamados técnicos",
    benefits: ["Suporte automatizado", "Diagnósticos rápidos", "Soluções eficazes"],
    status: "ativo",
    badge: "Popular"
  },
  {
    icon: "📋",
    title: "Atendimento",
    desc: "Matrículas e documentos organizados",
    benefits: ["Processos digitais", "Documentação ágil", "Zero papel"],
    status: "ativo"
  },
  {
    icon: "💰",
    title: "Financeiro",
    desc: "Políticas e prazos claros",
    benefits: ["Pagamentos online", "Lembretes automáticos", "Relatórios claros"],
    status: "ativo"
  },
  {
    icon: "👥",
    title: "RH",
    desc: "Férias e benefícios acessíveis",
    benefits: ["Gestão de pessoal", "Benefícios digitais", "Comunicação eficaz"],
    status: "ativo"
  },
  {
    icon: "🤝",
    title: "Atendimento Omni-Channel",
    desc: "Respostas automáticas em todos os canais",
    benefits: ["WhatsApp integrado", "Respostas consistentes", "Atendimento 24/7"],
    status: "em-breve"
  },
  {
    icon: "📊",
    title: "Relatórios & Analytics",
    desc: "Insights e métricas detalhadas",
    benefits: ["Relatórios automáticos", "Dashboards interativos", "Métricas de performance"],
    status: "em-breve"
  },
  {
    icon: "🔗",
    title: "Integração com Sistemas",
    desc: "Conecta com ERPs existentes",
    benefits: ["Integração seamless", "Sincronização automática", "Compatibilidade total"],
    status: "em-breve"
  },
  {
    icon: "💚",
    title: "Bem-estar e Social Media",
    desc: "Gestão de redes sociais e bem-estar",
    benefits: ["Posts automáticos", "Monitoramento de bem-estar", "Engajamento digital"],
    status: "ativo"
  }
];

export const demoScenarios = [
  {
    title: "Professor IA - Matemática",
    student: "Como resolver 2x + 5 = 15?",
    ai: "Vou te ajudar passo a passo! Primeiro, vamos isolar o x: 2x = 15 - 5, então 2x = 10, logo x = 5. Quer praticar com outro exemplo?"
  },
  {
    title: "Atendimento - Matrícula",
    student: "Oi! Qual é o horário da aula de matemática hoje?",
    ai: "Olá! A aula de matemática hoje é das 14h às 15h30 na sala 205. Não esqueça de trazer o livro e a calculadora! 📚"
  },
  {
    title: "TI - Suporte",
    student: "Estou com dificuldade em física. Vocês têm reforço?",
    ai: "Claro! Temos aulas de reforço de física às terças e quintas das 16h às 17h. Também posso te ajudar com exercícios específicos agora mesmo! 🚀"
  }
];

export const pricingFeatures = [
  "Todos os 8 módulos inclusos",
  "Professor Digital 24/7",
  "Atendimento Omni-channel",
  "Analytics Educacional",
  "Gestão de Matrículas",
  "Conteúdo Personalizado",
  "Notificações Inteligentes",
  "Relatórios Financeiros",
  "Segurança LGPD",
  "Suporte prioritário",
  "Setup em 24h",
  "Treinamento completo"
];

export const comparisonCards = [
  {
    title: "HubEdu.ia",
    priceLabel: "R$ 2.000/mês",
    priceNote: "Por escola (até 150 alunos)",
    bullets: [
      "Professor IA 24/7",
      "9 módulos administrativos",
      "Suporte brasileiro",
      "LGPD compliant",
      "Setup em 24h"
    ],
    variant: "highlight"
  },
  {
    title: "ChatGPT Plus",
    priceLabel: "R$ 80/mês",
    priceNote: "Por usuário",
    bullets: [
      "Chat genérico",
      "Sem filtros educacionais",
      "Sem conformidade LGPD",
      "Sem suporte brasileiro",
      "Sem módulos específicos"
    ],
    variant: "default"
  },
  {
    title: "Tutoria Particular",
    priceLabel: "R$ 3.000/mês",
    priceNote: "Por professor",
    bullets: [
      "Horário limitado",
      "Custo por pessoa",
      "Sem automação",
      "Sem integração",
      "Escalabilidade baixa"
    ],
    variant: "default"
  }
];
