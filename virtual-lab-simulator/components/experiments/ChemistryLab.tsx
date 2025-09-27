import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SimulationCanvas } from './SimulationCanvas';
import { QuizCard, QuestaoFormativa } from './QuizCard';

// This is the extensive system prompt you provided for the Chemistry Lab.
const SYSTEM_PROMPT = `# SISTEMA DE LABORATÓRIO VIRTUAL DE QUÍMICA - VERSÃO APRIMORADA

## IDENTIDADE E PROPÓSITO

Você é o **Motor Inteligente de Laboratório Virtual de Química**, um sistema especializado em:

1. **Simulações químicas educacionais** com rigor científico
2. **Geração de animações sincronizadas** para visualização 3D
3. **Avaliação formativa adaptativa** baseada no nível do estudante
4. **Protocolos de segurança** integrados e obrigatórios
5. **Respostas estruturadas em JSON** para integração front-end

### OBJETIVOS PEDAGÓGICOS
- Proporcionar experiências imersivas e seguras de química experimental
- Desenvolver compreensão conceitual através de visualização dinâmica
- Promover aprendizagem ativa com feedback imediato
- Garantir conformidade com padrões de segurança laboratorial
- **Idioma obrigatório**: Português do Brasil (pt-BR)
## Formato de Resposta (JSON Obrigatório)
Retorne **sempre** um objeto JSON com a estrutura da VERSÃO 2.0, sem texto ou comentários fora do JSON.
`;

interface Timeline {
  duracao_total_segundos: number;
}

// TypeScript type definitions based on your provided V2.0 schema
interface VirtualLabResponseV2 {
  meta: {
    seguranca: {
      epis_obrigatorios: string[];
      pictogramas_ghs: string[];
      frases_h: string[];
    };
  };
  analise_quimica: {
    equacoes_balanceadas: {
      equacao: string;
      tipo_reacao: string[];
    }[];
    propriedades_previstas: {
      ph_inicial?: number;
      ph_final?: number;
    };
    estequiometria_detalhada: {
      reagente_limitante?: {
        substancia: string;
      };
      produtos_teoricos?: {
        substancia: string;
        quantidade_teorica: string;
      }[];
    };
  };
  simulacao_eventos: {
    eventos_cronologicos: {
      tempo_inicio: number;
      efeitos_visuais: {
        tipo_efeito: string;
        cor_hex?: string;
        duracao_segundos?: number;
        intensidade_normalizada?: number;
        granulometria?: 'muito_fino' | 'fino' | 'medio' | 'grosso';
      }[];
    }[];
    timeline_completa: Timeline;
  };
  avaliacao_educacional: {
    questoes_formativas: QuestaoFormativa[];
  };
  sistema_mensagens: {
    resumo_pedagogico: string;
    bloqueios_aplicados?: {
      motivo: string;
    }[];
  };
}


export const ChemistryLab: React.FC = () => {
  const [reagents, setReagents] = useState('HCl 0.1M 25mL, NaOH 0.1M, fenolftaleína');
  const [simulationData, setSimulationData] = useState<VirtualLabResponseV2 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setError(null);
    setSimulationData(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const userPrompt = `nivel: "Ensino Médio", modo: "guiado", objetivo_didatico: "Demonstrar uma reação de neutralização ácido-base com indicador de pH.", reagentes_usuario: ["${reagents}"], tempo_total_segundos: 10`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      const data = JSON.parse(text) as VirtualLabResponseV2;
      
      if (data.sistema_mensagens?.bloqueios_aplicados && data.sistema_mensagens.bloqueios_aplicados.length > 0) {
        setError(`Simulation denied: ${data.sistema_mensagens.bloqueios_aplicados[0].motivo}`);
      } else {
        setSimulationData(data);
      }

    } catch (e) {
      console.error(e);
      setError('Failed to run simulation. The AI model may have returned an invalid response or the reaction is too complex. Please try again with different reagents.');
    } finally {
      setIsLoading(false);
    }
  };

  const chemProps = simulationData?.analise_quimica;
  const hasReactionType = chemProps?.equacoes_balanceadas?.[0]?.tipo_reacao && chemProps.equacoes_balanceadas[0].tipo_reacao.length > 0;
  const hasPh = chemProps?.propriedades_previstas?.ph_inicial !== undefined && chemProps.propriedades_previstas?.ph_final !== undefined;
  const hasLimitingReagent = !!chemProps?.estequiometria_detalhada?.reagente_limitante?.substancia;
  const hasYield = chemProps?.estequiometria_detalhada?.produtos_teoricos && chemProps.estequiometria_detalhada.produtos_teoricos.length > 0;
  const hasAnyChemProps = hasReactionType || hasPh || hasLimitingReagent || hasYield;

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-2">
      <Card>
        <div className="flex flex-col gap-4">
          <label htmlFor="reagents-input" className="font-semibold text-slate-300">Enter Reagents</label>
          <textarea
            id="reagents-input"
            value={reagents}
            onChange={(e) => setReagents(e.target.value)}
            className="w-full p-2 rounded-md bg-slate-700/50 border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="e.g., AgNO3(aq), NaCl(aq)"
            rows={3}
          />
          <Button onClick={handleRunSimulation} disabled={isLoading}>
            {isLoading ? 'Simulating...' : 'Run Simulation'}
          </Button>
        </div>
      </Card>

      {error && <Card><p className="text-red-400">{error}</p></Card>}

      {simulationData && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <SimulationCanvas
            key={Date.now()}
            events={simulationData.simulacao_eventos.eventos_cronologicos}
            timeline={simulationData.simulacao_eventos.timeline_completa}
          />
          
          {hasAnyChemProps && (
            <Card>
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Chemical Properties</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                  {hasReactionType && (
                      <li>
                          <strong>Reaction Type:</strong> {chemProps.equacoes_balanceadas[0].tipo_reacao.join(', ')}
                      </li>
                  )}
                  {hasPh && (
                      <li>
                          <strong>pH:</strong> {chemProps.propriedades_previstas.ph_inicial.toFixed(1)} → {chemProps.propriedades_previstas.ph_final.toFixed(1)}
                      </li>
                  )}
                  {hasLimitingReagent && (
                      <li>
                          <strong>Limiting Reagent:</strong> {chemProps.estequiometria_detalhada.reagente_limitante.substancia}
                      </li>
                  )}
                  {hasYield && chemProps.estequiometria_detalhada.produtos_teoricos.map((product, index) => (
                      <li key={index}>
                          <strong>Theoretical Yield ({product.substancia}):</strong> {product.quantidade_teorica}
                      </li>
                  ))}
              </ul>
            </Card>
          )}
          
          <Card>
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Safety Information</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
              <li><strong>Required PPE:</strong> {simulationData.meta.seguranca.epis_obrigatorios.join(', ')}</li>
              <li><strong>Hazard Statements (H):</strong> {simulationData.meta.seguranca.frases_h.join(', ')}</li>
              <li><strong>GHS Pictograms:</strong> {simulationData.meta.seguranca.pictogramas_ghs.join(', ')}</li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Balanced Equation</h3>
            <div className="space-y-2">
              {simulationData.analise_quimica.equacoes_balanceadas.map((eq, i) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-md">
                  <p className="font-mono text-center text-cyan-300 whitespace-pre-wrap">
                    {eq.equacao}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Explanation</h3>
            <p className="text-slate-300">{simulationData.sistema_mensagens.resumo_pedagogico}</p>

          </Card>

          {simulationData.avaliacao_educacional.questoes_formativas?.length > 0 && (
            <QuizCard questions={simulationData.avaliacao_educacional.questoes_formativas} />
          )}

        </div>
      )}
    </div>
  );
};