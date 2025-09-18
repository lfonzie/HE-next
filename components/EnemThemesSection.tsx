'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Sparkles, Calendar, TrendingUp, Users, Globe, Heart, Shield, Lightbulb } from 'lucide-react';

// Temas históricos do ENEM (1998-2024)
const historicalThemes = [
  { year: 1998, theme: "O que é, o que é?" },
  { year: 1999, theme: "Cidadania e participação social" },
  { year: 2000, theme: "A participação da juventude na construção de um mundo melhor" },
  { year: 2001, theme: "Como preservar a diversidade na sociedade brasileira" },
  { year: 2002, theme: "O direito de votar tem algum valor?" },
  { year: 2003, theme: "A influência da televisão na formação da opinião dos brasileiros" },
  { year: 2004, theme: "A reforma agrária no Brasil contemporâneo" },
  { year: 2005, theme: "A ética no jornalismo" },
  { year: 2006, theme: "O poder de transformação da leitura" },
  { year: 2007, theme: "O desafio de se conviver com a diferença" },
  { year: 2008, theme: "O respeito à diversidade religiosa no Brasil" },
  { year: 2009, theme: "Como preservar a memória da escravidão no Brasil" },
  { year: 2010, theme: "O trabalho na construção da dignidade humana" },
  { year: 2011, theme: "Viver em rede no século XXI: os caminhos da convivência" },
  { year: 2012, theme: "O movimento imigratório para o Brasil no século XXI" },
  { year: 2013, theme: "Efeitos da implantação da Lei Maria da Penha nas vítimas de violência doméstica" },
  { year: 2014, theme: "Publicidade infantil em questão" },
  { year: 2015, theme: "A persistência da violência contra a mulher na sociedade brasileira" },
  { year: 2016, theme: "Caminhos para combater a intolerância religiosa no Brasil" },
  { year: 2017, theme: "Desafios para a formação educacional de surdos no Brasil" },
  { year: 2018, theme: "Manipulação do comportamento do usuário pelo controle de dados na internet" },
  { year: 2019, theme: "Democratização do acesso ao cinema no Brasil" },
  { year: 2020, theme: "O estigma associado às doenças mentais na sociedade brasileira" },
  { year: 2021, theme: "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil" },
  { year: 2022, theme: "Desafios para a valorização de comunidades e povos tradicionais no Brasil" },
  { year: 2023, theme: "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil" },
  { year: 2024, theme: "Desafios para a valorização da herança africana no Brasil" }
];

// Categorias de temas para IA gerar novos temas
const themeCategories = [
  {
    name: "Tecnologia e Sociedade",
    icon: Brain,
    keywords: ["inteligência artificial", "redes sociais", "digitalização", "privacidade", "algoritmos"]
  },
  {
    name: "Meio Ambiente",
    icon: Globe,
    keywords: ["sustentabilidade", "mudanças climáticas", "preservação", "energia renovável", "biodiversidade"]
  },
  {
    name: "Direitos Humanos",
    icon: Heart,
    keywords: ["igualdade", "diversidade", "inclusão", "acessibilidade", "justiça social"]
  },
  {
    name: "Educação",
    icon: Users,
    keywords: ["ensino", "aprendizado", "tecnologia educacional", "formação", "conhecimento"]
  },
  {
    name: "Saúde",
    icon: Shield,
    keywords: ["saúde mental", "bem-estar", "prevenção", "acesso", "qualidade de vida"]
  },
  {
    name: "Inovação",
    icon: Lightbulb,
    keywords: ["criatividade", "empreendedorismo", "inovação", "futuro", "transformação"]
  }
];

// Função para gerar temas usando IA (simulada)
const generateAIThemes = (category: string, count: number = 5): string[] => {
  const baseThemes = {
    "Tecnologia e Sociedade": [
      "Desafios da inteligência artificial na educação brasileira",
      "A influência dos algoritmos na formação de opinião dos jovens",
      "Privacidade digital e proteção de dados pessoais no Brasil",
      "Democratização do acesso à tecnologia nas escolas públicas",
      "O impacto das redes sociais na saúde mental dos adolescentes"
    ],
    "Meio Ambiente": [
      "Desafios para a transição energética sustentável no Brasil",
      "A importância da preservação da Amazônia para o futuro do planeta",
      "Caminhos para combater o desperdício de alimentos no Brasil",
      "O papel da juventude na luta contra as mudanças climáticas",
      "Sustentabilidade urbana: desafios das grandes metrópoles brasileiras"
    ],
    "Direitos Humanos": [
      "Desafios para garantir a igualdade de gênero no mercado de trabalho brasileiro",
      "A importância da representatividade LGBTQIA+ na sociedade brasileira",
      "Caminhos para combater o racismo estrutural no Brasil",
      "Desafios para a inclusão de pessoas com deficiência na educação",
      "O direito à moradia digna como garantia constitucional"
    ],
    "Educação": [
      "Desafios da educação híbrida no Brasil pós-pandemia",
      "A importância da educação financeira nas escolas brasileiras",
      "Caminhos para valorizar a profissão docente no Brasil",
      "Desafios para combater a evasão escolar no ensino médio",
      "A educação como ferramenta de transformação social"
    ],
    "Saúde": [
      "Desafios para democratizar o acesso à saúde mental no Brasil",
      "A importância da prevenção na saúde pública brasileira",
      "Caminhos para combater a obesidade infantil no Brasil",
      "Desafios para garantir o SUS universal e gratuito",
      "A saúde mental dos profissionais da educação"
    ],
    "Inovação": [
      "Desafios para fomentar o empreendedorismo jovem no Brasil",
      "A importância da inovação tecnológica para o desenvolvimento nacional",
      "Caminhos para democratizar o acesso à ciência e tecnologia",
      "Desafios para formar profissionais para o futuro do trabalho",
      "A criatividade como ferramenta de transformação social"
    ]
  };

  return baseThemes[category as keyof typeof baseThemes]?.slice(0, count) || [];
};

const EnemThemesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tecnologia e Sociedade");
  const [generatedThemes, setGeneratedThemes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistorical, setShowHistorical] = useState(true);

  const handleGenerateThemes = useCallback(async () => {
    setIsGenerating(true);
    
    // Simular delay da IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const themes = generateAIThemes(selectedCategory, 5);
    setGeneratedThemes(themes);
    setIsGenerating(false);
  }, [selectedCategory]);

  const toggleHistorical = useCallback(() => {
    setShowHistorical(prev => !prev);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              📝 <span className="text-blue-600">Temas de Redação ENEM</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore os temas históricos do ENEM e gere novos temas possíveis usando inteligência artificial
            </p>
          </motion.div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={toggleHistorical}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                showHistorical 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Temas Históricos
            </button>
            <button
              onClick={() => setShowHistorical(false)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                !showHistorical 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Brain className="w-5 h-5 inline mr-2" />
              Gerar Novos Temas
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showHistorical ? (
            <motion.div
              key="historical"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              {/* Temas Históricos */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <FileText className="w-8 h-8" />
                    Temas Históricos do ENEM (1998-2024)
                  </h3>
                  <p className="text-blue-100 mt-2">
                    Todos os temas de redação que já apareceram no Exame Nacional do Ensino Médio
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {historicalThemes.map((item, index) => (
                      <motion.div
                        key={item.year}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300"
                      >
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm min-w-[60px] text-center">
                          {item.year}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{item.theme}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="generator"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {/* Gerador de Temas */}
              <div className="space-y-8">
                {/* Seleção de Categoria */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    <Brain className="w-8 h-8 inline mr-3 text-purple-600" />
                    Escolha uma Categoria
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themeCategories.map((category, index) => (
                      <motion.button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          selectedCategory === category.name
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <category.icon className={`w-8 h-8 mb-3 ${
                          selectedCategory === category.name ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                        <h4 className={`font-bold mb-2 ${
                          selectedCategory === category.name ? 'text-purple-800' : 'text-gray-800'
                        }`}>
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {category.keywords.slice(0, 3).join(', ')}...
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Botão de Geração */}
                <div className="text-center">
                  <motion.button
                    onClick={handleGenerateThemes}
                    disabled={isGenerating}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto ${
                      isGenerating
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:shadow-xl'
                    }`}
                    whileHover={!isGenerating ? { scale: 1.05 } : {}}
                    whileTap={!isGenerating ? { scale: 0.95 } : {}}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                        Gerando temas...
                      </>
                    ) : (
                      <>
                        <Brain className="w-6 h-6" />
                        Gerar Temas com IA
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Temas Gerados */}
                {generatedThemes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Sparkles className="w-8 h-8" />
                        Temas Gerados por IA
                      </h3>
                      <p className="text-purple-100 mt-2">
                        Possíveis temas para redação ENEM na categoria: {selectedCategory}
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {generatedThemes.map((theme, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300"
                          >
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-lg font-bold text-sm min-w-[30px] text-center">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium">{theme}</p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EnemThemesSection;
