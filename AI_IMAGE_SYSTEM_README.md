# Sistema de Busca e Classificação de Imagens com IA

## 🚀 Visão Geral

O sistema agora usa **Inteligência Artificial** para fazer a pesquisa e classificação de imagens, tornando o processo muito mais inteligente e preciso.

## 🤖 Componentes do Sistema

### 1. **AI Search** (`/api/images/ai-search`)
- **Função**: Gera queries otimizadas usando IA
- **Entrada**: Tema da aula (ex: "Como funciona o cérebro?")
- **Saída**: Queries inteligentes (ex: ["human brain anatomy", "brain neural network", "brain cross section"])
- **IA**: Gemini 1.5 Flash

### 2. **AI Classification** (`/api/images/ai-classification`)
- **Função**: Analisa e classifica imagens usando IA
- **Entrada**: Lista de imagens + tema
- **Saída**: Análise detalhada de cada imagem com scores e reasoning
- **IA**: Gemini 1.5 Flash

### 3. **AI Powered Search** (`/api/images/ai-powered-search`)
- **Função**: Sistema principal que integra tudo
- **Processo**:
  1. Gera queries inteligentes com IA
  2. Busca imagens em múltiplos provedores
  3. Classifica imagens com IA
  4. Seleciona as melhores imagens

## 📊 Análise de IA

Para cada imagem, a IA fornece:

```json
{
  "relevanceScore": 0-100,     // Relevância para o tema
  "educationalValue": 0-100,   // Valor educacional
  "appropriateness": 0-100,   // Adequação para educação
  "reasoning": "Explicação",   // Justificativa da análise
  "isRelevant": true/false,   // Se deve ser incluída
  "category": "anatomy"       // Categoria do conteúdo
}
```

## 🎯 Critérios de Análise

A IA analisa cada imagem baseada em:

1. **RELEVÂNCIA**: A imagem está diretamente relacionada ao tema?
2. **VALOR EDUCACIONAL**: A imagem ajuda no aprendizado?
3. **ADEQUAÇÃO**: A imagem é apropriada para ambiente educacional?
4. **QUALIDADE**: A imagem é clara e informativa?

## 🔄 Fluxo de Funcionamento

```
Tema: "Como funciona o cérebro?"
    ↓
IA gera queries: ["human brain anatomy", "brain neural network", "brain cross section"]
    ↓
Busca em Unsplash, Pixabay, Wikimedia
    ↓
IA analisa cada imagem encontrada
    ↓
IA classifica: relevante/irrelevante + scores
    ↓
Seleciona as melhores imagens
    ↓
Retorna imagens otimizadas para a aula
```

## ✅ Benefícios

### **Antes (Sistema Manual)**:
- ❌ Queries genéricas ("sistema solar")
- ❌ Filtros baseados em palavras-chave
- ❌ Rejeição de imagens válidas
- ❌ Aceitação de imagens irrelevantes

### **Agora (Sistema com IA)**:
- ✅ Queries inteligentes e específicas
- ✅ Análise semântica profunda
- ✅ Classificação contextual precisa
- ✅ Reasoning explicado para cada decisão

## 🎓 Exemplos de Melhoria

### **Tema: "Como funciona o cérebro?"**

**Antes**:
- Query: "cerebro" (genérica)
- Resultado: Imagens irrelevantes aceitas, válidas rejeitadas

**Agora**:
- Queries: ["human brain anatomy", "brain neural network", "brain cross section"]
- Análise: IA avalia cada imagem contextualmente
- Resultado: Apenas imagens relevantes e educacionais

### **Tema: "Sistema solar"**

**Antes**:
- Query: "sistema solar"
- Problema: Imagens do Lake Como confundidas

**Agora**:
- Queries: ["solar system planets", "sun and planets", "planetary orbits"]
- Análise: IA distingue astronomia de geografia
- Resultado: Apenas imagens astronômicas

## 🔧 Integração

O sistema está integrado ao gerador de aulas (`/api/aulas/generate-gemini`) e substitui o sistema anterior de busca manual.

## 📈 Métricas

O sistema agora fornece métricas detalhadas:
- Total de imagens encontradas
- Quantas foram classificadas como relevantes
- Scores de relevância, valor educacional e adequação
- Reasoning para cada decisão

## 🚀 Próximos Passos

1. **Monitoramento**: Acompanhar performance da IA
2. **Otimização**: Ajustar prompts baseado nos resultados
3. **Expansão**: Adicionar mais provedores de imagem
4. **Melhoria**: Refinar critérios de análise
