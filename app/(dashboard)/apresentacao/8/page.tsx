'use client';

import { Star } from 'lucide-react';
import NavigationHeader from '../components/NavigationHeader';

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Professora, Escola Nova Era', content: 'As aulas interativas são incríveis! Os alunos adoram os quizzes e rankings. A correção automática de redação economiza horas.', rating: 5 },
  { name: 'Carlos Mendes', role: 'Coordenador, Instituto Esperança', content: 'O simulador ENEM aumentou significativamente o desempenho dos alunos. O chat omni-channel é um diferencial para os pais.', rating: 5 },
  { name: 'Ana Silva', role: 'Diretora, Colégio Crescer', content: 'A gestão escolar ficou mais eficiente com as ferramentas de IA. O chat inteligente é revolucionário para a comunidade escolar.', rating: 5 },
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-yellow-400 transition-all duration-300">
    <div className="flex mb-3">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      ))}
    </div>
    <blockquote className="text-base mb-4 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</blockquote>
    <footer>
      <div className="font-bold text-sm">{testimonial.name}</div>
      <div className="text-gray-300 text-xs">{testimonial.role}</div>
    </footer>
  </div>
);

export default function Slide8() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="O que dizem sobre nossa plataforma">
            💬 <span className="text-yellow-400">Depoimentos</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-xl font-black mb-3">🌟 Mais de 500 escolas já confiam no HubEdu.ia</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { number: '500+', label: 'Escolas Atendidas' },
                { number: '50k+', label: 'Usuários Ativos' },
                { number: '98%', label: 'Satisfação' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-black text-yellow-800">{stat.number}</div>
                  <div className="text-xs font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
