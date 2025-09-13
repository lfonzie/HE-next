// Utility function to detect subject from user query
export async function detectSubject(query: string): Promise<string> {
  try {
    // Simple keyword-based subject detection
    const lowerQuery = query.toLowerCase();
    
    // Mathematics keywords
    if (lowerQuery.includes('matemática') || lowerQuery.includes('matematica') || 
        lowerQuery.includes('álgebra') || lowerQuery.includes('algebra') ||
        lowerQuery.includes('geometria') || lowerQuery.includes('cálculo') ||
        lowerQuery.includes('calculo') || lowerQuery.includes('trigonometria') ||
        lowerQuery.includes('estatística') || lowerQuery.includes('estatistica') ||
        lowerQuery.includes('equação') || lowerQuery.includes('equacao') ||
        lowerQuery.includes('função') || lowerQuery.includes('funcao')) {
      return 'Matemática';
    }
    
    // Physics keywords
    if (lowerQuery.includes('física') || lowerQuery.includes('fisica') ||
        lowerQuery.includes('mecânica') || lowerQuery.includes('mecanica') ||
        lowerQuery.includes('termodinâmica') || lowerQuery.includes('termodinamica') ||
        lowerQuery.includes('eletromagnetismo') || lowerQuery.includes('óptica') ||
        lowerQuery.includes('optica') || lowerQuery.includes('energia') ||
        lowerQuery.includes('força') || lowerQuery.includes('forca') ||
        lowerQuery.includes('velocidade') || lowerQuery.includes('aceleração')) {
      return 'Física';
    }
    
    // Chemistry keywords
    if (lowerQuery.includes('química') || lowerQuery.includes('quimica') ||
        lowerQuery.includes('elemento') || lowerQuery.includes('composto') ||
        lowerQuery.includes('reação') || lowerQuery.includes('reacao') ||
        lowerQuery.includes('molécula') || lowerQuery.includes('molecula') ||
        lowerQuery.includes('átomo') || lowerQuery.includes('atomo') ||
        lowerQuery.includes('tabela periódica') || lowerQuery.includes('tabela periodica') ||
        lowerQuery.includes('ácido') || lowerQuery.includes('acido') ||
        lowerQuery.includes('base') || lowerQuery.includes('sal')) {
      return 'Química';
    }
    
    // Biology keywords
    if (lowerQuery.includes('biologia') || lowerQuery.includes('célula') ||
        lowerQuery.includes('celula') || lowerQuery.includes('organismo') ||
        lowerQuery.includes('evolução') || lowerQuery.includes('evolucao') ||
        lowerQuery.includes('genética') || lowerQuery.includes('genetica') ||
        lowerQuery.includes('ecossistema') || lowerQuery.includes('ecosistema') ||
        lowerQuery.includes('fotossíntese') || lowerQuery.includes('fotossintese') ||
        lowerQuery.includes('respiração') || lowerQuery.includes('respiracao') ||
        lowerQuery.includes('dna') || lowerQuery.includes('rna') ||
        lowerQuery.includes('proteína') || lowerQuery.includes('proteina')) {
      return 'Biologia';
    }
    
    // History keywords
    if (lowerQuery.includes('história') || lowerQuery.includes('historia') ||
        lowerQuery.includes('guerra') || lowerQuery.includes('revolução') ||
        lowerQuery.includes('revolucao') || lowerQuery.includes('império') ||
        lowerQuery.includes('imperio') || lowerQuery.includes('civilização') ||
        lowerQuery.includes('civilizacao') || lowerQuery.includes('antigo') ||
        lowerQuery.includes('medieval') || lowerQuery.includes('moderno') ||
        lowerQuery.includes('contemporâneo') || lowerQuery.includes('contemporaneo')) {
      return 'História';
    }
    
    // Geography keywords
    if (lowerQuery.includes('geografia') || lowerQuery.includes('continente') ||
        lowerQuery.includes('país') || lowerQuery.includes('pais') ||
        lowerQuery.includes('capital') || lowerQuery.includes('clima') ||
        lowerQuery.includes('relevo') || lowerQuery.includes('vegetação') ||
        lowerQuery.includes('vegetacao') || lowerQuery.includes('hidrografia') ||
        lowerQuery.includes('demografia') || lowerQuery.includes('economia') ||
        lowerQuery.includes('população') || lowerQuery.includes('populacao')) {
      return 'Geografia';
    }
    
    // Portuguese/Literature keywords
    if (lowerQuery.includes('português') || lowerQuery.includes('portugues') ||
        lowerQuery.includes('literatura') || lowerQuery.includes('gramática') ||
        lowerQuery.includes('gramatica') || lowerQuery.includes('sintaxe') ||
        lowerQuery.includes('semântica') || lowerQuery.includes('semantica') ||
        lowerQuery.includes('figuras de linguagem') || lowerQuery.includes('poesia') ||
        lowerQuery.includes('prosa') || lowerQuery.includes('romance') ||
        lowerQuery.includes('conto') || lowerQuery.includes('crônica')) {
      return 'Português';
    }
    
    // English keywords
    if (lowerQuery.includes('inglês') || lowerQuery.includes('ingles') ||
        lowerQuery.includes('english') || lowerQuery.includes('verb') ||
        lowerQuery.includes('tense') || lowerQuery.includes('grammar') ||
        lowerQuery.includes('vocabulary') || lowerQuery.includes('pronunciation') ||
        lowerQuery.includes('conversation') || lowerQuery.includes('listening') ||
        lowerQuery.includes('reading') || lowerQuery.includes('writing')) {
      return 'Inglês';
    }
    
    // Philosophy keywords
    if (lowerQuery.includes('filosofia') || lowerQuery.includes('ética') ||
        lowerQuery.includes('etica') || lowerQuery.includes('moral') ||
        lowerQuery.includes('lógica') || lowerQuery.includes('logica') ||
        lowerQuery.includes('metafísica') || lowerQuery.includes('metafisica') ||
        lowerQuery.includes('epistemologia') || lowerQuery.includes('ontologia') ||
        lowerQuery.includes('existencialismo') || lowerQuery.includes('fenomenologia')) {
      return 'Filosofia';
    }
    
    // Sociology keywords
    if (lowerQuery.includes('sociologia') || lowerQuery.includes('sociedade') ||
        lowerQuery.includes('cultura') || lowerQuery.includes('grupo social') ||
        lowerQuery.includes('instituição') || lowerQuery.includes('instituicao') ||
        lowerQuery.includes('comportamento') || lowerQuery.includes('interação') ||
        lowerQuery.includes('interacao') || lowerQuery.includes('desigualdade') ||
        lowerQuery.includes('mobilidade social') || lowerQuery.includes('identidade')) {
      return 'Sociologia';
    }
    
    // Psychology keywords
    if (lowerQuery.includes('psicologia') || lowerQuery.includes('comportamento') ||
        lowerQuery.includes('mente') || lowerQuery.includes('consciência') ||
        lowerQuery.includes('consciencia') || lowerQuery.includes('personalidade') ||
        lowerQuery.includes('desenvolvimento') || lowerQuery.includes('aprendizagem') ||
        lowerQuery.includes('memória') || lowerQuery.includes('memoria') ||
        lowerQuery.includes('emoção') || lowerQuery.includes('emocao') ||
        lowerQuery.includes('cognição') || lowerQuery.includes('cognicao')) {
      return 'Psicologia';
    }
    
    // Default fallback
    return 'Geral';
    
  } catch (error) {
    console.error('Error in subject detection:', error);
    return 'Geral';
  }
}

