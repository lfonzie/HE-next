// lib/ai/bncc-classifier.ts
// Sistema de classificação automática de competências BNCC

import { BNCC_COMPETENCIAS, BNCC_AREAS, BNCC_HABILIDADES_ESPECIFICAS, BNCCCompetencia, BNCCSkill } from '../system-prompts/bncc-config';

export interface BNCCClassificationResult {
  competencias: BNCCCompetencia[];
  habilidades: BNCCSkill[];
  area_conhecimento: string;
  disciplinas: string[];
  confidence: number;
  rationale: string;
}

export interface BNCCAnalysisRequest {
  content: string;
  subject?: string;
  level?: string;
  context?: string;
}

export class BNCCClassifier {
  private openai: any;

  constructor(openai: any) {
    this.openai = openai;
  }

  async classifyBNCCCompetencies(request: BNCCAnalysisRequest): Promise<BNCCClassificationResult> {
    try {
      const systemPrompt = this.buildBNCCClassificationPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseBNCCResponse(response, request);
    } catch (error) {
      console.error('Error classifying BNCC competencies:', error);
      return this.getFallbackClassification(request);
    }
  }

  private buildBNCCClassificationPrompt(): string {
    return `Você é um especialista em BNCC (Base Nacional Comum Curricular) brasileira. Sua missão é identificar as competências e habilidades BNCC mais relevantes para um conteúdo educacional.

COMPETÊNCIAS BNCC DISPONÍVEIS:
${Object.values(BNCC_COMPETENCIAS).map(comp => 
  `- ${comp.id}: ${comp.nome} - ${comp.descricao}`
).join('\n')}

ÁREAS DO CONHECIMENTO:
${Object.values(BNCC_AREAS).map(area => 
  `- ${area.id}: ${area.nome} - Disciplinas: ${area.disciplinas.join(', ')}`
).join('\n')}

INSTRUÇÕES:
1. Analise o conteúdo educacional fornecido
2. Identifique as competências BNCC mais relevantes
3. Identifique as habilidades específicas relacionadas
4. Determine a área de conhecimento principal
5. Retorne um JSON válido com a classificação

FORMATO DE RESPOSTA:
{
  "competencias": ["competencia1", "competencia2"],
  "habilidades": ["EF01LP01", "EF01MA01"],
  "area_conhecimento": "linguagens",
  "disciplinas": ["Português", "Matemática"],
  "confidence": 0.85,
  "rationale": "Explicação detalhada da classificação"
}`;
  }

  private buildUserPrompt(request: BNCCAnalysisRequest): string {
    let prompt = `Analise o seguinte conteúdo educacional e identifique as competências BNCC mais relevantes:\n\n`;
    prompt += `CONTEÚDO: ${request.content}\n`;
    
    if (request.subject) {
      prompt += `DISCIPLINA: ${request.subject}\n`;
    }
    
    if (request.level) {
      prompt += `NÍVEL: ${request.level}\n`;
    }
    
    if (request.context) {
      prompt += `CONTEXTO: ${request.context}\n`;
    }
    
    prompt += `\nIdentifique as competências BNCC mais relevantes e retorne o JSON conforme especificado.`;
    
    return prompt;
  }

  private parseBNCCResponse(response: string, request: BNCCAnalysisRequest): BNCCClassificationResult {
    try {
      const parsed = JSON.parse(response);
      
      const competencias = parsed.competencias?.map((id: string) => BNCC_COMPETENCIAS[id]).filter(Boolean) || [];
      const habilidades = parsed.habilidades?.map((id: string) => 
        Object.values(BNCC_HABILIDADES_ESPECIFICAS).flat().find(h => h.id === id)
      ).filter(Boolean) || [];
      
      return {
        competencias,
        habilidades,
        area_conhecimento: parsed.area_conhecimento || 'linguagens',
        disciplinas: parsed.disciplinas || [],
        confidence: parsed.confidence || 0.5,
        rationale: parsed.rationale || 'Classificação automática'
      };
    } catch (error) {
      console.error('Error parsing BNCC response:', error);
      return this.getFallbackClassification(request);
    }
  }

  private getFallbackClassification(request: BNCCAnalysisRequest): BNCCClassificationResult {
    // Classificação básica baseada na disciplina
    const subject = request.subject?.toLowerCase() || '';
    
    if (subject.includes('matemática') || subject.includes('matematica')) {
      return {
        competencias: [BNCC_COMPETENCIAS.competencia2, BNCC_COMPETENCIAS.competencia4],
        habilidades: [],
        area_conhecimento: 'matematica',
        disciplinas: ['Matemática'],
        confidence: 0.6,
        rationale: 'Classificação baseada na disciplina Matemática'
      };
    }
    
    if (subject.includes('português') || subject.includes('portugues') || subject.includes('literatura')) {
      return {
        competencias: [BNCC_COMPETENCIAS.competencia1, BNCC_COMPETENCIAS.competencia4],
        habilidades: [],
        area_conhecimento: 'linguagens',
        disciplinas: ['Português', 'Literatura'],
        confidence: 0.6,
        rationale: 'Classificação baseada na disciplina Português/Literatura'
      };
    }
    
    if (subject.includes('história') || subject.includes('historia') || subject.includes('geografia')) {
      return {
        competencias: [BNCC_COMPETENCIAS.competencia1, BNCC_COMPETENCIAS.competencia7],
        habilidades: [],
        area_conhecimento: 'ciencias_humanas',
        disciplinas: ['História', 'Geografia'],
        confidence: 0.6,
        rationale: 'Classificação baseada na disciplina História/Geografia'
      };
    }
    
    if (subject.includes('biologia') || subject.includes('física') || subject.includes('fisica') || subject.includes('química') || subject.includes('quimica')) {
      return {
        competencias: [BNCC_COMPETENCIAS.competencia2, BNCC_COMPETENCIAS.competencia7],
        habilidades: [],
        area_conhecimento: 'ciencias_natureza',
        disciplinas: ['Biologia', 'Física', 'Química'],
        confidence: 0.6,
        rationale: 'Classificação baseada na disciplina Ciências da Natureza'
      };
    }
    
    // Classificação padrão
    return {
      competencias: [BNCC_COMPETENCIAS.competencia1, BNCC_COMPETENCIAS.competencia4],
      habilidades: [],
      area_conhecimento: 'linguagens',
      disciplinas: [],
      confidence: 0.4,
      rationale: 'Classificação padrão - competências gerais'
    };
  }

  async generateBNCCAlignedContent(content: string, subject: string, level: string): Promise<string> {
    try {
      const classification = await this.classifyBNCCCompetencies({
        content,
        subject,
        level
      });

      const bnccPrompt = this.buildBNCCContentPrompt(classification);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: bnccPrompt },
          { role: "user", content: `Crie conteúdo educacional alinhado à BNCC para: ${content}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0]?.message?.content || content;
    } catch (error) {
      console.error('Error generating BNCC aligned content:', error);
      return content;
    }
  }

  private buildBNCCContentPrompt(classification: BNCCClassificationResult): string {
    let prompt = `Você é um especialista em educação brasileira e BNCC. Crie conteúdo educacional que desenvolva as seguintes competências BNCC:\n\n`;
    
    prompt += `COMPETÊNCIAS BNCC A DESENVOLVER:\n`;
    classification.competencias.forEach(comp => {
      prompt += `- ${comp.nome}: ${comp.descricao}\n`;
    });
    
    prompt += `\nHABILIDADES ESPECÍFICAS A EXERCITAR:\n`;
    classification.habilidades.forEach(habilidade => {
      prompt += `- ${habilidade.nome}: ${habilidade.descricao}\n`;
    });
    
    prompt += `\nÁREA DE CONHECIMENTO: ${classification.area_conhecimento}\n`;
    prompt += `DISCIPLINAS: ${classification.disciplinas.join(', ')}\n\n`;
    
    prompt += `INSTRUÇÕES:\n`;
    prompt += `- Crie conteúdo que desenvolva essas competências específicas\n`;
    prompt += `- Inclua atividades que exercitem essas habilidades\n`;
    prompt += `- Use linguagem clara e didática\n`;
    prompt += `- Adapte ao nível educacional apropriado\n`;
    prompt += `- Inclua exemplos práticos\n`;
    prompt += `- Sempre indique quais competências BNCC estão sendo desenvolvidas\n`;
    
    return prompt;
  }

  async validateBNCCAlignment(content: string, expectedCompetencies: string[]): Promise<boolean> {
    try {
      const classification = await this.classifyBNCCCompetencies({
        content
      });

      const foundCompetencies = classification.competencias.map(comp => comp.id);
      const alignmentScore = expectedCompetencies.filter(comp => 
        foundCompetencies.includes(comp)
      ).length / expectedCompetencies.length;

      return alignmentScore >= 0.7; // 70% de alinhamento mínimo
    } catch (error) {
      console.error('Error validating BNCC alignment:', error);
      return false;
    }
  }
}

export function createBNCCClassifier(openai: any): BNCCClassifier {
  return new BNCCClassifier(openai);
}
