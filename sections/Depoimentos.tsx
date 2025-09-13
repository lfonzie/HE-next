import React from 'react';
import { Star } from 'lucide-react';

interface DepoimentosProps {
  data: Array<{
    name: string;
    role: string;
    school: string;
    content: string;
    rating: number;
  }>;
  className?: string;
}

const Depoimentos: React.FC<DepoimentosProps> = ({ data, className = "" }) => {
  return (
    <section className={`py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            O que dizem nossos clientes
          </h2>
          <p className="text-xl text-gray-300">Casos reais de transformação educacional</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((depoimento, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-3xl border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 group-hover:scale-105 h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(depoimento.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{depoimento.content}"
                </p>
                
                <div className="border-t border-gray-700/50 pt-4">
                  <div className="font-bold text-white text-lg">{depoimento.name}</div>
                  <div className="text-yellow-400 font-semibold">{depoimento.role}</div>
                  <div className="text-gray-400 text-sm">{depoimento.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold transform hover:scale-105 transition-all duration-300 shadow-lg">
            Ver Todos os Cases de Sucesso
          </button>
        </div>
      </div>
    </section>
  );
};

export default Depoimentos;
