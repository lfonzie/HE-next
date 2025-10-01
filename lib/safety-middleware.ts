// lib/safety-middleware.ts
// Middleware de segurança para detectar e bloquear conteúdo inadequado

import { detectInappropriateContent, createEducationalRefusalResponse, EDUCATIONAL_ALTERNATIVES } from './system-prompts/safety-guidelines';

export interface SafetyCheckResult {
  isInappropriate: boolean;
  inappropriateTopics: string[];
  suggestedResponse?: string;
  educationalAlternative?: string;
}

/**
 * Verifica se uma mensagem contém conteúdo inadequado
 */
export function checkMessageSafety(message: string): SafetyCheckResult {
  const inappropriateTopics: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Lista de tópicos inadequados
  const inappropriateKeywords = [
    'drogas', 'álcool', 'cigarros', 'tabaco', 'fumar', 'beber', 'substâncias ilegais',
    'violência', 'armas', 'suicídio', 'automutilação', 'hacking', 'pirataria',
    'fraudes', 'atividades ilegais', 'conteúdo sexual', 'pornografia',
    'jogos de azar', 'apostas', 'substâncias controladas', 'maconha', 'cocaína',
    'heroína', 'crack', 'lsd', 'ecstasy', 'metanfetamina', 'bebida alcoólica',
    'cerveja', 'vodka', 'whisky', 'cachaça', 'vinho', 'como fumar', 'como beber',
    'como usar drogas', 'como fazer drogas', 'como obter drogas',
    // Tópicos adicionais detectados nos logs
    'sexo', 'como fazer sexo', 'bomba', 'como fazer uma bomba', 'explosivos',
    'armas de fogo', 'violência doméstica', 'abuso', 'tortura', 'assassinato',
    'terrorismo', 'extremismo', 'nazismo', 'fascismo', 'racismo', 'xenofobia',
    'homofobia', 'transfobia', 'misoginia', 'pedofilia', 'incesto', 'zoofilia',
    'necrofilia', 'sadomasoquismo', 'bdsm', 'fetichismo', 'prostituição',
    'tráfico humano', 'escravidão', 'trabalho infantil', 'exploração sexual',
    'pornografia infantil', 'sexting', 'revenge porn', 'cyberbullying',
    'suicídio assistido', 'eutanásia', 'aborto', 'contracepção', 'esterilização',
    'clonagem humana', 'engenharia genética perigosa', 'armas biológicas',
    'armas químicas', 'armas nucleares', 'bombas caseiras', 'explosivos caseiros',
    'venenos', 'toxinas', 'substâncias tóxicas', 'drogas sintéticas',
    'designer drugs', 'smart drugs', 'drogas de festa', 'drogas recreativas',
    'overdose', 'dependência química', 'vício', 'abstinência', 'síndrome de abstinência',
    'desintoxicação', 'reabilitação', 'centro de reabilitação', 'clínica de reabilitação',
    'tratamento de dependência', 'terapia de grupo', 'terapia individual',
    'psicoterapia', 'psiquiatria', 'medicamentos psiquiátricos', 'antidepressivos',
    'ansiolíticos', 'sedativos', 'hipnóticos', 'estimulantes', 'anfetaminas',
    'metilfenidato', 'ritalina', 'concerta', 'adderall', 'vyvanse', 'modafinil',
    'benzodiazepínicos', 'diazepam', 'lorazepam', 'clonazepam', 'alprazolam',
    'opioides', 'morfina', 'codeína', 'fentanil', 'heroína', 'metadona',
    'buprenorfina', 'naloxona', 'naltrexona', 'suboxone', 'subutex',
    'canabinoides', 'thc', 'cbd', 'maconha', 'haxixe', 'óleo de haxixe',
    'cogumelos mágicos', 'psilocibina', 'lsd', 'dmt', 'ayahuasca', 'mescalina',
    'peyote', 'ibogaína', 'ketamina', 'ghb', 'rohypnol', 'flunitrazepam',
    'mdma', 'ecstasy', 'molly', 'cristal', 'ice', 'speed', 'cocaína',
    'crack', 'pó', 'merla', 'oxi', 'lança perfume', 'loló', 'cheirinho',
    'colírio', 'bala', 'doce', 'ácido', 'chá', 'erva', 'baseado', 'beck',
    'cigarro de maconha', 'vaporizador', 'bong', 'cachimbo', 'narguilé',
    'hookah', 'shisha', 'tabaco', 'cigarro', 'charuto', 'cachimbo de tabaco',
    'rapé', 'tabaco de mascar', 'snus', 'vape', 'cigarro eletrônico',
    'e-cigarette', 'vaping', 'juul', 'pods', 'líquido de vape', 'e-líquido',
    'nicotina', 'alcatrão', 'monóxido de carbono', 'fumaça', 'fumar passivo',
    'câncer de pulmão', 'doença pulmonar', 'enfisema', 'bronquite crônica',
    'dpoc', 'doença pulmonar obstrutiva crônica', 'asma', 'alergia',
    'reação alérgica', 'choque anafilático', 'edema', 'inflamação',
    'infecção', 'bactéria', 'vírus', 'fungo', 'parasita', 'protozoário',
    'helminto', 'verme', 'lombriga', 'solitária', 'tênia', 'esquistossomo',
    'malária', 'dengue', 'zika', 'chikungunya', 'febre amarela', 'covid-19',
    'sars-cov-2', 'coronavírus', 'gripe', 'influenza', 'h1n1', 'h3n2',
    'tuberculose', 'hanseníase', 'leishmaniose', 'doença de chagas',
    'toxoplasmose', 'giardíase', 'amebíase', 'shigelose', 'salmonelose',
    'colera', 'tétano', 'difteria', 'coqueluche', 'sarampo', 'rubéola',
    'caxumba', 'varicela', 'herpes', 'hpv', 'hiv', 'aids', 'sífilis',
    'gonorreia', 'clamídia', 'tricomoníase', 'candidíase', 'vaginose',
    'uretrite', 'cervicite', 'salpingite', 'endometrite', 'ooforite',
    'prostatite', 'epididimite', 'orquite', 'balanite', 'fimose',
    'parafimose', 'priapismo', 'ejaculação precoce', 'disfunção erétil',
    'impotência', 'infertilidade', 'esterilidade', 'menopausa', 'andropausa',
    'climatério', 'tpm', 'síndrome pré-menstrual', 'dismenorreia',
    'amenorreia', 'menorragia', 'metrorragia', 'polimenorreia', 'oligomenorreia',
    'anovulação', 'anovular', 'anovulatório', 'anovulatório', 'anovulatório',
    'anovulatório', 'anovulatório', 'anovulatório', 'anovulatório', 'anovulatório'
  ];
  
  // Detectar tópicos inadequados
  inappropriateKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      inappropriateTopics.push(keyword);
    }
  });
  
  const isInappropriate = inappropriateTopics.length > 0;
  
  if (isInappropriate) {
    // Encontrar alternativa educacional
    let educationalAlternative: string | undefined;
    for (const [inappropriate, alternative] of Object.entries(EDUCATIONAL_ALTERNATIVES)) {
      if (inappropriateTopics.some(topic => topic.includes(inappropriate))) {
        educationalAlternative = alternative;
        break;
      }
    }
    
    // Se não encontrar alternativa específica, usar genérica
    if (!educationalAlternative) {
      educationalAlternative = 'conteúdos educacionais apropriados e construtivos';
    }
    
    const suggestedResponse = createEducationalRefusalResponse(
      inappropriateTopics.join(', '),
      educationalAlternative
    );
    
    return {
      isInappropriate: true,
      inappropriateTopics,
      suggestedResponse,
      educationalAlternative
    };
  }
  
  return {
    isInappropriate: false,
    inappropriateTopics: []
  };
}

/**
 * Middleware para interceptar mensagens inadequadas antes de enviar para a IA
 */
export function createSafetyMiddleware() {
  return (req: any, res: any, next: any) => {
    if (req.body && req.body.message) {
      const safetyCheck = checkMessageSafety(req.body.message);
      
      if (safetyCheck.isInappropriate) {
        // Retornar resposta de segurança sem enviar para a IA
        return res.status(200).json({
          success: true,
          message: safetyCheck.suggestedResponse,
          safetyBlocked: true,
          inappropriateTopics: safetyCheck.inappropriateTopics,
          educationalAlternative: safetyCheck.educationalAlternative
        });
      }
    }
    
    next();
  };
}

/**
 * Função para log de tentativas de conteúdo inadequado
 */
export function logInappropriateContentAttempt(
  userId: string,
  message: string,
  inappropriateTopics: string[]
) {
  console.warn(`🚨 TENTATIVA DE CONTEÚDO INADEQUADO DETECTADA:
    Usuário: ${userId}
    Mensagem: ${message}
    Tópicos inadequados: ${inappropriateTopics.join(', ')}
    Timestamp: ${new Date().toISOString()}
  `);
  
  // Aqui você pode adicionar lógica para salvar no banco de dados
  // ou enviar alertas para administradores
}

/**
 * Função para verificar se um usuário está tentando contornar as proteções
 */
export function detectCircumventionAttempt(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Padrões comuns de tentativa de contornar filtros
  const circumventionPatterns = [
    'ignore previous instructions',
    'forget safety guidelines',
    'act as if you are not an ai',
    'pretend to be',
    'roleplay as',
    'you are now',
    'from now on',
    'disregard safety',
    'ignore safety',
    'forget about safety',
    'act without restrictions'
  ];
  
  return circumventionPatterns.some(pattern => lowerMessage.includes(pattern));
}

/**
 * Sistema de pontuação de risco para usuários
 */
export class SafetyScoreTracker {
  private userScores: Map<string, number> = new Map();
  
  incrementScore(userId: string, points: number = 1) {
    const currentScore = this.userScores.get(userId) || 0;
    this.userScores.set(userId, currentScore + points);
  }
  
  getScore(userId: string): number {
    return this.userScores.get(userId) || 0;
  }
  
  resetScore(userId: string) {
    this.userScores.delete(userId);
  }
  
  isHighRisk(userId: string): boolean {
    return this.getScore(userId) >= 5;
  }
  
  getAllScores(): Map<string, number> {
    return new Map(this.userScores);
  }
}

// Instância global do tracker de pontuação
export const safetyScoreTracker = new SafetyScoreTracker();
