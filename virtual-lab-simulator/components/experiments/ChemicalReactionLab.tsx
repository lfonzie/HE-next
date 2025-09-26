import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type ReactionVisual = 'idle' | 'foaming' | 'smoking' | 'exploding' | 'color-change' | 'no reaction';

interface ReactionResult {
  visual: ReactionVisual;
  color: string;
  explanation: string;
}

export const ChemicalReactionLab: React.FC = () => {
  const [reagentA, setReagentA] = useState('Ácido Clorídrico');
  const [amountA, setAmountA] = useState(50);
  const [reagentB, setReagentB] = useState('Sódio');
  const [amountB, setAmountB] = useState(50);

  const [isLoading, setIsLoading] = useState(false);
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null);
  const [reactionKey, setReactionKey] = useState(0);

  const handleMix = async () => {
    if (!reagentA || !reagentB) return;

    setIsLoading(true);
    setReactionResult(null);
    setReactionKey(prev => prev + 1); // Trigger animation reset

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Você é um simulador de laboratório de química. Um estudante mistura ${amountA}ml de "${reagentA}" com ${amountB}ml de "${reagentB}".
        Analise a reação. Sua resposta DEVE ser um JSON.
        Descreva o resultado com uma explicação simples e educativa.
        O campo "visualEffect" deve ser uma das seguintes strings: "foaming", "smoking", "exploding", "color-change", ou "no reaction".
        O campo "resultingColor" deve ser um código de cor hexadecimal.
        O campo "explanation" deve ser uma explicação científica do que aconteceu.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visualEffect: { type: Type.STRING },
              resultingColor: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["visualEffect", "resultingColor", "explanation"]
          },
        },
      });

      let jsonString = response.text.trim();
      const jsonMatch = jsonString.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      const result = JSON.parse(jsonString);

      setReactionResult({
        visual: (result.visualEffect?.toLowerCase() || 'no reaction') as ReactionVisual,
        color: result.resultingColor || '#808080',
        explanation: result.explanation || 'Não foi possível determinar a reação.'
      });
    } catch (error) {
      console.error("Erro ao chamar a API do Gemini ou processar a resposta:", error);
      setReactionResult({
        visual: 'no reaction',
        color: '#808080',
        explanation: 'Ocorreu um erro ao processar a simulação. A IA pode não ter reconhecido os reagentes ou a resposta foi inválida. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setReactionResult(null);
    setReagentA('Ácido Clorídrico');
    setAmountA(50);
    setReagentB('Sódio');
    setAmountB(50);
    setReactionKey(0);
  };
  
  const totalAmount = amountA + amountB;
  const liquidHeight = Math.min(100, (totalAmount / 200) * 100);

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex flex-col md:flex-row gap-8 min-h-0">
        {/* Visualizer */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-hidden min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-lg">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-300">Analisando Reação...</p>
            </div>
          )}
          <div key={reactionKey} className="relative w-48 h-64">
             {/* Flask SVG */}
            <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full drop-shadow-lg">
              <defs>
                <clipPath id="liquidClip">
                  <path d="M20,130 L80,130 L95,40 Q100,30 90,25 L60,10 L60,0 L40,0 L40,10 L10,25 Q0,30 5,40 Z" />
                </clipPath>
              </defs>
              {/* Liquid */}
              <rect
                clipPath="url(#liquidClip)"
                x="0" y={130 - (130 * liquidHeight / 100)}
                width="100" height={130 * liquidHeight / 100}
                className="transition-all duration-500"
                fill={reactionResult?.color || 'rgba(107, 114, 128, 0.2)'}
              />
              {/* Glass */}
              <path 
                d="M20,130 L80,130 L95,40 Q100,30 90,25 L60,10 L60,0 L40,0 L40,10 L10,25 Q0,30 5,40 Z" 
                stroke="rgba(255, 255, 255, 0.3)" 
                strokeWidth="2" 
                fill="rgba(100, 150, 200, 0.1)"
              />
            </svg>
            
            <div className="absolute inset-0 pointer-events-none">
              {reactionResult?.visual === 'foaming' && (
                  <div className="absolute bottom-0 w-full" style={{height: `${liquidHeight}%`}}>
                      {[...Array(30)].map((_, i) => (
                          <div key={i} className="absolute bottom-0 rounded-full bg-white/80 animate-foam" style={{
                              width: `${Math.random() * 10 + 4}px`, height: `${Math.random() * 10 + 4}px`,
                              left: `${Math.random() * 80 + 10}%`,
                              animationDelay: `${Math.random() * 1.5}s`, animationDuration: `${Math.random() * 2 + 1.5}s`,
                          }}></div>
                      ))}
                  </div>
              )}
              {reactionResult?.visual === 'smoking' && (
                   <div className="absolute bottom-0 w-full" style={{height: `${liquidHeight}%`}}>
                      {[...Array(15)].map((_, i) => (
                           <div key={i} className="absolute bottom-0 text-slate-300/60 text-5xl animate-smoke filter blur-[2px]" style={{
                              left: `${Math.random() * 70 + 15}%`,
                              animationDelay: `${Math.random() * 2}s`, animationDuration: `${Math.random() * 4 + 3}s`,
                           }}>~</div>
                      ))}
                   </div>
              )}
              {reactionResult?.visual === 'exploding' && (
                  <div className="absolute inset-0 m-auto w-48 h-48 rounded-full animate-explosion" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,200,0.4) 40%, rgba(255,150,0,0) 70%)'}}></div>
              )}
            </div>
          </div>
          
          <style>{`
              @keyframes foam { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
              .animate-foam { animation: foam linear infinite; }
              @keyframes smoke { 0% { transform: translateY(0) scale(0.8) rotate(0deg); opacity: 0.6; } 100% { transform: translateY(-200px) scale(2.5) rotate(720deg); opacity: 0; } }
              .animate-smoke { animation: smoke linear infinite; }
              @keyframes explosion { 0% { opacity: 1; transform: scale(0); } 50% { opacity: 0.8; } 100% { opacity: 0; transform: scale(3.5); } }
              .animate-explosion { animation: explosion 0.4s ease-out forwards; }
          `}</style>
        </div>
        
        {/* Controls */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col justify-center space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Reagente A</label>
            <input type="text" value={reagentA} onChange={e => setReagentA(e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
          <Slider label="Quantidade A" min="1" max="100" value={amountA} onChange={(e) => setAmountA(parseInt(e.target.value, 10))} displayValue={`${amountA} ml`} />
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Reagente B</label>
            <input type="text" value={reagentB} onChange={e => setReagentB(e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
          <Slider label="Quantidade B" min="1" max="100" value={amountB} onChange={(e) => setAmountB(parseInt(e.target.value, 10))} displayValue={`${amountB} ml`} />
          
          <div className="flex space-x-2 pt-4">
              <Button onClick={handleMix} className="flex-1" disabled={isLoading}>Misturar</Button>
              <Button onClick={handleClear} className="flex-1 bg-red-600 !from-red-500 !to-rose-600 hover:!from-red-400 hover:!to-rose-500 focus:ring-red-500" disabled={isLoading}>Limpar</Button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {reactionResult && (
        <div className="mt-auto animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-2">Resultado da Reação</h3>
            <Card className="bg-black/30">
                <p className="text-slate-300 leading-relaxed">{reactionResult.explanation}</p>
            </Card>
        </div>
      )}
    </div>
  );
};
