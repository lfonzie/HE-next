import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PlanosProps {
  data: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
  }>;
  className?: string;
}

const Planos: React.FC<PlanosProps> = ({ data, className = "" }) => {
  return (
    <section id="pricing" className={`py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Preços
          </h2>
          <p className="text-xl text-gray-300">Preço fixo, sem surpresas. Todos os recursos inclusos.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {data.map((plano, index) => (
            <div key={index} className="relative">
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm">
                    Recomendado
                  </span>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-3xl border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 h-full">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plano.name}</h3>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{plano.price}</div>
                  <p className="text-gray-300">{plano.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plano.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Link href="/register" className="group inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                    {plano.cta}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-6 py-3 rounded-full border border-yellow-400/30">
            <span className="text-yellow-400 font-semibold">💡 Escolas maiores têm desconto progressivo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Planos;
