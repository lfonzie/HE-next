# Sistema de Aulas Aprimorado - Documentação Completa

## 📋 Visão Geral

O Sistema de Aulas Aprimorado transforma o módulo `/aulas` em um gerador profissional de aulas educacionais com pacing otimizado, integração com Unsplash e métricas precisas de qualidade.

## 🎯 Características Principais

### ✅ Implementado
- **Geração de conteúdo via OpenAI**: Prompts estruturados para 9 slides com mínimo 500 tokens
- **Integração Unsplash**: Imagens educacionais otimizadas automaticamente
- **Estimativas precisas**: Tempo, tokens e qualidade calculados automaticamente
- **Template plug-and-play**: Pronto para usar no pipeline de geração
- **Métricas de qualidade**: Validação automática e recomendações
- **Interface aprimorada**: Preview completo com métricas detalhadas

### 🔄 Funcionalidades
- **Modos síncrono/assíncrono**: Adaptação para diferentes contextos de ensino
- **Validação automática**: Verificação de estrutura e qualidade
- **Feedback rico**: Quizzes com explicações detalhadas
- **Otimização de custos**: Monitoramento de uso da OpenAI
- **Integração admin**: Estatísticas aprimoradas no painel administrativo

## 🚀 Instalação e Configuração

### 1. Dependências
```bash
npm install unsplash-js axios
```

### 2. Variáveis de Ambiente
Adicione ao `.env.local`:
```env
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

### 3. Estrutura de Arquivos
```
lib/
├── unsplash-enhanced.js      # Integração Unsplash otimizada
├── tokenEstimator.js         # Estimador de tokens e tempo
└── system-prompts/
    └── lessons-professional-pacing.ts  # Template profissional

app/
├── api/
│   ├── aulas/
│   │   └── generate/route.js  # API dedicada para geração
│   └── admin/
│       └── stats-enhanced/route.js  # Estatísticas aprimoradas
└── aulas-enhanced/
    └── page.tsx              # Interface aprimorada
```

## 📊 Métricas e Qualidade

### Tokens e Tempo
- **Mínimo**: 500 tokens por slide (≈375 palavras)
- **Total**: ~4.500 tokens de conteúdo
- **Tempo síncrono**: 45-50 minutos
- **Tempo assíncrono**: 30-35 minutos
- **Regra**: 0,75 palavra por token em PT-BR

### Validações Automáticas
- ✅ Exatamente 9 slides
- ✅ Mínimo 4.000 tokens totais
- ✅ Tempo entre 40-65 minutos
- ✅ Exatamente 2 quizzes
- ✅ Feedback rico em todos os quizzes

### Qualidade de Imagens
- **Resolução**: ~1200px (otimizada para web)
- **Tamanho**: 200-500 KB por imagem
- **Total**: ~2-4,5 MB por aula
- **Contexto**: Queries educacionais otimizadas

## 🎓 Template Plug-and-Play

### Estrutura de 9 Slides
1. **Abertura (4 min)**: Ativação + objetivos
2. **Conceito Principal (5 min)**: Fundamentos
3. **Desenvolvimento (5 min)**: Mecanismos
4. **Quiz 1 (4 min)**: Verificação com feedback rico
5. **Aplicação (5 min)**: Casos práticos
6. **Aprofundamento (5 min)**: Fatores limitantes
7. **Conexões (5 min)**: Contexto amplo
8. **Quiz 2 (4 min)**: Análise situacional
9. **Encerramento (3 min)**: Síntese + desafio

### Micro-pausas Integradas
- Checagem a cada 4-6 minutos
- Perguntas reflexivas
- Micro-tarefas de 2 minutos
- Conexões práticas

## 🔧 Uso da API

### Endpoint Principal
```javascript
POST /api/aulas/generate
```

### Parâmetros
```json
{
  "topic": "Fotossíntese",
  "mode": "sync", // "sync" ou "async"
  "schoolId": "escola123", // Opcional
  "customPrompt": "Instruções específicas" // Opcional
}
```

### Resposta
```json
{
  "success": true,
  "topic": "Fotossíntese",
  "mode": "sync",
  "slides": [...],
  "metrics": {
    "duration": { "sync": 45, "async": 32 },
    "content": { "totalTokens": 4500, "totalWords": 3375 },
    "quality": { "score": 95, "validSlides": 9 },
    "images": { "count": 9, "estimatedSizeMB": 3.15 }
  },
  "validation": {
    "isValid": true,
    "issues": [],
    "recommendations": [...]
  },
  "usage": {
    "totalTokens": 8500,
    "costEstimate": "0.2550"
  }
}
```

## 🎨 Interface do Usuário

### Página Principal (`/aulas-enhanced`)
- **Formulário**: Tópico, modo, escola, prompt customizado
- **Métricas**: Duração, tokens, qualidade, imagens
- **Preview**: Slides expandíveis com imagens
- **Ações**: Iniciar, baixar, compartilhar

### Componentes Principais
- `MetricsDisplay`: Exibição de métricas detalhadas
- `SlidePreview`: Preview individual de slides
- `PacingMetrics`: Métricas de pacing profissional

## 📈 Integração Admin

### Estatísticas Aprimoradas
```javascript
GET /api/admin/stats-enhanced
```

### Métricas Incluídas
- Total de aulas geradas
- Métricas de pacing por período
- Custos estimados da OpenAI
- Qualidade média das aulas
- Uso de imagens e tamanho

### Dashboard Admin
- Gráficos de crescimento
- Análise de custos
- Qualidade por matéria
- Tendências de uso

## 🔍 Exemplos de Uso

### Exemplo 1: Aula Básica
```javascript
const response = await fetch('/api/aulas/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Fotossíntese',
    mode: 'sync'
  })
});
```

### Exemplo 2: Aula Customizada
```javascript
const response = await fetch('/api/aulas/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Equações Quadráticas',
    mode: 'async',
    schoolId: 'escola123',
    customPrompt: 'Foque em aplicações práticas da matemática'
  })
});
```

### Exemplo 3: Validação de Qualidade
```javascript
import { validateSlideTokens, calculateLessonMetrics } from '@/lib/tokenEstimator';

const validation = validateSlideTokens(slide, 500);
const metrics = calculateLessonMetrics(slides, 'sync');

console.log('Qualidade:', metrics.qualityScore + '%');
console.log('Recomendações:', metrics.recommendations);
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de API do Unsplash
```
Error: Unsplash API errors: [{"type": "invalid_credentials"}]
```
**Solução**: Verificar `UNSPLASH_ACCESS_KEY` no `.env.local`

#### 2. Slides com poucos tokens
```
Warning: 3 slide(s) com menos de 500 tokens
```
**Solução**: Ajustar prompt ou usar template mais detalhado

#### 3. Imagens não carregam
```
Warning: Imagem não encontrada para slide 2
```
**Solução**: Verificar conectividade e queries de busca

### Logs de Debug
```javascript
// Habilitar logs detalhados
console.log('🎓 Gerando aula:', { topic, mode });
console.log('🖼️ Buscando imagens:', imageQuery);
console.log('📊 Métricas calculadas:', metrics);
```

## 🔮 Próximos Passos

### Integração Neo4j (Futuro)
- Prompts customizados por escola
- Histórico de aulas geradas
- Análise de padrões de uso

### Melhorias Planejadas
- Templates por disciplina
- Integração com LMS
- Analytics avançados
- Exportação em múltiplos formatos

### Otimizações
- Cache de imagens
- Compressão automática
- CDN para distribuição
- Lazy loading avançado

## 📞 Suporte

### Verificação de Saúde
```bash
# Testar API
curl -X POST http://localhost:3000/api/aulas/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Teste", "mode": "sync"}'

# Verificar estatísticas
curl http://localhost:3000/api/admin/stats-enhanced
```

### Monitoramento
- Logs de geração de aulas
- Métricas de performance
- Custos da OpenAI
- Qualidade das imagens

## 📚 Referências

- [Unsplash API Documentation](https://unsplash.com/developers)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Database Client](https://www.prisma.io/docs)

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: Next.js 14+, Node.js 18+
