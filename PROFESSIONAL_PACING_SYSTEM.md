# Sistema de Pacing Profissional para Aulas

## 📊 Visão Geral

Este sistema implementa um template profissional para geração de aulas com pacing otimizado de 45-60 minutos, baseado em métricas precisas de tokens, palavras e tempo.

## 🎯 Características Principais

### Métricas Garantidas
- **Mínimo 500 tokens por slide** (≈375 palavras)
- **Total estimado**: ~4.500 tokens de conteúdo + metadados = ~5.500-7.000 tokens por aula
- **Tempo síncrono**: 45-50 minutos
- **Tempo assíncrono**: 30-35 minutos
- **Regra de conversão**: 0,75 palavra por token em português brasileiro

### Estrutura de 9 Slides
1. **Abertura (4 min)**: Ativação de conhecimentos prévios + objetivo
2. **Conceito Principal (5 min)**: Visão geral e fundamentos
3. **Desenvolvimento (5 min)**: Detalhamento e mecanismos
4. **Quiz 1 (4 min)**: Múltipla escolha com feedback rico
5. **Aplicação (5 min)**: Casos práticos e exemplos reais
6. **Aprofundamento (5 min)**: Fatores limitantes e variações
7. **Conexões (5 min)**: Adaptações e contexto amplo
8. **Quiz 2 (4 min)**: Questão situacional com análise
9. **Encerramento (3 min)**: Síntese + erro comum + desafio aplicado

## 🚀 Como Usar

### API Endpoint Principal
```typescript
POST /api/generate-lesson-professional
```

### Parâmetros
```json
{
  "topic": "Fotossíntese",
  "pacingMode": "professional", // "professional" | "photosynthesis" | "custom"
  "demoMode": false,
  "subject": "Ciências",
  "grade": 9
}
```

### Modos de Pacing Disponíveis

#### 1. Modo Profissional (`professional`)
- Template genérico para qualquer tópico
- Pacing otimizado de 45-60 minutos
- Métricas padrão aplicadas

#### 2. Modo Fotossíntese (`photosynthesis`)
- Template específico para fotossíntese
- Pacing detalhado com exemplos específicos
- Conexões com agricultura e mudanças climáticas

#### 3. Modo Customizado (`custom`)
- Permite definir pacing personalizado
- Requer parâmetro `customPacing`

## 📝 Estrutura de Resposta

```json
{
  "success": true,
  "lesson": {
    "title": "Aula Profissional: [Tema]",
    "subject": "Matéria inferida",
    "grade": 9,
    "duration": {
      "synchronous": "45-50 minutos",
      "asynchronous": "30-35 minutos",
      "totalTokens": "5.500-7.000 tokens estimados"
    },
    "slides": [
      {
        "slideNumber": 1,
        "type": "introduction",
        "title": "Abertura: [Tema] e sua Importância",
        "content": "Conteúdo detalhado...",
        "microPause": "Pergunta reflexiva integrada",
        "imagePrompt": "Prompt para Unsplash",
        "timeEstimate": 4,
        "tokenTarget": 500
      }
    ]
  },
  "pacingMetrics": {
    "totalTokens": 4500,
    "totalWords": 3375,
    "synchronousTime": 45,
    "asynchronousTime": 32,
    "tokenPerSlide": 500,
    "wordsPerSlide": 375
  }
}
```

## 🎓 Metodologia Educacional

### Micro-pausas Integradas
- Checagem de entendimento a cada 4-6 minutos
- Perguntas reflexivas: "O que acontece se...?", "Por que...?"
- Conexões práticas com o cotidiano do estudante

### Feedback Rico em Quizzes
```json
{
  "feedbackRich": {
    "correct": "Excelente! Você aplicou corretamente o conceito...",
    "incorrect": "Não foi desta vez, mas vamos entender o porquê...",
    "followUp": "Para aprofundar: Como isso se relaciona com...?"
  }
}
```

### Diretrizes para Imagens
- **1-2 imagens por slide**, sempre legendadas
- **Prompts específicos** para Unsplash
- **Solicitar observações**: "Localize o [elemento] na figura"
- **Resolução otimizada**: máximo 1200px (200-500 KB por imagem)

## 🔧 Funções Utilitárias

### Cálculo de Métricas
```typescript
import { calculatePacingMetrics } from '@/lib/system-prompts/lessons-professional-pacing'

const metrics = calculatePacingMetrics(slides)
// Retorna: totalTokens, totalWords, synchronousTime, asynchronousTime, etc.
```

### Validação de Pacing
```typescript
import { validateProfessionalPacing } from '@/lib/system-prompts/lessons-professional-pacing'

const validation = validateProfessionalPacing(lessonData)
if (!validation.isValid) {
  console.warn('Problemas detectados:', validation.issues)
}
```

## 📊 Exemplo de Pacing para Fotossíntese

### Slide 1 - Abertura (4 min)
- **Ativação**: "Onde você vê plantas crescendo?"
- **Objetivo**: Entender a importância da fotossíntese
- **Micro-pausa**: "Que plantas você conhece que fazem fotossíntese?"

### Slide 2 - Conceito Principal (5 min)
- **Equação global**: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂
- **Cloroplastos**: estrutura e função
- **Micro-pausa**: "Como você explicaria fotossíntese para um amigo?"

### Slide 3 - Desenvolvimento (5 min)
- **Fase clara**: tilacóides, fotossistemas, ATP/NADPH
- **Processo detalhado**: absorção de luz, transporte de elétrons
- **Micro-pausa**: "Qual etapa você considera mais importante?"

### Slide 4 - Quiz 1 (4 min)
- **Pergunta**: "O que acontece se dobrarmos a intensidade luminosa?"
- **Feedback rico**: Explicação detalhada de cada alternativa
- **Conexão**: Relação com produtividade agrícola

### Slide 5 - Aplicação (5 min)
- **Ciclo de Calvin**: fixação do CO₂, RuBisCO, G3P
- **Exemplos práticos**: plantas C3, agricultura tradicional
- **Micro-pausa**: "Dê um exemplo de planta C3 que você conhece"

### Slide 6 - Aprofundamento (5 min)
- **Balanço energético**: custos e benefícios
- **Fatores limitantes**: luz, CO₂, temperatura
- **Micro-pausa**: "O que aconteceria se a temperatura fosse muito alta?"

### Slide 7 - Conexões (5 min)
- **Adaptações**: C3, C4, CAM
- **Contexto amplo**: agricultura tropical, mudanças climáticas
- **Micro-pausa**: "Como isso se conecta com a agricultura?"

### Slide 8 - Quiz 2 (4 min)
- **Análise situacional**: gráfico taxa × intensidade luminosa
- **Feedback rico**: Interpretação de dados e aplicação de conceitos
- **Desafio**: "Como você aplicaria isso em uma estufa?"

### Slide 9 - Encerramento (3 min)
- **Síntese**: Pontos principais aprendidos
- **Erro comum**: Confundir fotossíntese com respiração
- **Mini-desafio**: "Desenhe o ciclo da fotossíntese em 3 passos"

## 🎨 Integração com Unsplash

### Prompts Específicos por Slide
- **Slide 1**: "plantas crescendo, jardim, natureza"
- **Slide 2**: "cloroplastos microscópicos, células vegetais"
- **Slide 3**: "tilacóides, fotossistemas, estrutura molecular"
- **Slide 4**: "luz solar, intensidade luminosa, experimento"
- **Slide 5**: "ciclo de Calvin, moléculas, processo bioquímico"
- **Slide 6**: "gráficos científicos, dados experimentais"
- **Slide 7**: "plantas C4, milho, agricultura tropical"
- **Slide 8**: "gráfico taxa fotossíntese, análise científica"
- **Slide 9**: "síntese visual, resumo conceitual"

## ⚡ Performance e Otimização

### Cache de Imagens
- **Lazy loading** implementado
- **Compressão automática** para web
- **CDN** para distribuição global

### Métricas de Transferência
- **Total estimado**: ~2-4,5 MB por aula
- **Por imagem**: 200-500 KB
- **Com cache**: Redução significativa em acessos subsequentes

## 🔍 Validação e Qualidade

### Validações Automáticas
- ✅ Exatamente 9 slides
- ✅ Mínimo 4000 tokens totais
- ✅ Tempo entre 40-65 minutos
- ✅ Exatamente 2 quizzes
- ✅ Feedback rico em todos os quizzes
- ✅ Explicações detalhadas (mínimo 100 caracteres)

### Warnings de Qualidade
- ⚠️ Tokens muito baixos
- ⚠️ Tempo fora do ideal
- ⚠️ Feedback insuficiente
- ⚠️ Explicações muito curtas

## 🚀 Próximos Passos

1. **Teste o sistema** com diferentes tópicos
2. **Ajuste métricas** baseado no feedback
3. **Expanda templates** para outras disciplinas
4. **Implemente analytics** de engajamento
5. **Otimize performance** de geração

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do console
- Valide métricas de pacing
- Teste com diferentes modos
- Consulte exemplos de uso
