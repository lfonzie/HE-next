'use client';

import PasswordGuard from '../components/PasswordGuard';
import Image from 'next/image';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function InvestorMemorandum() {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  // Dados para gráficos
  const financialData = [
    { ano: '2025', receitaB2B: 0, receitaB2C: 0, receitaTotal: 0, lucro: -0.035, margem: 0 },
    { ano: '2026', receitaB2B: 0.504, receitaB2C: 0.215, receitaTotal: 0.719, lucro: 0.144, margem: 20.0 },
    { ano: '2027', receitaB2B: 1.260, receitaB2C: 0.718, receitaTotal: 1.978, lucro: 0.396, margem: 20.0 },
    { ano: '2028', receitaB2B: 2.808, receitaB2C: 1.794, receitaTotal: 4.602, lucro: 0.920, margem: 20.0 },
    { ano: '2029', receitaB2B: 5.616, receitaB2C: 3.588, receitaTotal: 9.204, lucro: 1.841, margem: 20.0 },
    { ano: '2030', receitaB2B: 10.800, receitaB2C: 6.458, receitaTotal: 17.258, lucro: 3.452, margem: 20.0 },
  ];

  const valuationData = [
    { cenario: 'Conservador', valor: 69.0, equity: 13.8, roi: 3.1 },
    { cenario: 'Base', valor: 103.5, equity: 20.7, roi: 4.6 },
    { cenario: 'Otimista', valor: 138.1, equity: 27.6, roi: 6.1 },
  ];


  const roiData = [
    { name: 'Conservador', value: 3.1, color: '#ef4444' },
    { name: 'Base', value: 4.6, color: '#3b82f6' },
    { name: 'Otimista', value: 6.1, color: '#10b981' },
  ];

  const content = (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/apresentacao')}
                className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold">HubEdu.ia</h1>
                <p className="text-sm text-gray-300">Investor Memorandum</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/Logo_HubEdu.ia.svg"
              alt="HubEdu.ia"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
              HubEdu.ia
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Investor Memorandum
          </h2>
          <p className="text-xl text-gray-600">
            Transformando a Educação Brasileira com Inteligência Artificial Avançada
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          {/* 1. Introdução */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-2">
              1. Introdução
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-l-4 border-yellow-500">
              <p className="text-lg leading-relaxed text-gray-800 mb-4">
                O HubEdu.ia continua a representar uma plataforma EdTech inovadora no Brasil, integrando a herança de 100 anos de experiência educacional familiar com tecnologias de inteligência artificial (IA) de última geração. Fundada por Luiz Felipe, integrante da quarta geração da família Fonseca, proprietária de instituições educacionais em Sorocaba, São Paulo, a plataforma aborda desafios reais identificados no dia a dia escolar, incluindo sobrecarga de professores, ineficiências administrativas e a necessidade de personalização no aprendizado.
              </p>
              <p className="text-lg leading-relaxed text-gray-800">
                Com foco inicial em três módulos principais — Professor IA, Simulador ENEM e Aulas Interativas —, o HubEdu.ia garante alinhamento total à Base Nacional Comum Curricular (BNCC) e conformidade rigorosa com a Lei Geral de Proteção de Dados (LGPD), posicionando-se como uma solução única no mercado brasileiro.
              </p>
            </div>
          </section>

          {/* 2. O Problema */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-red-500 pb-2">
              2. O Problema
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              O sistema educacional brasileiro enfrenta obstáculos críticos:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-800 mb-3">Sobrecarga Pedagógica</h3>
                <p className="text-gray-700">
                  Professores gastam tempo excessivo em dúvidas individuais, correções e planejamento, limitando inovações no ensino.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-800 mb-3">Gestão Ineficiente</h3>
                <p className="text-gray-700">
                  Secretarias e setores financeiros dependem de processos manuais, gerando retrabalho e custos elevados.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-800 mb-3">Tecnologia Inadequada</h3>
                <p className="text-gray-700">
                  Soluções globais são caras, desalinhadas à BNCC e não cumprem a LGPD, enquanto ferramentas locais carecem de IA avançada.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-800 mb-3">Comunicação Fragmentada</h3>
                <p className="text-gray-700">
                  Escolas enfrentam dificuldades para engajar pais e oferecer suporte socioemocional em tempo real.
                </p>
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 mt-6">
              <h3 className="font-bold text-red-800 mb-3">Preparação para o ENEM</h3>
              <p className="text-gray-700">
                Alunos têm acesso limitado a simulados personalizados e feedback imediato para o Exame Nacional do Ensino Médio.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-red-300 pb-2">
                👨‍🎓 Desafios dos Alunos
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-bold text-red-800 mb-3">Acesso Limitado ao Ensino</h4>
                  <p className="text-gray-700">
                    Muitos alunos não têm acesso a materiais didáticos de qualidade ou apoio educacional personalizado fora do horário escolar.
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-bold text-red-800 mb-3">Dificuldade de Aprendizagem</h4>
                  <p className="text-gray-700">
                    Estilos de aprendizagem diferentes não são acomodados, levando a dificuldades de compreensão e retenção de conteúdo.
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-bold text-red-800 mb-3">Falta de Feedback Imediato</h4>
                  <p className="text-gray-700">
                    Alunos esperam dias ou semanas para receber correção de atividades e entender seus erros, prejudicando o aprendizado contínuo.
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-bold text-red-800 mb-3">Desigualdade Educacional</h4>
                  <p className="text-gray-700">
                    Alunos de regiões remotas ou famílias de baixa renda têm acesso limitado a recursos educacionais avançados e professores qualificados.
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 mt-6">
                <h4 className="font-bold text-red-800 mb-3">Pressão Acadêmica Excessiva</h4>
                <p className="text-gray-700">
                  Sobrecarga de conteúdo e pressão para desempenho no ENEM geram ansiedade e burnout, afetando a saúde mental dos estudantes.
                </p>
              </div>
            </div>

            <p className="text-lg text-gray-700 mt-8">
              Com 48 mil escolas privadas (90% com &lt;500 alunos), esses desafios amplificam desigualdades, especialmente em regiões remotas.
            </p>
          </section>

          {/* 3. A Solução */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-green-500 pb-2">
              3. A Solução: HubEdu.ia
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              O HubEdu.ia é uma plataforma SaaS de IA conversacional e multimodal, construída com Next.js 15, React 18 e Tailwind CSS, integrando cinco provedores de IA (OpenAI, Google Gemini, Claude, Perplexity e Grok, priorizando Grok 4 Fast por custo e qualidade).
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">Módulos Principais:</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 mb-3">Aulas Interativas</h4>
                <p className="text-gray-700">
                  Slides assíncronos (30-40 minutos) BNCC-alinhados, com quizzes, gamificação e atividades colaborativas; adaptáveis a qualquer tema ou nível, com potencial internacional.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 mb-3">Simulador ENEM</h4>
                <p className="text-gray-700">
                  Mais de 3.000 questões oficiais (2009-2024) + geração infinita por IA; modos personalizados (rápido, por dificuldade, oficial com cronômetro); aumento inicial de 45% no desempenho em piloto.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 mb-3">Correção Automática de Redações</h4>
                <p className="text-gray-700">
                  Análise instantânea com critérios ENEM, suporte a envios via PDF ou câmera; temas e tendências para 2026.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 mb-3">Chat Inteligente</h4>
                <p className="text-gray-700">
                  10 módulos customizados (Professor IA, Suporte TI, Atendimento a Pais, Bem-estar Emocional, Social Media, Coordenação, Secretaria, RH, Financeiro, Gestão e Analytics); conversas efêmeras para privacidade.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">Diferenciais:</h3>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <ul className="space-y-3 text-gray-700">
                <li><strong>Eficiência Quantificável:</strong> Economia de até R$ 3.000/mês por aluno em aulas particulares; 40% mais produtividade para professores; 30% redução de custos administrativos; 80% menos chamados de TI.</li>
                <li><strong>Preço Competitivo:</strong> Até 83% mais acessível que soluções globais (ex.: US$ 30/usuário/mês).</li>
                <li><strong>LGPD-First:</strong> Chats temporários, criptografia de ponta a ponta e infraestrutura global em nuvem.</li>
                <li><strong>Inclusão e Escalabilidade:</strong> Design leve via navegador, acessível em dispositivos low-end; validação por cinco IAs e curadoria humana para consistência BNCC.</li>
                <li><strong>Modularidade:</strong> 14 módulos totais, com orquestração via Server-Sent Events, caching de 5 minutos e prompts dinâmicos para performance otimizada.</li>
              </ul>
            </div>
          </section>

          {/* Continue with other sections... */}
          {/* 4. Mercado */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-purple-500 pb-2">
              4. Mercado
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-purple-800 mb-4">Brasil</h3>
                <p className="text-gray-700 mb-4">
                  Avaliado em USD 5,41 bilhões em 2024 (~R$ 29,8 bilhões a R$ 5,50/USD), projetado para USD 14,64 bilhões até 2033 (CAGR 11,70%).
                </p>
                <p className="text-gray-700">
                  Mais de 1.000 EdTechs ativas, com São Paulo concentrando &gt;40%. Investimentos de US$ 475 milhões (2015-2024), focando plataformas de ensino (51% das captações).
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-800 mb-4">Global de IA em Educação</h3>
                <p className="text-gray-700 mb-4">
                  USD 6,90 bilhões em 2025, crescendo para USD 41,01 bilhões até 2030 (CAGR 42,83%).
                </p>
                <p className="text-gray-700">
                  O Brasil lidera a LATAM, com 68-70% das EdTechs regionais, apoiado por iniciativas como o InovaEDUCAÇÃO da CAPES.
                </p>
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500 mt-6">
              <p className="text-gray-700">
                Com 48 mil escolas privadas (70-90% com &lt;500 alunos), o TAM é estimado em R$ 500-600 milhões/ano para SaaS educacional.
              </p>
            </div>
          </section>

          {/* 5. Modelo de Negócios */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-indigo-500 pb-2">
              5. Modelo de Negócios
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Modelo híbrido SaaS (B2B + B2C):
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
                <h3 className="font-bold text-indigo-800 mb-3">Para Escolas</h3>
                <p className="text-gray-700">
                  Tiers mensais proporcionais ao número de alunos (R$ 2.000 para ≤150; escalando a R$ 8.000 para &gt;1.000), média R$ 5.100/escola.
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
                <h3 className="font-bold text-indigo-800 mb-3">Para Alunos Individuais</h3>
                <p className="text-gray-700">
                  R$ 29,90/mês ou R$ 299/ano, focado no simulador ENEM e aulas.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Comparativo de Custos (50 Alunos):</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Custo Mensal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Soluções Globais</td>
                    <td className="border border-gray-300 px-4 py-2">~R$ 9.000/mês (US$ 30/usuário)</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 px-4 py-2 font-bold">HubEdu.ia</td>
                    <td className="border border-gray-300 px-4 py-2 font-bold">R$ 2.000/mês</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </section>

          {/* Vantagens para Escolas (B2B) */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-blue-500 pb-2">
              Vantagens para Escolas (B2B)
            </h2>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                Solução Completa para Gestão Educacional
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                  <div className="text-3xl mb-3">⚡</div>
                  <h4 className="text-lg font-bold text-blue-800 mb-2">Eficiência Operacional</h4>
                  <p className="text-gray-700 text-sm">
                    Redução de até 80% no tempo gasto com chamados de TI e 30% nos custos administrativos.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                  <div className="text-3xl mb-3">📚</div>
                  <h4 className="text-lg font-bold text-blue-800 mb-2">Currículo BNCC-Alinhado</h4>
                  <p className="text-gray-700 text-sm">
                    Plataforma totalmente alinhada com a Base Nacional Comum Curricular e LGPD.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="text-lg font-bold text-blue-800 mb-2">Personalização do Ensino</h4>
                  <p className="text-gray-700 text-sm">
                    Aulas adaptáveis a qualquer tema ou nível, com IA multimodal para diferentes estilos de aprendizagem.
                  </p>
                </div>


                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                  <div className="text-3xl mb-3">💬</div>
                  <h4 className="text-lg font-bold text-blue-800 mb-2">Comunicação Integrada</h4>
                  <p className="text-gray-700 text-sm">
                    10 módulos de chat inteligente: professores IA, suporte TI, atendimento a pais, RH, financeiro, etc.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                  <div className="text-3xl mb-3">💰</div>
                  <h4 className="text-lg font-bold text-blue-800 mb-2">ROI Comprovado</h4>
                  <p className="text-gray-700 text-sm">
                    Economia de até R$ 3.000 por aluno em aulas particulares, com 40% mais produtividade docente e retenção de alunos.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-blue-100 p-6 rounded-lg border border-blue-300">
                <h4 className="text-lg font-bold text-blue-800 mb-3">🏫 Perfeito Para:</h4>
                <ul className="text-gray-700 space-y-2">
                  <li>• Escolas particulares de todos os portes (de 150 a 1.000+ alunos)</li>
                  <li>• Instituições que buscam modernização pedagógica</li>
                  <li>• Escolas com desafios de gestão administrativa</li>
                  <li>• Instituições focadas em resultados ENEM</li>
                  <li>• Escolas que querem se destacar no mercado educacional</li>
                </ul>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-lg border border-blue-300">
                  <h4 className="text-lg font-bold text-blue-800 mb-3">🎯 Benefícios Pedagógicos</h4>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Ensino personalizado por IA</li>
                    <li>• Gamificação e atividades interativas</li>
                    <li>• Avaliação contínua e feedback imediato</li>
                    <li>• Preparação diferenciada para ENEM</li>
                    <li>• Inclusão digital para todos os alunos</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-6 rounded-lg border border-cyan-300">
                  <h4 className="text-lg font-bold text-cyan-800 mb-3">⚙️ Benefícios Operacionais</h4>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Redução significativa de custos administrativos</li>
                    <li>• Automação de processos burocráticos</li>
                    <li>• Suporte técnico 24/7 via chat inteligente</li>
                    <li>• Relatórios automatizados de performance</li>
                    <li>• Integração com sistemas existentes</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Vantagens para Alunos (B2C) */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-indigo-500 pb-2">
              Vantagens para Alunos (B2C)
            </h2>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl border-l-4 border-indigo-500">
              <h3 className="text-2xl font-bold text-indigo-800 mb-6 text-center">
                Acesso Direto à Educação Premium
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
                  <div className="text-3xl mb-3">🎓</div>
                  <h4 className="text-lg font-bold text-indigo-800 mb-2">Conteúdo BNCC-Alinhado</h4>
                  <p className="text-gray-700 text-sm">
                    Aulas estruturadas conforme o currículo nacional, com garantia de qualidade educacional.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="text-lg font-bold text-indigo-800 mb-2">Simulador ENEM Completo</h4>
                  <p className="text-gray-700 text-sm">
                    Mais de 3.000 questões oficiais com feedback instantâneo e correção automática de redações.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
                  <div className="text-3xl mb-3">💰</div>
                  <h4 className="text-lg font-bold text-indigo-800 mb-2">Preço Acessível</h4>
                  <p className="text-gray-700 text-sm">
                    R$ 29,90/mês ou R$ 299/ano - muito mais econômico que aulas particulares tradicionais.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
                  <div className="text-3xl mb-3">🤖</div>
                  <h4 className="text-lg font-bold text-indigo-800 mb-2">IA Personalizada</h4>
                  <p className="text-gray-700 text-sm">
                    Chat inteligente com professores virtuais especializados em diferentes disciplinas.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
                  <div className="text-3xl mb-3">📱</div>
                  <h4 className="text-lg font-bold text-indigo-800 mb-2">Acesso Anywhere</h4>
                  <p className="text-gray-700 text-sm">
                    Estude de qualquer lugar, a qualquer hora, com dispositivos móveis ou desktop.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
                  <div className="text-3xl mb-3">📈</div>
                  <h4 className="text-lg font-bold text-indigo-800 mb-2">Resultados Comprovados</h4>
                  <p className="text-gray-700 text-sm">
                    Aumento médio de 45% no desempenho em simulados ENEM nos primeiros testes.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-indigo-100 p-6 rounded-lg border border-indigo-300">
                <h4 className="text-lg font-bold text-indigo-800 mb-3">💡 Para Quem é Indicado:</h4>
                <ul className="text-gray-700 space-y-2">
                  <li>• Alunos que precisam de reforço escolar adicional</li>
                  <li>• Preparação intensiva para o ENEM</li>
                  <li>• Estudantes em regiões com acesso limitado à educação de qualidade</li>
                  <li>• Quem busca flexibilidade de horário nos estudos</li>
                  <li>• Alunos que querem se destacar academicamente</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 8. Projeções Financeiras */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-teal-500 pb-2">
              8. Projeções Financeiras (2025–2030)
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Baseadas na validação inicial em 2025 (1 escola, 700 alunos, sem receita direta, focada em testes) e crescimento cauteloso a partir de 2026. Assumem conversão de 15% de pilots, retenção B2C de 70% e churn institucional &lt;15%.
            </p>

            {/* Tabela Financeira Detalhada */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-sm">Ano</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">Escolas B2B</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">Alunos B2C</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">ARR B2B</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">ARR B2C</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">Receita Total</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">Custos</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">EBITDA</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">2025</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$0</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$0</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$0</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$35,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">−R$35,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">2026</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">12</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">600</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$504,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$215,280</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$719,280</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$575,424</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$143,856</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">20.0%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">2027</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">30</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">2,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$1,260,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$717,600</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$1,977,600</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$1,582,080</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$395,520</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">20.0%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">2028</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">65</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">5,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$2,808,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$1,794,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$4,602,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$3,681,600</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$920,400</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">20.0%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">2029</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">130</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">10,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$5,616,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$3,588,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$9,204,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$7,363,200</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$1,840,800</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">20.0%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">2030</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">250</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">18,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$10,800,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$6,458,400</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$17,258,400</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$13,806,720</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">R$3,451,680</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">20.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detalhamento de Custos (2026) */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mb-8">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Detalhamento de Custos (2026)</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 px-4 py-2">Categoria</th>
                      <th className="border border-gray-300 px-4 py-2">Valor Anual</th>
                      <th className="border border-gray-300 px-4 py-2">% Receita</th>
                      <th className="border border-gray-300 px-4 py-2">Detalhamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">IA & Infraestrutura</td>
                      <td className="border border-gray-300 px-4 py-2">R$107,892</td>
                      <td className="border border-gray-300 px-4 py-2">15%</td>
                      <td className="border border-gray-300 px-4 py-2">APIs (R$80,000), Servers (R$27,892)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Vendas & Marketing</td>
                      <td className="border border-gray-300 px-4 py-2">R$215,784</td>
                      <td className="border border-gray-300 px-4 py-2">30%</td>
                      <td className="border border-gray-300 px-4 py-2">1 SDR (R$90,000), Ads (R$95,784), Events (R$30,000)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Desenvolvimento</td>
                      <td className="border border-gray-300 px-4 py-2">R$107,892</td>
                      <td className="border border-gray-300 px-4 py-2">15%</td>
                      <td className="border border-gray-300 px-4 py-2">1 Developer (R$70,000), Tools (R$37,892)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Operações & Suporte</td>
                      <td className="border border-gray-300 px-4 py-2">R$143,856</td>
                      <td className="border border-gray-300 px-4 py-2">20%</td>
                      <td className="border border-gray-300 px-4 py-2">1 CS (R$70,000), Overhead (R$73,856, adjusted for Sorocaba)</td>
                    </tr>
                    <tr className="bg-blue-200">
                      <td className="border border-gray-300 px-4 py-2 font-bold">TOTAL CUSTOS</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold">R$575,424</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold">80%</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold">-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-green-700">EBITDA</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-green-700">R$143,856</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-green-700">20.0%</td>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-green-700">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evolução do Time */}
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500 mb-8">
              <h4 className="text-xl font-bold text-purple-800 mb-4">Evolução do Time</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="border border-gray-300 px-4 py-2">Ano</th>
                      <th className="border border-gray-300 px-4 py-2">Founders</th>
                      <th className="border border-gray-300 px-4 py-2">Devs</th>
                      <th className="border border-gray-300 px-4 py-2">Vendas</th>
                      <th className="border border-gray-300 px-4 py-2">CS/Ops</th>
                      <th className="border border-gray-300 px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">2025</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">0</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">0</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">0</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">2026</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">4</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">2027</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">5</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">2028</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">3</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">7</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">2029</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">4</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">9</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">2030</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">5</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráfico de Projeções Financeiras */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Projeções Financeiras (2025-2030)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ano" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'receitaB2B' || name === 'receitaB2C' || name === 'receitaTotal' ? `R$ ${value}M` : name === 'lucro' ? `R$ ${value}M` : `${value}%`,
                    name === 'receitaB2B' ? 'Receita B2B' : name === 'receitaB2C' ? 'Receita B2C' : name === 'receitaTotal' ? 'Receita Total' : name === 'lucro' ? 'Lucro Líquido' : 'Margem'
                  ]} />
                  <Legend />
                  <Line type="monotone" dataKey="receitaB2B" stroke="#3b82f6" strokeWidth={3} name="receitaB2B" />
                  <Line type="monotone" dataKey="receitaB2C" stroke="#f59e0b" strokeWidth={3} name="receitaB2C" />
                  <Line type="monotone" dataKey="receitaTotal" stroke="#10b981" strokeWidth={4} strokeDasharray="5 5" name="receitaTotal" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg border-l-4 border-teal-500">
              <p className="text-gray-700">
                <strong>EBITDA Acumulado (2025–2030):</strong> R$ 6,75 milhões<br/>
                <strong>Margem EBITDA Média:</strong> 20%<br/>
                <strong>Receita B2C em 2030:</strong> 37,5% do total (R$ 6,46 milhões)<br/>
                <strong>Crescimento impulsionado por expansão B2B + B2C e eficiência operacional.</strong>
              </p>
            </div>
          </section>

          {/* 9. Valuation e Cenários */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-pink-500 pb-2">
              9. Valuation e Cenários
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Baseado em múltiplos de receita para 2030, ajustados para benchmarks SaaS/EdTech (5-8x em 2025, refletindo crescimento de IA).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2">Cenário</th>
                    <th className="border border-gray-300 px-4 py-2">Múltiplo</th>
                    <th className="border border-gray-300 px-4 py-2">Valuation (R$ milhões)</th>
                    <th className="border border-gray-300 px-4 py-2">Valor 20% Equity (R$ milhões)</th>
                    <th className="border border-gray-300 px-4 py-2">ROI Investidor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Conservador</td>
                    <td className="border border-gray-300 px-4 py-2">4x</td>
                    <td className="border border-gray-300 px-4 py-2">69,0</td>
                    <td className="border border-gray-300 px-4 py-2">13,8</td>
                    <td className="border border-gray-300 px-4 py-2">3,1x</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-4 py-2 font-bold">Base</td>
                    <td className="border border-gray-300 px-4 py-2 font-bold">6x</td>
                    <td className="border border-gray-300 px-4 py-2 font-bold">103,5</td>
                    <td className="border border-gray-300 px-4 py-2 font-bold">20,7</td>
                    <td className="border border-gray-300 px-4 py-2 font-bold">4,6x</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Otimista</td>
                    <td className="border border-gray-300 px-4 py-2">8x</td>
                    <td className="border border-gray-300 px-4 py-2">138,1</td>
                    <td className="border border-gray-300 px-4 py-2">27,6</td>
                    <td className="border border-gray-300 px-4 py-2">6,1x</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Gráfico de Valuation */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Cenários de Valuation (R$ milhões)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={valuationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cenario" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}M`, '']} />
                  <Legend />
                  <Bar dataKey="valor" fill="#8b5cf6" name="Valuation Total" />
                  <Bar dataKey="equity" fill="#f59e0b" name="Valor 20% Equity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 10. Estratégia de Captação */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-cyan-500 pb-2">
              10. Estratégia de Captação
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border-2 border-cyan-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-800">Seed (2026)</h3>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-900 mb-2">R$ 4,5 milhões</p>
                  <p className="text-cyan-700 mb-2">20% equity</p>
                  <p className="text-cyan-700 mb-4">pré-money R$ 18 milhões</p>
                  <p className="text-sm text-cyan-600 italic">para validação ampliada e marketing inicial</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">Série A (2027)</h3>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900 mb-2">R$ 10 milhões</p>
                  <p className="text-blue-700 mb-2">para 65 escolas</p>
                  <p className="text-blue-700 mb-4">pré-money R$ 50 milhões</p>
                  <p className="text-sm text-blue-600 italic">escala nacional</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-purple-800">Série B (2029)</h3>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-900 mb-2">R$ 25 milhões</p>
                  <p className="text-purple-700 mb-2">internacionalização</p>
                  <p className="text-purple-700 mb-4">pré-money R$ 125 milhões</p>
                  <p className="text-sm text-purple-600 italic">expansão global</p>
                </div>
              </div>
            </div>

          </section>

          {/* 11. Estratégia de Crescimento */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-4 border-emerald-500 pb-2">
              11. Estratégia de Crescimento
            </h2>

            {/* Timeline */}
            <div className="relative">
              {/* Linha vertical da timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-emerald-300"></div>

              <div className="space-y-8">
                {/* 2025 */}
                <div className="relative flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">2025</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-xl border-l-4 border-emerald-500 shadow-md flex-1">
                    <h3 className="text-xl font-bold text-emerald-800 mb-3">Validação Inicial</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Validação em 1 escola (700 alunos); foco em métricas de engajamento e eficiência; lançamento B2C.
                    </p>
                  </div>
                </div>

                {/* 2026 */}
                <div className="relative flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">2026</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-md flex-1">
                    <h3 className="text-xl font-bold text-blue-800 mb-3">Expansão Cautelosa</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Expansão cautelosa para 10 escolas; refinamento de módulos.
                    </p>
                  </div>
                </div>

                {/* 2027-28 */}
                <div className="relative flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">27-28</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500 shadow-md flex-1">
                    <h3 className="text-xl font-bold text-purple-800 mb-3">Escala Nacional</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Escala para 60 escolas; integração com sistemas acadêmicos nacionais.
                    </p>
                  </div>
                </div>

                {/* 2029-30 */}
                <div className="relative flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">29-30</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-500 shadow-md flex-1">
                    <h3 className="text-xl font-bold text-orange-800 mb-3">Liderança Global</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Liderança nacional (150 escolas); início de expansão LATAM com módulos de aulas e chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 12. Opções de Saída (Exit) */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-orange-500 pb-2">
              12. Opções de Saída (Exit)
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-800 mb-3">Aquisição Estratégica</h3>
                <p className="text-gray-700">
                  Grupos educacionais (Arco, Somos, Kroton).
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-800 mb-3">Big Tech</h3>
                <p className="text-gray-700">
                  Google, Microsoft, Amazon (interesse em IA educacional).
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-800 mb-3">IPO</h3>
                <p className="text-gray-700">
                  B3 ou bolsas LATAM.
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-800 mb-3">Private Equity</h3>
                <p className="text-gray-700">
                  Venda parcial com retenção de fundadores.
                </p>
              </div>
            </div>
          </section>

          {/* 13. Time */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-violet-500 pb-2">
              13. Time
            </h2>
            <div className="bg-violet-50 p-6 rounded-lg border-l-4 border-violet-500">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-violet-800 mb-3">Luiz Felipe (Founder & CEO)</h3>
                  <p className="text-gray-700">
                    Liderança em estratégia, produto e operações; experiência em escalar EdTechs.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-violet-800 mb-3">Estrutura Inicial (2025)</h3>
                  <p className="text-gray-700">
                    1 colaborador (founder); expansão para 10 em 2030, com foco em IA e pedagogia.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 14. Conclusão */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-2">
              14. Conclusão
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-lg border-l-4 border-yellow-500">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-yellow-800 mb-4">💎 Transformando a Educação com IA</h3>
                <p className="text-lg text-gray-800 leading-relaxed">
                  O HubEdu.ia está posicionado para liderar a transformação educacional no Brasil com IA multimodal, modularidade única e conformidade regulatória. Oferecemos uma solução completa que combina tecnologia de ponta com profundo entendimento do contexto educacional brasileiro.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">💰</div>
                    <h4 className="text-lg font-bold text-yellow-800">Retorno Atrativo</h4>
                  </div>
                  <p className="text-gray-700 text-center mb-3">ROI de 3,1x a 6,1x para investidores seed</p>
                  <div className="text-center">
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm mr-2">Conservador: 3,1x</span>
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">Base: 4,6x</span>
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Otimista: 6,1x</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">📈</div>
                    <h4 className="text-lg font-bold text-yellow-800">Escalabilidade Comprovada</h4>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 mb-1">De 1 para 250 escolas</p>
                    <p className="text-gray-700">em apenas 5 anos</p>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>📊 Receita projetada: R$ 17,3M (2030)</p>
                      <p>👨‍🎓 Alunos B2C: 18.000 (2030)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🌍</div>
                    <h4 className="text-lg font-bold text-yellow-800">Impacto Social</h4>
                  </div>
                  <p className="text-gray-700 text-center mb-3">Educação acessível e de qualidade para todos</p>
                  <div className="text-sm text-gray-600 text-center">
                    <p>✅ Alinhada à BNCC</p>
                    <p>🔒 LGPD-First</p>
                    <p>🎯 Inclusão digital</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🤖</div>
                    <h4 className="text-lg font-bold text-yellow-800">Tecnologia Inovadora</h4>
                  </div>
                  <p className="text-gray-700 text-center mb-3">IA multimodal e conversacional</p>
                  <div className="text-sm text-gray-600 text-center">
                    <p>🧠 5 provedores de IA</p>
                    <p>💬 14 módulos inteligentes</p>
                    <p>⚡ Performance otimizada</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎯</div>
                    <h4 className="text-lg font-bold text-yellow-800">Modelo Dual</h4>
                  </div>
                  <p className="text-gray-700 text-center mb-3">B2B + B2C para máxima resiliência</p>
                  <div className="text-sm text-gray-600 text-center">
                    <p>🏫 62,5% Receita B2B</p>
                    <p>👨‍🎓 37,5% Receita B2C</p>
                    <p>📊 Diversificação completa</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🇧🇷</div>
                    <h4 className="text-lg font-bold text-yellow-800">Foco Brasileiro</h4>
                  </div>
                  <p className="text-gray-700 text-center mb-3">Solução feita para o mercado nacional</p>
                  <div className="text-sm text-gray-600 text-center">
                    <p>💰 Custo competitivo</p>
                    <p>🎓 Contexto educacional</p>
                    <p>⚖️ Regulamentação local</p>
                  </div>
                </div>
              </div>

              {/* Cenários de ROI - Gráfico */}
              <div className="bg-white p-6 rounded-lg shadow-lg border border-yellow-200 mb-8">
                <h4 className="text-xl font-bold text-yellow-800 mb-4 text-center">Cenários de ROI Detalhados</h4>
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3,1x</span>
                    </div>
                    <h5 className="font-bold text-red-800">Conservador</h5>
                    <p className="text-sm text-gray-600">Valuation: R$ 69,0M</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">4,6x</span>
                    </div>
                    <h5 className="font-bold text-blue-800">Base</h5>
                    <p className="text-sm text-gray-600">Valuation: R$ 103,5M</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">6,1x</span>
                    </div>
                    <h5 className="font-bold text-green-800">Otimista</h5>
                    <p className="text-sm text-gray-600">Valuation: R$ 138,1M</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roiData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}x`}
                    >
                      {roiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}x`, 'ROI']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p className="mb-2">© 2025 HubEdu.ia — Privacidade | Termos | LGPD</p>
          <p className="text-sm">Investor Memorandum - Confidencial</p>
        </div>
      </div>
    </div>
  );

  // Password protection - using a strong password
  return (
    <PasswordGuard password="hubedu2025investor" title="Memorandum de Investimento - HubEdu.ia">
      {content}
    </PasswordGuard>
  );
}
