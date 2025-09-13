import React from 'react';
import { Users, Clock, Star } from 'lucide-react';

interface NumerosProps {
  data: Array<{
    number: string;
    label: string;
  }>;
  className?: string;
}

const Numeros: React.FC<NumerosProps> = ({ data, className = "" }) => {
  const getIcon = (label: string) => {
    if (label.includes('Escola')) return Users;
    if (label.includes('Aluno')) return Users;
    if (label.includes('Satisfação')) return Star;
    if (label.includes('Suporte')) return Clock;
    return Users;
  };

  return (
    <section className={`py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            📊 <span className="text-yellow-400">Números</span> que Falam por Si
          </h2>
          <p className="text-xl text-gray-300">Resultados reais de escolas que já transformaram sua gestão</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.map((stat, index) => {
            const IconComponent = getIcon(stat.label);
            return (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 p-8 rounded-3xl border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105">
                  <IconComponent className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-lg text-gray-300">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Numeros;
