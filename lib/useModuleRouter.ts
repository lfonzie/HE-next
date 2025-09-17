import { useState, useCallback } from 'react';

interface RouterResponse {
  module_id: string;
  intent: string;
  entities: string[];
  confidence: number;
  rationale: string;
  trace_id: string;
}

export function useModuleRouter() {
  const [response, setResponse] = useState<RouterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifyMessage = useCallback(async (text: string, context?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/router/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context })
      });
      if (!res.ok) throw new Error('Failed to classify message');
      const data: RouterResponse = await res.json();
      setResponse(data);

      // Dispatch to module handler (example, replace with actual handlers)
      switch (data.module_id) {
        case 'enem':
          console.log(`Dispatching to ENEM handler: intent=${data.intent}, entities=${data.entities}`);
          // Example: await fetch('/api/enem', { method: 'POST', body: JSON.stringify({ intent: data.intent, entities: data.entities }) });
          break;
        case 'ti_suporte':
          console.log(`Dispatching to TI Suporte handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'resultados_bolsas':
          console.log(`Dispatching to Resultados Bolsas handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'secretaria':
          console.log(`Dispatching to Secretaria handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'financeiro':
          console.log(`Dispatching to Financeiro handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'professor_interativo':
          console.log(`Dispatching to Professor Interativo handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'aula_expandida':
          console.log(`Dispatching to Aula Expandida handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'juridico_contratos':
          console.log(`Dispatching to Jurídico e Contratos handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        case 'marketing_design':
          console.log(`Dispatching to Marketing e Design handler: intent=${data.intent}, entities=${data.entities}`);
          break;
        default:
          console.log(`Fallback to chat_geral: intent=${data.intent}`);
      }

      // Log user correction (example, replace with actual storage)
      if (data.confidence < 0.85) {
        console.log(`Low confidence (${data.confidence}), suggest modules: ENEM, Secretaria, TI`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle manual module change by user
  const handleModuleChange = useCallback((newModuleId: string) => {
    if (response) {
      console.log(`User corrected module to ${newModuleId}, original: ${response.module_id}, trace_id: ${response.trace_id}`);
      // Store correction for few-shot learning (replace with actual storage)
    }
  }, [response]);

  return { response, loading, error, classifyMessage, handleModuleChange };
}
