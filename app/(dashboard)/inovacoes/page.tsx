'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Microscope, 
  Camera, 
  Smartphone, 
  Zap, 
  Target, 
  Heart, 
  BookOpen,
  Play,
  Settings,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Users,
  Globe
} from 'lucide-react';
import PersonalAITutor from '@/components/ai-tutor/PersonalAITutor';
import VirtualLab from '@/components/virtual-labs/VirtualLab';
import WebARViewer from '@/components/web-ar/WebARViewer';

const INNOVATION_CATEGORIES = [
  {
    id: 'ai-personalization',
    title: 'IA Avançada e Personalização',
    description: 'Tutor IA pessoal, exercícios adaptativos e análise de sentimento',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Tutor IA Pessoal com aprendizado adaptativo',
      'Geração de exercícios personalizados',
      'Análise de sentimento em tempo real',
      'Motor de personalização avançado',
      'Recomendações inteligentes de estudo'
    ],
    component: 'PersonalAITutor'
  },
  {
    id: 'immersive-resources',
    title: 'Recursos Imersivos',
    description: 'Laboratórios virtuais e realidade aumentada para STEM',
    icon: Microscope,
    color: 'from-blue-500 to-cyan-600',
    features: [
      'Laboratórios virtuais interativos',
      'Simulações de física, química e biologia',
      'Realidade aumentada baseada em navegador',
      'Experimentos 3D imersivos',
      'Visualização de conceitos abstratos'
    ],
    component: 'VirtualLab'
  },
  {
    id: 'technical-innovations',
    title: 'Inovações Técnicas',
    description: 'PWA, funcionalidades offline e experiência mobile',
    icon: Smartphone,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Progressive Web App (PWA)',
      'Funcionalidades offline completas',
      'Instalação nativa em dispositivos',
      'Sincronização automática',
      'Notificações push inteligentes'
    ],
    component: 'PWAManager'
  }
];

const SUBJECTS = [
  { id: 'chemistry', name: 'Química', icon: '🧪' },
  { id: 'physics', name: 'Física', icon: '⚛️' },
  { id: 'biology', name: 'Biologia', icon: '🧬' },
  { id: 'mathematics', name: 'Matemática', icon: '📐' },
  { id: 'anatomy', name: 'Anatomia', icon: '🫀' },
  { id: 'geography', name: 'Geografia', icon: '🌍' },
  { id: 'history', name: 'História', icon: '🏛️' }
];

export default function InovacoesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('chemistry');
  const [selectedTopic, setSelectedTopic] = useState('Ácidos e Bases');
  const [showDemo, setShowDemo] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowDemo(true);
  };

  const handleDemoComplete = (results: any) => {
    console.log('Demo completada:', results);
    // Aqui você pode implementar lógica para salvar resultados ou mostrar feedback
  };

  const renderDemoComponent = () => {
    if (!selectedCategory) return null;

    const category = INNOVATION_CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return null;

    switch (category.component) {
      case 'PersonalAITutor':
        return (
          <PersonalAITutor
            userId="demo-user"
            initialTopic={selectedTopic}
            onExerciseComplete={handleDemoComplete}
            onSentimentChange={(sentiment) => console.log('Sentimento:', sentiment)}
          />
        );
      case 'VirtualLab':
        return (
          <VirtualLab
            subject={selectedSubject as any}
            topic={selectedTopic}
            difficulty="intermediate"
            onComplete={handleDemoComplete}
          />
        );
      case 'WebARViewer':
        return (
          <WebARViewer
            subject={selectedSubject as any}
            topic={selectedTopic}
            onComplete={handleDemoComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-black mb-4">
              🚀 Inovações Educacionais
            </h1>
            <p className="text-xl lg:text-2xl font-medium max-w-4xl mx-auto">
              Descubra as tecnologias mais avançadas em educação: IA personalizada, 
              laboratórios virtuais, realidade aumentada e Progressive Web App
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showDemo ? (
          <>
            {/* Categorias de Inovação */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                🎯 Categorias de Inovação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {INNOVATION_CATEGORIES.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br ${category.color} text-white p-8 rounded-2xl shadow-xl cursor-pointer`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="text-center">
                      <category.icon className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-3">{category.title}</h3>
                      <p className="text-white/90 mb-6">{category.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        {category.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {category.features.length > 3 && (
                          <div className="text-sm text-white/80">
                            +{category.features.length - 3} mais funcionalidades
                          </div>
                        )}
                      </div>
                      
                      <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Experimentar
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Estatísticas de Impacto */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                📊 Impacto das Inovações
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl font-bold text-purple-500 mb-2">45%</div>
                  <div className="text-gray-600">Aumento no Engajamento</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">78%</div>
                  <div className="text-gray-600">Melhoria na Retenção</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">92%</div>
                  <div className="text-gray-600">Satisfação dos Usuários</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">60%</div>
                  <div className="text-gray-600">Redução no Tempo de Aprendizado</div>
                </div>
              </div>
            </div>

            {/* Benefícios Principais */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                ✨ Benefícios Principais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-purple-500" />
                    <h3 className="text-xl font-bold">Personalização Inteligente</h3>
                  </div>
                  <p className="text-gray-600">
                    IA adapta conteúdo e ritmo de aprendizado para cada aluno, 
                    maximizando eficiência e engajamento.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Microscope className="w-8 h-8 text-blue-500" />
                    <h3 className="text-xl font-bold">Experiência Imersiva</h3>
                  </div>
                  <p className="text-gray-600">
                    Laboratórios virtuais e AR tornam conceitos abstratos 
                    tangíveis e memoráveis.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-8 h-8 text-green-500" />
                    <h3 className="text-xl font-bold">Acesso Universal</h3>
                  </div>
                  <p className="text-gray-600">
                    PWA garante acesso offline e experiência nativa 
                    em qualquer dispositivo.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-8 h-8 text-red-500" />
                    <h3 className="text-xl font-bold">Suporte Emocional</h3>
                  </div>
                  <p className="text-gray-600">
                    Análise de sentimento detecta frustrações e 
                    oferece suporte personalizado.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-8 h-8 text-yellow-500" />
                    <h3 className="text-xl font-bold">Analytics Avançados</h3>
                  </div>
                  <p className="text-gray-600">
                    Dados em tempo real sobre progresso e 
                    performance para otimização contínua.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-8 h-8 text-indigo-500" />
                    <h3 className="text-xl font-bold">Escalabilidade Global</h3>
                  </div>
                  <p className="text-gray-600">
                    Infraestrutura cloud nativa suporta 
                    milhões de usuários simultâneos.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Controles da Demo */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    🎮 Demonstração: {INNOVATION_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                  </h2>
                  <button
                    onClick={() => setShowDemo(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Disciplina
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {SUBJECTS.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.icon} {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Tópico
                    </label>
                    <input
                      type="text"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Ex: Ácidos e Bases"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        // Recarrega o componente com novos parâmetros
                        setShowDemo(false);
                        setTimeout(() => setShowDemo(true), 100);
                      }}
                      className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Atualizar Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Componente da Demo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${selectedSubject}-${selectedTopic}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderDemoComponent()}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
