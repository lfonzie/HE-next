# Correções para Problemas no Simulador ENEM-V2

## Problemas Identificados

### 1. **Problema no Formulário Customizado (EnemCustomizer.tsx)**

**Problema**: A validação do formulário é insuficiente e pode causar comportamentos inesperados.

**Localização**: `components/enem/EnemCustomizer.tsx` linha 104-120

**Problemas específicos**:
- Validação apenas verifica se `selectedAreas.length === 0`
- Não valida se `numQuestions` está dentro dos limites
- Não valida se `difficultyDistribution` soma corretamente
- Não valida se `timeLimit` é um valor válido
- Usa `alert()` em vez de toast para feedback

### 2. **Problema na Função calculateScore (EnemSimulatorV2.tsx)**

**Problema**: A função pode falhar em condições específicas não testadas.

**Localização**: `components/enem/EnemSimulatorV2.tsx` linha 262-311

**Problemas específicos**:
- Não valida se `responses` está vazio antes de enviar
- Não valida se `items` está vazio
- Não trata casos onde `sessionId` é inválido
- Logs excessivos podem causar problemas de performance

### 3. **Problema na API /api/enem/scores**

**Problema**: A API não valida adequadamente os dados de entrada.

**Localização**: `app/api/enem/scores/route.ts` linha 3-92

**Problemas específicos**:
- Não valida estrutura dos `responses`
- Não valida estrutura dos `items`
- Não valida se `config` está presente
- Tratamento de erro genérico demais

### 4. **Problema na Criação de Sessão**

**Problema**: A API de criação de sessão pode falhar em condições específicas.

**Localização**: `app/api/enem/sessions/route.ts` linha 10-99

**Problemas específicos**:
- Validação insuficiente dos parâmetros
- Não trata casos onde `EnemExamGenerator` falha
- Fallback para local storage pode não funcionar corretamente

## Soluções Propostas

### 1. **Melhorar Validação do Formulário Customizado**

```typescript
const handleStartExam = () => {
  // Validações mais robustas
  if (selectedAreas.length === 0) {
    toast({
      title: "Erro",
      description: "Selecione pelo menos uma área",
      variant: "destructive"
    });
    return;
  }

  if (numQuestions < 5 || numQuestions > 180) {
    toast({
      title: "Erro", 
      description: "Número de questões deve estar entre 5 e 180",
      variant: "destructive"
    });
    return;
  }

  const totalDifficulty = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
  if (totalDifficulty !== numQuestions) {
    toast({
      title: "Erro",
      description: "A distribuição de dificuldade deve somar o número total de questões",
      variant: "destructive"
    });
    return;
  }

  if (timeLimit && (timeLimit < 15 || timeLimit > 300)) {
    toast({
      title: "Erro",
      description: "Tempo limite deve estar entre 15 e 300 minutos",
      variant: "destructive"
    });
    return;
  }

  const config: CustomExamConfig = {
    mode: 'CUSTOM',
    areas: selectedAreas,
    numQuestions,
    timeLimit,
    difficultyDistribution,
    year: selectedYear
  };

  onStart(config);
};
```

### 2. **Melhorar Função calculateScore**

```typescript
const calculateScore = async () => {
  try {
    // Validações mais robustas
    if (!sessionId) {
      throw new Error('ID da sessão não encontrado');
    }

    if (responses.size === 0) {
      throw new Error('Nenhuma resposta foi registrada');
    }

    if (items.length === 0) {
      throw new Error('Nenhuma questão foi carregada');
    }

    // Preparar dados de forma mais segura
    const responseData = {
      session_id: sessionId,
      responses: Array.from(responses.values()).filter(r => r && r.item_id),
      items: items.filter(item => item && item.item_id),
      config: config
    };

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Calculating score for session ID:', sessionId);
      console.log('Responses count:', responseData.responses.length);
      console.log('Items count:', responseData.items.length);
    }

    const response = await fetch('/api/enem/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Score calculation error:', errorText);
      throw new Error(`Failed to calculate score: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.score) {
      throw new Error('Resposta inválida da API de pontuação');
    }

    onComplete(data.score);
  } catch (error) {
    console.error('Error calculating score:', error);
    toast({
      title: "Erro",
      description: `Falha ao calcular pontuação: ${error.message}`,
      variant: "destructive"
    });
  }
};
```

### 3. **Melhorar Validação da API /api/enem/scores**

```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/enem/scores called');
    
    const body = await request.json();
    
    // Validações mais robustas
    const { session_id, responses, items, config } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'responses must be an array' }, { status: 400 });
    }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 });
    }

    if (!config) {
      return NextResponse.json({ error: 'config is required' }, { status: 400 });
    }

    // Validar estrutura das respostas
    for (const response of responses) {
      if (!response.item_id || !response.selected_answer) {
        return NextResponse.json({ 
          error: 'Invalid response structure: missing item_id or selected_answer' 
        }, { status: 400 });
      }
    }

    // Validar estrutura dos items
    for (const item of items) {
      if (!item.item_id || !item.correct_answer || !item.alternatives) {
        return NextResponse.json({ 
          error: 'Invalid item structure: missing required fields' 
        }, { status: 400 });
      }
    }

    // Resto da lógica de cálculo...
    const totalQuestions = items.length;
    const answeredQuestions = responses.length;
    let correctAnswers = 0;

    responses.forEach(response => {
      const item = items.find(item => item.item_id === response.item_id);
      if (item && response.selected_answer === item.correct_answer) {
        correctAnswers++;
      }
    });

    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const calculatedScore = Math.round(200 + (accuracy / 100) * 800);

    const score = {
      score_id: `score_${Date.now()}`,
      session_id: session_id,
      area_scores: {
        CN: { raw_score: calculatedScore, percentage: Math.round(accuracy), correct: correctAnswers, total: totalQuestions },
        CH: { raw_score: calculatedScore, percentage: Math.round(accuracy), correct: correctAnswers, total: totalQuestions },
        LC: { raw_score: calculatedScore, percentage: Math.round(accuracy), correct: correctAnswers, total: totalQuestions },
        MT: { raw_score: calculatedScore, percentage: Math.round(accuracy), correct: correctAnswers, total: totalQuestions }
      },
      total_score: calculatedScore,
      tri_estimated: {
        score: calculatedScore,
        confidence_interval: { lower: Math.max(200, calculatedScore - 50), upper: Math.min(1000, calculatedScore + 50) },
        disclaimer: 'Esta é uma estimativa baseada nas suas respostas. A pontuação oficial do ENEM depende de parâmetros específicos do exame completo.'
      },
      stats: {
        total_time_spent: 0,
        average_time_per_question: 0,
        accuracy_by_topic: {},
        difficulty_breakdown: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
        total_questions: totalQuestions,
        answered_questions: answeredQuestions,
        correct_answers: correctAnswers,
        accuracy_percentage: Math.round(accuracy)
      }
    };

    const feedback = {
      strengths: correctAnswers > 0 ? ['Você acertou algumas questões!'] : [],
      weaknesses: correctAnswers === 0 ? ['Tente revisar os conteúdos'] : [],
      recommendations: [
        'Continue praticando para melhorar seu desempenho',
        'Revise os tópicos das questões que você errou',
        'Faça mais simulados para se familiarizar com o formato'
      ],
      similarQuestions: []
    };

    return NextResponse.json({
      score,
      feedback,
      success: true
    });

  } catch (error) {
    console.error('Error in POST /api/enem/scores:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate score',
      success: false 
    }, { status: 500 });
  }
}
```

### 4. **Melhorar Validação da API de Sessão**

```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized - Please log in to access ENEM simulator' }, { status: 401 });
    }

    const userId = session?.user?.id || 'dev-user-123';
    const body: EnemSessionRequest = await request.json();
    
    // Validações mais robustas
    if (!body.mode) {
      return NextResponse.json({ error: 'mode is required' }, { status: 400 });
    }

    if (!body.area || !Array.isArray(body.area) || body.area.length === 0) {
      return NextResponse.json({ error: 'area must be a non-empty array' }, { status: 400 });
    }

    if (!body.config?.num_questions || body.config.num_questions < 5 || body.config.num_questions > 180) {
      return NextResponse.json({ error: 'num_questions must be between 5 and 180' }, { status: 400 });
    }

    // Validar áreas
    const validAreas = ['CN', 'CH', 'LC', 'MT'];
    for (const area of body.area) {
      if (!validAreas.includes(area)) {
        return NextResponse.json({ error: `Invalid area: ${area}` }, { status: 400 });
      }
    }

    // Resto da lógica...
    const examGenerator = new EnemExamGenerator();
    const examResult = await examGenerator.generateExam({
      mode: body.mode,
      areas: body.area as EnemArea[],
      numQuestions: body.config.num_questions,
      timeLimit: body.config.time_limit,
      difficultyDistribution: body.config.difficulty_distribution,
      randomSeed: `session_${Date.now()}`
    });

    // Resto da implementação...
    
  } catch (error) {
    console.error('Error creating ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to create session',
      success: false 
    }, { status: 500 });
  }
}
```

## Próximos Passos

1. **Implementar as correções** nos arquivos identificados
2. **Testar cada correção** individualmente
3. **Executar testes end-to-end** para validar as correções
4. **Documentar as mudanças** para futuras referências
5. **Monitorar logs** em produção para identificar novos problemas
