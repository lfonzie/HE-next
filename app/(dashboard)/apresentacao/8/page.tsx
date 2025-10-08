'use client';

import { Star } from 'lucide-react';
import NavigationHeader from '../components/NavigationHeader';

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Professora de Biologia, Escola Nova Era', content: 'Incrível! Criei uma aula completa sobre fotossíntese em menos de 2 minutos. Os alunos aumentaram 40% no desempenho com os quizzes interativos e narração automática.', rating: 5 },
  { name: 'Carlos Mendes', role: 'Coordenador Pedagógico, Instituto Esperança', content: 'O simulador ENEM com 3000+ questões oficiais revolucionou nossa preparação. A explicação de erros por IA fez nossos alunos subirem 35 pontos na média geral.', rating: 5 },
  { name: 'Ana Silva', role: 'Diretora, Colégio Crescer', content: 'Economizamos 15 horas por semana com a correção automática de redações. Os 10 módulos de chat atendem toda nossa comunidade escolar com excelência.', rating: 5 },
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
          <SectionTitle subtitle="Resultados reais de escolas que já transformaram sua educação com HubEdu.ia">
            💬 <span className="text-yellow-400">Depoimentos</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-xl font-black mb-3">🌟 Resultados Comprovados</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { number: '40%', label: 'Aumento no Desempenho' },
                { number: '35', label: 'Pontos na Média ENEM' },
                { number: '15h', label: 'Economia Semanal' },
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
